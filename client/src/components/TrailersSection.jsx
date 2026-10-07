import { useState, useEffect } from "react";
import ReactPlayer from "react-player";
import BlurCircle from "./BlurCircle";
import { PlayCircleIcon } from "lucide-react";
import { useAppContext } from "../context/AppContext";

const TrailersSection = () => {
  const { shows, axios, image_base_url } = useAppContext();
  const [moviesWithTrailer, setMoviesWithTrailer] = useState([]);
  const [currentTrailer, setCurrentTrailer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrailers = async () => {
      if (!shows || shows.length === 0) {
        setIsLoading(false);
        return;
      }
      
      try {
        const results = [];
        for (const movie of shows) {
          if (results.length >= 4) break;
          try {
            const { data } = await axios.get(`/api/show/trailer/${movie._id}`);
            if (data.success && data.url) {
              results.push({ ...movie, trailerUrl: data.url });
            }
          } catch (error) {}
        }
        
        setMoviesWithTrailer(results);
        if (results.length > 0) {
          setCurrentTrailer(results[0]);
        }
      } catch (error) {
        console.error("Error fetching trailers", error);
      }
      setIsLoading(false);
    };
    
    fetchTrailers();
  }, [shows, axios]);

  if (isLoading) {
    return (
      <div className="px-6 py-20 flex justify-center items-center min-h-[300px]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Hide the section completely if no valid trailers are found
  if (!moviesWithTrailer || moviesWithTrailer.length === 0) {
    return null;
  }
  
  return (
    <div className="px-6 py-20 overflow-hidden md:px-16 lg:px-24 xl:px-44">
      <p className="max-w-[960px] mx-auto text-lg font-medium text-gray-300">
        Trailer Nổi Bật
      </p>

      <div className="relative mt-6">
        <BlurCircle top="-100px" right="-100px" />
        <ReactPlayer
          url={currentTrailer?.trailerUrl}
          controls={true}
          className="max-w-full mx-auto"
          width="960px"
          height="540px"
        />
      </div>

      <div className="grid grid-cols-4 gap-4 mx-auto mt-8 group md:gap-8 max-w-3xl">
        {moviesWithTrailer.map((movie) => (
          <div
            key={movie._id}
            className={`relative transition duration-300 cursor-pointer max-md:h-60 md:max-h-60 rounded-lg overflow-hidden ${currentTrailer?._id === movie._id ? 'ring-2 ring-primary opacity-100' : 'opacity-60 hover:opacity-100 group-hover:not-hover:opacity-50'}`}
            onClick={() => setCurrentTrailer(movie)}
          >
            <img
              src={image_base_url + (movie.backdrop_path || movie.poster_path)}
              alt="trailer"
              className="object-cover w-full h-full brightness-75"
            />
            <PlayCircleIcon
              strokeWidth={1.6}
              className="absolute w-5 h-5 transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 md:w-8 md:h-12 text-white/80"
            />
            <p className="absolute bottom-2 left-2 right-2 text-xs font-medium text-white truncate text-center drop-shadow-md">
              {movie.title}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrailersSection;
