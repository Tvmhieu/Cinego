import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BlurCircle from "./BlurCircle";
import MovieCard from "./MovieCard";
import { useAppContext } from "../context/AppContext";

const FeaturedSection = () => {
  const navigate = useNavigate();

  const { shows } = useAppContext();

  return (
    <div className="px-6 overflow-hidden md:px-16 lg:px-24 xl:px-44">
      <div className="relative flex items-center justify-between pt-20 pb-10">
        <BlurCircle top="0" right="-80px" />
        <p className="text-lg font-medium text-gray-300">Phim đang chiếu</p>
        <button
          onClick={() => {
            navigate("/movies");
            window.scrollTo(0, 0);
          }}
          className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer group"
        >
          Xem tất cả
          <ArrowRight className="group-hover:translate-x-0.5 transition w-4.5 h-4.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
        {shows
          .filter((show) => show && show._id) // Filter out null shows and shows without IDs
          .slice(0, 4)
          .map((show) => (
            <MovieCard key={show._id} movie={show} />
          ))}
      </div>

      <div className="flex justify-center mt-20">
        <button
          onClick={() => {
            navigate("/movies");
            window.scrollTo(0, 0);
          }}
          className="px-10 py-3 text-sm font-medium transition rounded-md cursor-pointer bg-primary hover:bg-primary-dull"
        >
          Xem thêm
        </button>
      </div>
    </div>
  );
};

export default FeaturedSection;
