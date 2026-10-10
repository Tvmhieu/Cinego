import { Inngest } from "inngest";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import axios from "axios";
import Movie from "../models/Movie.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "movie-ticket-booking" });

// Inngest Function to save user data to a database
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;
    const userData = {
      _id: id,
      email: email_addresses[0].email_address,
      name: first_name + " " + last_name,
      image: image_url,
    };

    try {
      await User.create(userData);
    } catch (error) {
      console.error("Failed to create user:", error);
      throw error; // Inngest will retry
    }
  },
);

// Inngest Function to delete user data in database
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { id } = event.data;
    try {
      const result = await User.findByIdAndDelete(id);
      if (!result) {
        console.warn(`User with id ${id} not found for deletion`);
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
      throw error;
    }
  },
);

// Inngest Function to update user data in database
const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;
    const userData = {
      _id: id,
      email: email_addresses[0].email_address,
      name: first_name + " " + last_name,
      image: image_url,
    };
    await User.findByIdAndUpdate(id, userData);
  },
);

// Inngest Function to cancel booking and release seats of show after 5 minutes of booking created if payment is not made
const releaseSeatsAndDeleteBooking = inngest.createFunction(
  { id: "release-seats-delete-booking" },
  { event: "app/checkpayment" },
  async ({ event, step }) => {
    const fiveMinutesLater = new Date(Date.now() + 5 * 60 * 1000);
    await step.sleepUntil("wait-for-5-minutes", fiveMinutesLater);

    await step.run("check-payment-status", async () => {
      const bookingId = event.data.bookingId;
      const booking = await Booking.findById(bookingId);

      // If payment is not made, release seats and mark booking as cancelled
      if (!booking.isPaid && !booking.isCancelled) {
        const show = await Show.findById(booking.show);
        if (show) {
          booking.bookedSeats.forEach((seat) => {
            delete show.occupiedSeats[seat];
          });
          show.markModified("occupiedSeats");
          await show.save();
        }
        booking.isCancelled = true;
        booking.cancellationReason = "Quá hạn thanh toán";
        await booking.save();
      }
    });
  },
);

// Email features removed

// Inngest Function to auto add movies and shows every day using TMDB API
const autoAddMovies = inngest.createFunction(
  { id: "auto-add-movies" },
  {
    cron: "0 0 * * *", // runs every day
  },
  async () => {
    try {
      const { data } = await axios.get(
        "https://api.themoviedb.org/3/movie/now_playing",
        {
          headers: {
            Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
          },
        },
      );

      const movies = data.results.slice(0, 5); // top 5 movies

      for (const movie of movies) {
        const movieId = movie.id.toString();

        let movieExists = await Movie.findById(movieId);

        if (!movieExists) {
          const movieDetails = {
            _id: movieId,
            title: movie.title,
            overview: movie.overview,
            poster_path: movie.poster_path,
            backdrop_path: movie.backdrop_path,
            release_date: movie.release_date,
            original_language: movie.original_language,
            tagline: "",
            genres: [],
            casts: [],
            vote_average: movie.vote_average,
            runtime: 120,
          };

          movieExists = await Movie.create(movieDetails);
        }

        // create shows for next 5 days
        for (let i = 1; i <= 5; i++) {
          const date = new Date();
          date.setDate(date.getDate() + i);

          const showTimes = ["10:00", "14:00", "18:00", "21:00"];

          for (const time of showTimes) {
            const [hours, minutes] = time.split(":").map(Number);
            const showDateTime = new Date(date);
            showDateTime.setHours(hours, minutes, 0, 0);

            const existingShow = await Show.findOne({
              movie: movieId,
              showDateTime,
            });

            if (!existingShow) {
              await Show.create({
                movie: movieId,
                showDateTime,
                showPrice: 250,
                occupiedSeats: {},
              });
            }
          }
        }
      }

      return { message: "Movies and shows updated automatically." };
    } catch (error) {
      console.error(error);
    }
  },
);

// Create an empty array where we'll export future Inngest functions
export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
  releaseSeatsAndDeleteBooking,
  autoAddMovies,
];
