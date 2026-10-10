import express from "express";
import { protectAdmin } from "../middleware/auth.js";
import {
  cancelShow,
  getAllBookings,
  getAllShows,
  getDashboardData,
  isAdmin,
  getAllUsers,
  updateUserRole,
  checkInBooking,
  getBookingByCode,
  scanTicket,
  toggleMovieBanner,
  getAllMovies,
  adminCancelBooking,
  bulkCancelShows,
  bulkCancelBookings,
} from "../controllers/adminControllers.js";
import { confirmPayment } from "../controllers/bookingControllers.js";

const adminRouter = express.Router();

adminRouter.get("/is-admin", protectAdmin, isAdmin);
adminRouter.get("/dashboard", protectAdmin, getDashboardData);
adminRouter.get("/all-shows", protectAdmin, getAllShows);
adminRouter.get("/all-bookings", protectAdmin, getAllBookings);
adminRouter.post("/confirm-payment", protectAdmin, confirmPayment);
adminRouter.post("/cancel-show", protectAdmin, cancelShow);
adminRouter.get("/users", protectAdmin, getAllUsers);
adminRouter.post("/update-role", protectAdmin, updateUserRole);
adminRouter.post("/check-in", protectAdmin, checkInBooking);
adminRouter.get("/booking/:code", protectAdmin, getBookingByCode);
adminRouter.post("/scan-ticket", protectAdmin, scanTicket);
adminRouter.post("/toggle-banner", protectAdmin, toggleMovieBanner);
adminRouter.get("/movies", protectAdmin, getAllMovies);
adminRouter.post("/cancel-booking", protectAdmin, adminCancelBooking);
adminRouter.post("/bulk-cancel-shows", protectAdmin, bulkCancelShows);
adminRouter.post("/bulk-cancel-bookings", protectAdmin, bulkCancelBookings);

export default adminRouter;

