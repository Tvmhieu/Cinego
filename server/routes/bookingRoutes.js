import express from "express";
import {
  createBooking,
  getOccupiedSeats,
  getBookingById,
} from "../controllers/bookingControllers.js";

const bookingRouter = express.Router();

bookingRouter.post("/create", createBooking);
bookingRouter.get("/seats/:showId", getOccupiedSeats);
bookingRouter.get("/detail/:bookingId", getBookingById);

export default bookingRouter;
