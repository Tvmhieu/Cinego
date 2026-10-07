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
    <div className="px-4 py-16 overflow-hidden md:px-16 lg:px-24 xl:px-44">
      <p className="max-w-4xl mx-auto text-lg md:text-2xl font-black text-white italic tracking-wide mb-6 md:mb-8">
        Trailer <span className="text-primary">Nổi Bật</span>
      </p>

      {/* Main Video Player */}
      <div className="relative w-full max-w-4xl mx-auto mt-4 rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] ring-1 ring-white/10 bg-black aspect-video">
        <BlurCircle top="-100px" right="-100px" />
        <ReactPlayer
          url={currentTrailer?.trailerUrl}
          controls={true}
          className="absolute top-0 left-0"
          width="100%"
          height="100%"
        />
      </div>

      {/* Thumbnail List */}
      <div className="flex overflow-x-auto md:grid md:grid-cols-4 gap-3 md:gap-5 mx-auto mt-6 md:mt-8 group max-w-4xl pb-4 md:pb-0 no-scrollbar snap-x snap-mandatory">
        {moviesWithTrailer.map((movie) => (
          <div
            key={movie._id}
            className={`relative flex-none w-[45vw] md:w-auto aspect-video md:aspect-[4/3] transition-all duration-300 cursor-pointer rounded-xl md:rounded-2xl overflow-hidden snap-start bg-black/50 ${
              currentTrailer?._id === movie._id 
                ? 'ring-2 ring-primary opacity-100 shadow-[0_0_15px_rgba(248,69,101,0.3)]' 
                : 'opacity-50 hover:opacity-100'
            }`}
            onClick={() => setCurrentTrailer(movie)}
          >
            <img
              src={image_base_url + (movie.backdrop_path || movie.poster_path)}
              alt="trailer"
              className="object-cover w-full h-full brightness-75 group-hover:brightness-90 transition-all duration-500"
            />
            <PlayCircleIcon
              strokeWidth={1.5}
              className={`absolute w-8 h-8 md:w-10 md:h-10 transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 drop-shadow-lg transition-all duration-300 ${currentTrailer?._id === movie._id ? 'text-primary scale-110' : 'text-white/70'}`}
            />
            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-6 pb-2 px-2">
              <p className="text-[10px] md:text-xs font-bold text-white truncate text-center drop-shadow-md">
                {movie.title}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrailersSection;
