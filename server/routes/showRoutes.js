import express from "express";
import {
  addShow,
  getNowPlayingMovies,
  getShow,
  getShows,
  searchMovies,
  getMovieTrailer,
} from "../controllers/showControllers.js";
import { protectAdmin } from "../middleware/auth.js";

const showRouter = express.Router();

showRouter.get("/now-playing", protectAdmin, getNowPlayingMovies);
showRouter.get("/search", protectAdmin, searchMovies);
showRouter.post("/add", protectAdmin, addShow);
showRouter.get("/all", getShows);
showRouter.get("/trailer/:movieId", getMovieTrailer);
showRouter.get("/:movieId", getShow);

export default showRouter;
