import axios from "axios";
import Movie from "../models/Movie.js";
import Show from "../models/Show.js";
import { inngest } from "../inngest/index.js";

// API to get now playing movies from TMDB API
export const getNowPlayingMovies = async (req, res) => {
  try {
    const { data } = await axios.get(
      "https://api.themoviedb.org/3/movie/now_playing?language=vi-VN",
      {
        headers: {
          Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
        },
      },
    );

    const movies = data.results;
    res.json({ success: true, movies: movies });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to search movies from TMDB API
export const searchMovies = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json({ success: true, movies: [] });
    }

    const { data } = await axios.get(
      `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(q)}&language=vi-VN`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
        },
      },
    );

    res.json({ success: true, movies: data.results });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to add a new show to the database
export const addShow = async (req, res) => {
  try {
    const { movieId, showsInput, showPrice } = req.body;
    let movie = await Movie.findById(movieId);

    if (!movie) {
      // Fetch movie details and credits from TMDB API
      const [movieDetailsResponse, movieCreditsResponse] = await Promise.all([
        axios.get(`https://api.themoviedb.org/3/movie/${movieId}?language=vi-VN`, {
          headers: {
            Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
          },
        }),
        axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits?language=vi-VN`, {
          headers: {
            Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
          },
        }),
      ]);

      const movieApiData = movieDetailsResponse.data;
      const movieCreditsData = movieCreditsResponse.data;

      const movieDetails = {
        _id: movieId,
        title: movieApiData.title,
        overview: movieApiData.overview,
        poster_path: movieApiData.poster_path,
        backdrop_path: movieApiData.backdrop_path,
        release_date: movieApiData.release_date,
        original_language: movieApiData.original_language,
        tagline: movieApiData.tagline || "",
        genres: movieApiData.genres,
        casts: movieCreditsData.cast,
        vote_average: movieApiData.vote_average,
        runtime: movieApiData.runtime,
      };

      // Add movie to the database
      movie = await Movie.create(movieDetails);
    }

    const showsToCreate = [];
    const dateTimesToCheck = [];

    showsInput.forEach((show) => {
      show.time.forEach((time) => {
        const showDateTime = new Date(`${show.date}T${time}:00`);
        dateTimesToCheck.push(showDateTime);
        
        showsToCreate.push({
          movie: movieId,
          showDateTime,
          showPrice,
          occupiedSeats: {},
        });
      });
    });

    // Check for conflicts (2-hour window)
    for (let dt of dateTimesToCheck) {
      const start = new Date(dt.getTime() - 2 * 60 * 60 * 1000);
      const end = new Date(dt.getTime() + 2 * 60 * 60 * 1000);
      const conflict = await Show.findOne({
        showDateTime: { $gt: start, $lt: end }
      }).populate("movie");
      
      if (conflict) {
        return res.json({ 
          success: false, 
          message: `Khung giờ ${dt.toLocaleTimeString("vi-VN", {hour: '2-digit', minute:'2-digit'})} ngày ${dt.toLocaleDateString("vi-VN")} bị trùng lịch với phim "${conflict.movie.title}" (cần cách nhau ít nhất 2 tiếng).` 
        });
      }
    }

    if (showsToCreate.length > 0) {
      await Show.insertMany(showsToCreate);
    }

    // Trigger Inngest Event (Safely wrapped in try-catch)
    try {
      if (process.env.INNGEST_EVENT_KEY && process.env.INNGEST_EVENT_KEY !== 'your_inngest_event_key') {
        await inngest.send({
          name: "app/show.added",
          data: { movieTitle: movie.title },
        });
      } else {
        console.warn("Inngest keys not configured. Skipping background event.");
      }
    } catch (inngestError) {
      console.error("Inngest Event Error:", inngestError);
      // We don't throw here because the show was already successfully saved
    }

    res.json({ success: true, message: "Show Added Successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all shows from the database

// export const getShows = async (req, res) => {
//   try {
//     const shows = await Show.find({ showDateTime: { $gte: new Date() } })
//       .populate("movie")
//       .sort({ showDateTime: 1 });

//     // Filter unique shows
//     const uniqueMovieIds = new Set(
//       shows.map((show) => show.movie._id.toString()),
//     );
//     const uniqueShows = Array.from(uniqueMovieIds).map((id) =>
//       shows.find((show) => show.movie._id.toString() === id),
//     );

//     res.json({ success: true, shows: uniqueShows.map((show) => show.movie) });
//   } catch (error) {
//     console.error(error);
//     res.json({ success: false, message: error.message });
//   }
// };

export const getShows = async (req, res) => {
  try {
    const shows = await Show.find({
      showDateTime: { $gte: new Date() },
    })
      .populate("movie")
      .sort({ showDateTime: 1 });

    const uniqueMovies = new Map();

    shows.forEach((show) => {
      const movieId = show.movie._id.toString();

      if (!uniqueMovies.has(movieId)) {
        uniqueMovies.set(movieId, show.movie);
      }
    });

    res.json({
      success: true,
      shows: Array.from(uniqueMovies.values()),
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get a single show from the database
export const getShow = async (req, res) => {
  try {
    const { movieId } = req.params;

    // Get all upcoming shows for the movie
    const shows = await Show.find({
      movie: movieId,
      showDateTime: { $gte: new Date() },
    });

    const movie = await Movie.findById(movieId);
    const dateTime = {};

    shows.forEach((show) => {
      // const date = show.showDateTime.toISOString().split("T")[0];
      const date = show.showDateTime.toLocaleDateString("en-CA"); // Format: YYYY-MM-DD
      if (!dateTime[date]) {
        dateTime[date] = [];
      }
      dateTime[date].push({ time: show.showDateTime, showId: show._id });
    });

    res.json({ success: true, movie, dateTime });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get movie trailer from TMDB
export const getMovieTrailer = async (req, res) => {
  try {
    const { movieId } = req.params;
    const { data } = await axios.get(
      `https://api.themoviedb.org/3/movie/${movieId}/videos`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
        },
      }
    );
    
    // Find a Youtube Trailer
    const trailer = data.results.find(
      (video) => video.site === "YouTube" && video.type === "Trailer"
    );

    if (trailer) {
      return res.json({ success: true, url: `https://www.youtube.com/watch?v=${trailer.key}` });
    } else {
      return res.json({ success: false, message: "Trailer not found" });
    }
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};
