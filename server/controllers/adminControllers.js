import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import User from "../models/User.js";
import { clerkClient } from "@clerk/express";

// API to check if user is admin
export const isAdmin = async (req, res) => {
  res.json({ success: true, isAdmin: true });
};

// API to get dashboard data
export const getDashboardData = async (req, res) => {
  try {
    const bookings = await Booking.find({ isPaid: true });
    const activeShows = await Show.find({
      showDateTime: { $gte: new Date() },
    }).populate("movie");

    const totalUser = await User.countDocuments();

    const dashboardData = {
      totalBookings: bookings.length,
      totalRevenue: bookings.reduce((acc, booking) => acc + booking.amount, 0),
      activeShows,
      totalUser,
    };

    res.json({ success: true, dashboardData });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all shows
export const getAllShows = async (req, res) => {
  try {
    const shows = await Show.find({
      // showDateTime: { $gte: new Date() },
    })
      .populate("movie")
      .sort({ showDateTime: -1 });

    const showsWithRevenue = await Promise.all(
      shows.map(async (show) => {
        const paidBookings = await Booking.find({ show: show._id, isPaid: true });
        const revenue = paidBookings.reduce((acc, b) => acc + (b.amount || 0), 0);
        const paidTickets = paidBookings.reduce((acc, b) => acc + (b.bookedSeats?.length || 0), 0);
        return {
          ...show.toObject(),
          revenue,
          paidTickets,
        };
      })
    );

    res.json({ success: true, shows: showsWithRevenue });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all bookings
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate("user")
      .populate({ path: "show", populate: { path: "movie" } })
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to cancel a show
export const cancelShow = async (req, res) => {
  try {
    const { showId } = req.body;
    
    // Check if there are paid bookings for this show
    const bookings = await Booking.find({ show: showId, isPaid: true });
    if (bookings.length > 0) {
      return res.json({ success: false, message: "Không thể xóa suất chiếu đã có khách thanh toán" });
    }

    // Delete associated unpaid bookings
    await Booking.deleteMany({ show: showId });

    // Delete the show
    await Show.findByIdAndDelete(showId);

    res.json({ success: true, message: "Xóa suất chiếu thành công" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all users and their roles
export const getAllUsers = async (req, res) => {
  try {
    const users = await clerkClient.users.getUserList();
    
    const formattedUsers = users.data.map(user => ({
      _id: user.id,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Người dùng',
      email: user.emailAddresses[0]?.emailAddress,
      role: user.privateMetadata?.role || "user",
      image: user.imageUrl,
    }));
    
    res.json({ success: true, users: formattedUsers });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to update user role
export const updateUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;
    
    if (role !== "admin" && role !== "user") {
      return res.json({ success: false, message: "Role không hợp lệ" });
    }
    
    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: {
        role: role === "admin" ? "admin" : null
      }
    });
    
    res.json({ success: true, message: "Cập nhật quyền thành công" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to check-in a booking
export const checkInBooking = async (req, res) => {
  try {
    const { bookingId } = req.body;
    
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.json({ success: false, message: "Không tìm thấy vé" });
    }
    
    if (!booking.isPaid) {
      return res.json({ success: false, message: "Vé này chưa được thanh toán" });
    }
    
    booking.isCheckedIn = !booking.isCheckedIn;
    await booking.save();
    
    res.json({ success: true, message: booking.isCheckedIn ? "Đã soát vé thành công" : "Đã hủy soát vé", isCheckedIn: booking.isCheckedIn });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};
