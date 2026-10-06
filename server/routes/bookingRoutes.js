import express from "express";
import {
  createBooking,
  getOccupiedSeats,
  getBookingById,
  sepayWebhook,
} from "../controllers/bookingControllers.js";

const bookingRouter = express.Router();

bookingRouter.post("/create", createBooking);
bookingRouter.get("/seats/:showId", getOccupiedSeats);
bookingRouter.get("/detail/:bookingId", getBookingById);
bookingRouter.post("/sepay-webhook", sepayWebhook);

export default bookingRouter;
