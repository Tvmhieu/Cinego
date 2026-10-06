import express from "express";
import {
  createBooking,
  getOccupiedSeats,
  getBookingById,
  sepayWebhook,
  cancelBooking,
} from "../controllers/bookingControllers.js";

const bookingRouter = express.Router();

bookingRouter.post("/create", createBooking);
bookingRouter.get("/seats/:showId", getOccupiedSeats);
bookingRouter.get("/detail/:bookingId", getBookingById);
bookingRouter.post("/sepay-webhook", sepayWebhook);
bookingRouter.post("/cancel/:bookingId", cancelBooking);

export default bookingRouter;
