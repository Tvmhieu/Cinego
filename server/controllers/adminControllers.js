import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import User from "../models/User.js";

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
      .sort();

    res.json({ success: true, shows });
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
