import { inngest } from "../inngest/index.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import { createVnpayUrl } from "./vnpayController.js";

// Function to check availability of selected seats for a movie
const checkSeatsAvailability = async (showId, selectedSeats) => {
  try {
    const showData = await Show.findById(showId);
    if (!showData) return false;

    const occupiedSeats = showData.occupiedSeats;

    const isAnySeatTaken = selectedSeats.some((seat) => occupiedSeats[seat]);

    return !isAnySeatTaken;
  } catch (error) {
    console.log(error.message);
    return false;
  }
};

export const createBooking = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { showId, selectedSeats, customerName, customerPhone } = req.body;
    const { origin } = req.headers;

    if (!customerName || !customerPhone) {
      return res.json({ success: false, message: "Vui lòng nhập họ tên và số điện thoại" });
    }

    // Check if the seat is available for the selected show
    const isAvailable = await checkSeatsAvailability(showId, selectedSeats);

    if (!isAvailable) {
      return res.json({
        success: false,
        message: "Selected Seats are not available",
      });
    }

    // Get the show details
    const showData = await Show.findById(showId).populate("movie");

    const bookingCode = "DH" + Math.floor(100000 + Math.random() * 900000);

    // Create a new booking
    const booking = await Booking.create({
      user: userId,
      show: showId,
      amount: showData.showPrice * selectedSeats.length,
      bookedSeats: selectedSeats,
      bookingCode: bookingCode,
      isPaid: false,
      customerName,
      customerPhone,
    });

    selectedSeats.map((seat) => {
      showData.occupiedSeats[seat] = userId;
    });

    showData.markModified("occupiedSeats");
    await showData.save();

    // Run Inngest Scheduler Function to check payment status after 10 minutes (Optional, could just be auto-cancel)
    try {
      if (process.env.INNGEST_EVENT_KEY && process.env.INNGEST_EVENT_KEY !== 'your_inngest_event_key') {
        await inngest.send({
          name: "app/checkpayment",
          data: {
            bookingId: booking._id.toString(),
          },
        });
      }
    } catch (err) {
      console.warn("Skipping background check payment task (Inngest keys missing)");
    }

    res.json({ success: true, bookingId: booking._id });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const getOccupiedSeats = async (req, res) => {
  try {
    const { showId } = req.params;
    const showData = await Show.findById(showId);

    const occupiedSeats = Object.keys(showData.occupiedSeats);

    res.json({ success: true, occupiedSeats });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// API to get booking details by ID (for payment page)
export const getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId)
      .populate({ path: "show", populate: { path: "movie" } });

    if (!booking) {
      return res.json({ success: false, message: "Booking not found" });
    }

    res.json({ success: true, booking });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// API for admin to confirm payment manually
export const confirmPayment = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { isPaid: true, paymentLink: "" },
      { new: true }
    );

    if (!booking) {
      return res.json({ success: false, message: "Booking not found" });
    }

    // Send Confirmation Email via Inngest
    try {
      if (process.env.INNGEST_EVENT_KEY && process.env.INNGEST_EVENT_KEY !== 'your_inngest_event_key') {
        await inngest.send({
          name: "app/show.booked",
          data: { bookingId: booking._id.toString() },
        });
      }
    } catch (err) {
      console.warn("Skipping confirmation email task (Inngest keys missing)");
    }

    res.json({ success: true, message: "Payment confirmed successfully" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// API for SePay Webhook
export const sepayWebhook = async (req, res) => {
  try {
    const { transferType, content, transferAmount } = req.body;
    
    // Check if it's an incoming transfer
    if (transferType !== "in" || !content) {
      return res.json({ success: true });
    }

    // Extract bookingCode from content (e.g. DH123456)
    const match = content.match(/DH\d{6}/i);
    if (!match) {
      return res.json({ success: true, message: "No booking code found" });
    }
    const bookingCode = match[0].toUpperCase();

    const booking = await Booking.findOne({ bookingCode });
    if (!booking) {
      return res.json({ success: true, message: "Booking not found" });
    }

    if (booking.isPaid) {
      return res.json({ success: true, message: "Already paid" });
    }

    // Verify amount
    if (parseInt(transferAmount) >= booking.amount) {
      booking.isPaid = true;
      await booking.save();
      
      // Send Confirmation Email via Inngest (only if it wasn't cancelled)
      if (!booking.isCancelled) {
        try {
          if (process.env.INNGEST_EVENT_KEY && process.env.INNGEST_EVENT_KEY !== 'your_inngest_event_key') {
            await inngest.send({
              name: "app/show.booked",
              data: { bookingId: booking._id.toString() },
            });
          }
        } catch (err) {
          console.warn("Skipping confirmation email task (Inngest keys missing)");
        }
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API for user to cancel unpaid booking
export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.auth().userId;

    const booking = await Booking.findOne({ _id: bookingId, user: userId });
    
    if (!booking) {
      return res.json({ success: false, message: "Không tìm thấy vé" });
    }

    if (booking.isPaid) {
      return res.json({ success: false, message: "Không thể hủy vé đã thanh toán" });
    }

    // Release seats
    const show = await Show.findById(booking.show);
    if (show) {
      booking.bookedSeats.forEach((seat) => {
        delete show.occupiedSeats[seat];
      });
      show.markModified("occupiedSeats");
      await show.save();
    }

    booking.isCancelled = true;
    await booking.save();

    res.json({ success: true, message: "Đã hủy vé thành công" });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};
