import BlurCircle from "../components/BlurCircle";
import MovieCard from "../components/MovieCard";
import { useAppContext } from "../context/AppContext";
import { useSearchParams } from "react-router-dom";

const Movies = () => {
  const { shows } = useAppContext();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search")?.toLowerCase() || "";

  const filteredShows = shows.filter(movie => 
    movie.title?.toLowerCase().includes(searchQuery)
  );

  return filteredShows.length > 0 ? (
    <div className="relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]">
      <BlurCircle top="150px" left="0px" />
      <BlurCircle bottom="50px" right="50px" />

      <div className="flex items-center justify-between my-4">
        <h1 className="text-lg font-medium">
          {searchQuery ? `Kết quả tìm kiếm cho: "${searchQuery}"` : "Phim đang chiếu"}
        </h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filteredShows.map((movie) => (
          <MovieCard movie={movie} key={movie._id} />
        ))}
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold text-center">
        {searchQuery ? `Không tìm thấy phim: "${searchQuery}"` : "Chưa có phim nào"}
      </h1>
    </div>
  );
};

export default Movies;
