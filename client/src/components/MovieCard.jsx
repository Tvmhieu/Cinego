import { StarIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import timeFormat from "../lib/timeFormat";
import { useAppContext } from "../context/AppContext";

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();

  const { image_base_url } = useAppContext();

  // Guard against null/undefined movie data
  if (!movie) {
    return null;
  }

  return (
    <div className="group flex flex-col justify-between p-3 transition-all duration-300 bg-white/5 border border-white/5 rounded-2xl hover:-translate-y-1.5 hover:shadow-[0_10px_30px_rgba(248,69,101,0.1)] hover:border-white/10 w-full overflow-hidden relative">
      {/* Glow effect overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-b from-transparent to-primary/5 pointer-events-none rounded-2xl" />

      <div className="overflow-hidden rounded-xl">
        <img
          onClick={() => {
            if (movie._id) {
              navigate(`/movies/${movie._id}`);
              window.scrollTo(0, 0);
            }
          }}
          src={image_base_url + (movie.backdrop_path || movie.poster_path || '')}
          alt={`${movie.title || 'Movie'} poster`}
          className="object-cover object-right-bottom w-full h-52 cursor-pointer transform group-hover:scale-105 transition-transform duration-700 ease-out"
        />
      </div>

      <p className="mt-3 font-bold tracking-wide truncate text-white group-hover:text-primary transition-colors duration-300">
        {movie.title || 'Untitled Movie'}
      </p>

      <p className="mt-1 text-xs font-medium text-gray-500 tracking-wider">
        {movie.release_date
          ? new Date(movie.release_date).getFullYear()
          : "N/A"}{" "}
        <span className="mx-1.5 opacity-40">•</span>
        {movie.genres && movie.genres.length > 0
          ? movie.genres
              .slice(0, 2)
              .filter((genre) => genre && genre.name)
              .map((genre) => genre.name)
              .join(" | ")
          : "N/A"}
        <span className="mx-1.5 opacity-40">•</span> {movie.runtime ? timeFormat(movie.runtime) : "N/A"}
      </p>

      <div className="flex items-center justify-between pb-2 mt-4 relative z-10">
        <button
          onClick={() => {
            if (movie._id) {
              navigate(`/movies/${movie._id}`, { state: { scrollToDate: true } });
            }
          }}
          className="px-5 py-2 text-xs font-semibold tracking-wide text-white transition-all duration-300 rounded-full cursor-pointer bg-primary hover:bg-white hover:text-black hover:shadow-[0_0_15px_rgba(255,255,255,0.4)] active:scale-95"
        >
          Mua Vé
        </button>
        <p className="flex items-center gap-1.5 pr-1 mt-1 text-sm font-medium text-gray-400">
          <StarIcon className="w-3.5 h-3.5 text-primary fill-primary" />{" "}
          <span className="text-white/80">{movie.vote_average?.toFixed(1) || "N/A"}</span>
        </p>
      </div>
    </div>
  );
};

export default MovieCard;
