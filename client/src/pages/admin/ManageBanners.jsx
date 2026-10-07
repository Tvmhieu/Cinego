import { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import Title from "../../components/admin/Title";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { SearchIcon } from "lucide-react";

const ManageBanners = () => {
  const { axios, getToken } = useAppContext();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const getAllMovies = async () => {
    try {
      const { data } = await axios.get("/api/admin/movies", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      if (data.success) {
        setMovies(data.movies);
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleToggleBanner = async (movieId, currentStatus) => {
    try {
      const { data } = await axios.post(
        "/api/admin/toggle-banner",
        { movieId, isBanner: !currentStatus },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );

      if (data.success) {
        toast.success(data.message);
        getAllMovies(); // Refresh list
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    getAllMovies();
  }, []);

  const filteredMovies = movies.filter(movie => 
    movie.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
        <Title text1="Quản lý" text2="Banner" />
        
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-800 rounded-xl leading-5 bg-[#161616] text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
            placeholder="Tìm theo tên phim..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-[#1a1a1a] rounded-xl overflow-hidden border border-gray-800 shadow-xl flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-400 min-w-[800px]">
            <thead className="text-xs text-gray-300 uppercase bg-[#222] border-b border-gray-700">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold text-center w-16">
                  STT
                </th>
                <th scope="col" className="px-6 py-4 font-semibold w-72">
                  Phim
                </th>
                <th scope="col" className="px-6 py-4 font-semibold">
                  Ngày Phát Hành
                </th>
                <th scope="col" className="px-6 py-4 font-semibold text-center">
                  Số suất chiếu
                </th>
                <th scope="col" className="px-6 py-4 font-semibold">
                  Ngày chiếu
                </th>
                <th scope="col" className="px-6 py-4 font-semibold text-center w-32">
                  Trạng Thái Banner
                </th>
                <th scope="col" className="px-6 py-4 font-semibold text-center w-32">
                  Hành Động
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredMovies.length > 0 ? (
                filteredMovies.map((movie, index) => (
                  <tr
                    key={movie._id}
                    className="border-b border-gray-800 hover:bg-[#252525] transition-colors"
                  >
                    <td className="px-6 py-4 text-center font-medium">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                          alt={movie.title}
                          className="w-12 h-16 object-cover rounded-md shadow-md"
                        />
                        <span className="font-semibold text-gray-200 line-clamp-2">
                          {movie.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {movie.release_date}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-bold text-primary">{movie.showCount || 0}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-gray-400 max-w-[150px] inline-block">{movie.showDates || "Không có suất chiếu"}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {movie.isBanner ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20 rounded-full">
                          Đang Hiển Thị
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20 rounded-full">
                          Đã Ẩn
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleBanner(movie._id, movie.isBanner)}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
                          movie.isBanner 
                            ? "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
                            : "bg-primary/10 text-primary hover:bg-primary hover:text-white"
                        }`}
                      >
                        {movie.isBanner ? "Tắt Banner" : "Bật Banner"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    Không có phim nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageBanners;
