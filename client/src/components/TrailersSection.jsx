import { useState, useEffect } from "react";
import ReactPlayer from "react-player";
import BlurCircle from "./BlurCircle";
import { PlayCircleIcon } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const TrailersSection = () => {
  const { shows, axios, image_base_url } = useAppContext();
  const [currentTrailer, setCurrentTrailer] = useState(null);
  const [trailerUrl, setTrailerUrl] = useState("");

  useEffect(() => {
    if (shows && shows.length > 0) {
      setCurrentTrailer(shows[0]);
    }
  }, [shows]);

  useEffect(() => {
    const fetchTrailer = async () => {
      if (currentTrailer) {
        try {
          const { data } = await axios.get(`/api/show/trailer/${currentTrailer._id}`);
          if (data.success && data.url) {
            setTrailerUrl(data.url);
          } else {
            setTrailerUrl("");
          }
        } catch (error) {
          console.error("Error fetching trailer", error);
          setTrailerUrl("");
        }
      }
    };
    fetchTrailer();
  }, [currentTrailer, axios]);

  if (!shows || shows.length === 0) {
    return (
      <div className="px-6 py-20 md:px-16 lg:px-24 xl:px-44">
        <p className="max-w-[960px] mx-auto text-lg font-medium text-gray-300">
          Chưa có phim nào đang chiếu
        </p>
      </div>
    );
  }
  
  return (
    <div className="px-6 py-20 overflow-hidden md:px-16 lg:px-24 xl:px-44">
      <p className="max-w-[960px] mx-auto text-lg font-medium text-gray-300">
        Trailer Nổi Bật
      </p>

      <div className="relative mt-6">
        <BlurCircle top="-100px" right="-100px" />
        {trailerUrl ? (
          <ReactPlayer
            url={trailerUrl}
            controls={true}
            className="max-w-full mx-auto"
            width="960px"
            height="540px"
          />
        ) : (
          <div className="flex items-center justify-center mx-auto bg-gray-900 rounded-lg max-w-full w-[960px] h-[540px]">
            <p className="text-gray-400">Không tìm thấy trailer cho phim này</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4 mx-auto mt-8 group md:gap-8 max-w-3xl">
        {shows.slice(0, 4).map((movie) => (
          <div
            key={movie._id}
            className="relative transition duration-300 cursor-pointer group-hover:not-hover:opacity-50 hover:-translate-y-1 max-md:h-60 md:max-h-60"
            onClick={() => setCurrentTrailer(movie)}
          >
            <img
              src={image_base_url + (movie.backdrop_path || movie.poster_path)}
              alt="trailer"
              className="object-cover w-full h-full rounded-lg brightness-75"
            />
            <PlayCircleIcon
              strokeWidth={1.6}
              className="absolute w-5 h-5 transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 md:w-8 md:h-12"
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
