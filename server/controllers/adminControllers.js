import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import User from "../models/User.js";
import Movie from "../models/Movie.js";
import { clerkClient } from "@clerk/express";
import mongoose from "mongoose";

export const toggleMovieBanner = async (req, res) => {
  try {
    const { movieId, isBanner } = req.body;
    const movie = await Movie.findById(movieId);
    
    if (!movie) {
      return res.json({ success: false, message: "Movie not found" });
    }
    
    movie.isBanner = isBanner;
    await movie.save();
    
    res.json({ success: true, message: `Banner status updated for ${movie.title}` });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export const getAllMovies = async (req, res) => {
  try {
    const activeMovieIds = await Show.distinct("movie");
    const movies = await Movie.find({
      $or: [
        { _id: { $in: activeMovieIds } },
        { isBanner: true }
      ]
    });

    const allShows = await Show.find({ movie: { $in: movies.map(m => m._id) } });

    const moviesWithShows = movies.map(movie => {
      const movieShows = allShows.filter(show => show.movie.toString() === movie._id.toString());
      const showDates = [...new Set(movieShows.map(show => new Date(show.showDateTime).toLocaleDateString("vi-VN")))];
      
      return {
        ...movie.toObject(),
        showCount: movieShows.length,
        showDates: showDates.length > 3 ? `${showDates.slice(0, 3).join(", ")}... (+${showDates.length - 3})` : showDates.join(", ")
      };
    });

    res.json({ success: true, movies: moviesWithShows });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

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

    // Calculate unique movies having active shows
    const activeMovieIds = [...new Set(activeShows.map(show => show.movie._id.toString()))];
    const activeMoviesCount = activeMovieIds.length;

    // Calculate movie performance
    const movieStats = {};

    bookings.forEach((booking) => {
      const show = activeShows.find((s) => s._id.toString() === booking.show.toString()) || null;
    });

    // Actually let's fetch all shows and populate movies to calculate overall performance
    const allShows = await Show.find({}).populate("movie");
    const showToMovieMap = {};
    const showCountMap = {};

    allShows.forEach(show => {
      if (show.movie) {
        showToMovieMap[show._id.toString()] = show.movie.title;
        showCountMap[show.movie.title] = (showCountMap[show.movie.title] || 0) + 1;
      }
    });

    bookings.forEach((booking) => {
      const movieTitle = showToMovieMap[booking.show.toString()];
      if (movieTitle) {
        if (!movieStats[movieTitle]) {
          movieStats[movieTitle] = { 
            title: movieTitle, 
            ticketsSold: 0, 
            revenue: 0, 
            showCount: showCountMap[movieTitle] || 0,
            ticketDetails: {} // To store price and seats info
          };
        }
        movieStats[movieTitle].ticketsSold += booking.bookedSeats?.length || 0;
        movieStats[movieTitle].revenue += booking.amount || 0;
        
        // Group by ticket price
        const pricePerSeat = booking.amount / (booking.bookedSeats?.length || 1);
        if (!movieStats[movieTitle].ticketDetails[pricePerSeat]) {
          movieStats[movieTitle].ticketDetails[pricePerSeat] = {
            count: 0,
            seats: []
          };
        }
        movieStats[movieTitle].ticketDetails[pricePerSeat].count += booking.bookedSeats?.length || 0;
        movieStats[movieTitle].ticketDetails[pricePerSeat].seats.push(...(booking.bookedSeats || []));
      }
    });

    const moviePerformance = Object.values(movieStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10); // top 10 movies

    const dashboardData = {
      totalBookings: bookings.length,
      totalRevenue: bookings.reduce((acc, booking) => acc + booking.amount, 0),
      activeShows,
      activeMoviesCount,
      moviePerformance,
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
    const { showId, reason } = req.body;
    const { userId: clerkId } = req.auth();
    
    if (!reason || reason.trim() === "") {
      return res.json({ success: false, message: "Vui lòng nhập lý do hủy suất chiếu" });
    }

    const admin = await User.findOne({ clerkId });
    const adminName = admin?.firstName ? `${admin.firstName} ${admin.lastName || ''}` : "Admin";

    const show = await Show.findById(showId);
    if (!show) {
      return res.json({ success: false, message: "Không tìm thấy suất chiếu" });
    }

    // Cancel all associated bookings (paid and unpaid)
    const bookings = await Booking.find({ show: showId, isCancelled: false });
    for (const booking of bookings) {
      booking.isCancelled = true;
      booking.cancellationReason = `Suất chiếu bị hủy. Lý do: ${reason.trim()} (Bởi: ${adminName})`;
      await booking.save();
    }

    // Mark show as cancelled
    show.isCancelled = true;
    show.cancellationReason = `Hủy bởi: ${adminName}. Lý do: ${reason.trim()}`;
    show.occupiedSeats = {}; // Release all seats
    show.markModified("occupiedSeats");
    await show.save();

    res.json({ success: true, message: "Hủy suất chiếu thành công" });
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
    
    const booking = await Booking.findOne({
      $or: [
        { bookingCode: bookingId },
        ...(mongoose.Types.ObjectId.isValid(bookingId) ? [{ _id: bookingId }] : [])
      ]
    }).populate("show");
    
    if (!booking) {
      return res.json({ success: false, message: "Không tìm thấy vé" });
    }
    
    if (!booking.isPaid) {
      return res.json({ success: false, message: "Vé này chưa được thanh toán" });
    }
    
    // If we are checking in (changing false to true), enforce the 15-minute rule
    if (!booking.isCheckedIn) {
      const showDate = new Date(booking.show.showDateTime);
      const now = new Date();
      const diffMins = (showDate - now) / (1000 * 60);
      
      if (diffMins > 15) {
        return res.json({ success: false, message: "Chỉ được phép soát vé trước giờ chiếu 15 phút!" });
      }
    }
    
    booking.isCheckedIn = !booking.isCheckedIn;
    await booking.save();
    
    res.json({ success: true, message: booking.isCheckedIn ? "Đã soát vé thành công" : "Đã hủy soát vé", isCheckedIn: booking.isCheckedIn });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get booking details for scanning
export const getBookingByCode = async (req, res) => {
  try {
    const { code } = req.params;
    
    const booking = await Booking.findOne({
      $or: [
        { bookingCode: code },
        ...(mongoose.Types.ObjectId.isValid(code) ? [{ _id: code }] : [])
      ]
    }).populate({ path: "show", populate: { path: "movie" } }).populate("user");
    
    if (!booking) {
      return res.json({ success: false, message: "Không tìm thấy vé hợp lệ" });
    }
    
    res.json({ success: true, booking });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to scan a ticket (does not auto-checkin anymore)
export const scanTicket = async (req, res) => {
  try {
    const { code } = req.body;
    
    const booking = await Booking.findOne({
      $or: [
        { bookingCode: code },
        ...(mongoose.Types.ObjectId.isValid(code) ? [{ _id: code }] : [])
      ]
    }).populate({ path: "show", populate: { path: "movie" } }).populate("user");
    
    if (!booking) {
      return res.json({ success: false, status: "NOT_FOUND", message: "Vé không tồn tại trên hệ thống" });
    }
    
    if (booking.isCancelled) {
      return res.json({ success: false, status: "CANCELLED", message: "Vé này đã bị hủy", booking });
    }

    if (!booking.isPaid) {
      return res.json({ success: false, status: "UNPAID", message: "Vé chưa được thanh toán", booking });
    }
    
    if (booking.isCheckedIn) {
      return res.json({ success: false, status: "USED", message: "Vé này đã được sử dụng", booking });
    }
    
    // Check 15-minute rule
    const showDate = new Date(booking.show.showDateTime);
    const now = new Date();
    const diffMins = (showDate - now) / (1000 * 60);
    
    if (diffMins > 15) {
      return res.json({ success: false, status: "TOO_EARLY", message: "Chưa đến giờ. Chỉ được duyệt trước 15 phút.", booking });
    }
    
    // Valid and ready for manual check-in
    return res.json({ success: true, status: "VALID", message: "Vé hợp lệ, sẵn sàng duyệt vào rạp!", booking });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to cancel booking by Admin
export const adminCancelBooking = async (req, res) => {
  try {
    const { bookingId, reason } = req.body;
    
    if (!reason || reason.trim() === "") {
      return res.json({ success: false, message: "Bắt buộc phải nhập lý do hủy vé" });
    }
    
    // Clerk user info injected from auth middleware
    const { userId } = req.auth();
    const adminUser = await clerkClient.users.getUser(userId);
    const adminName = `${adminUser.firstName || ''} ${adminUser.lastName || ''}`.trim() || "Admin";
    const adminEmail = adminUser.emailAddresses[0]?.emailAddress || "Không rõ Email";

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.json({ success: false, message: "Không tìm thấy vé" });
    }

    if (booking.isCancelled) {
      return res.json({ success: false, message: "Vé này đã bị hủy từ trước" });
    }

    // Release seats atomically using $unset
    const unsetSeats = {};
    booking.bookedSeats.forEach((seat) => {
      unsetSeats[`occupiedSeats.${seat}`] = 1;
    });
    
    if (Object.keys(unsetSeats).length > 0) {
      await Show.findByIdAndUpdate(booking.show, { $unset: unsetSeats });
    }

    booking.isCancelled = true;
    booking.cancellationReason = `Lý do: ${reason.trim()} - (Hủy bởi: ${adminName} - ${adminEmail})`;
    await booking.save();

    res.json({ success: true, message: "Đã hủy vé thành công" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to bulk delete shows
export const bulkCancelShows = async (req, res) => {
  try {
    const { showIds, reason } = req.body;
    const { userId: clerkId } = req.auth();

    if (!Array.isArray(showIds) || showIds.length === 0) {
      return res.json({ success: false, message: "Danh sách suất chiếu trống" });
    }
    
    if (!reason || reason.trim() === "") {
      return res.json({ success: false, message: "Vui lòng nhập lý do hủy suất chiếu" });
    }

    const admin = await User.findOne({ clerkId });
    const adminName = admin?.firstName ? `${admin.firstName} ${admin.lastName || ''}` : "Admin";

    let cancelledCount = 0;

    for (const showId of showIds) {
      const show = await Show.findById(showId);
      if (!show || show.isCancelled) continue;

      const bookings = await Booking.find({ show: showId, isCancelled: false });
      for (const booking of bookings) {
        booking.isCancelled = true;
        booking.cancellationReason = `Suất chiếu bị hủy (Hàng loạt). Lý do: ${reason.trim()} (Bởi: ${adminName})`;
        await booking.save();
      }

      show.isCancelled = true;
      show.cancellationReason = `Hủy hàng loạt bởi: ${adminName}. Lý do: ${reason.trim()}`;
      show.occupiedSeats = {};
      show.markModified("occupiedSeats");
      await show.save();
      
      cancelledCount++;
    }

    res.json({ 
      success: true, 
      message: `Đã hủy thành công ${cancelledCount} suất chiếu.` 
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to bulk cancel bookings
export const bulkCancelBookings = async (req, res) => {
  try {
    const { bookingIds } = req.body;
    const { userId: clerkId } = req.auth();
    if (!Array.isArray(bookingIds) || bookingIds.length === 0) {
      return res.json({ success: false, message: "Danh sách vé trống" });
    }

    const admin = await User.findOne({ clerkId });
    const adminName = admin?.firstName ? `${admin.firstName} ${admin.lastName || ''}` : "Admin";
    const adminEmail = admin?.email || "N/A";

    let cancelledCount = 0;

    for (const bookingId of bookingIds) {
      const booking = await Booking.findById(bookingId);
      if (!booking || booking.isCancelled) continue;

      const show = await Show.findById(booking.show);
      if (show) {
        booking.bookedSeats.forEach((seat) => {
          delete show.occupiedSeats[seat];
        });
        show.markModified("occupiedSeats");
        await show.save();
      }

      booking.isCancelled = true;
      booking.cancellationReason = `Xóa hàng loạt (Bởi: ${adminName} - ${adminEmail})`;
      await booking.save();
      cancelledCount++;
    }

    res.json({ success: true, message: `Đã hủy thành công ${cancelledCount} vé` });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};
