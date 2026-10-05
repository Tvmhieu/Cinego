import { useEffect, useState } from "react";
import { dummyShowsData } from "../../assets/assets";
import Loading from "../../components/Loading";
import Title from "../../components/admin/Title";
import { CheckIcon, DeleteIcon, StarIcon } from "lucide-react";
import { kConverter } from "../../lib/kConverter";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const AddShows = () => {
  const { axios, getToken, user, image_base_url } = useAppContext();

  const currency = import.meta.env.VITE_CURRENCY;

  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [dateTimeSelection, setDataTimeSelection] = useState({});
  const [dateInput, setDateInput] = useState("");
  const [timeInput, setTimeInput] = useState("12:00");
  const [showPrice, setShowPrice] = useState("");
  const [addingShow, setAddingShow] = useState(false);

  const fetchNowPlayingMovies = async () => {
    // setNowPlayingMovies(dummyShowsData);

    try {
      const { data } = await axios.get("/api/show/now-playing", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      if (data.success) {
        setNowPlayingMovies(data.movies);
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchNowPlayingMovies();
      return;
    }
    
    setIsSearching(true);
    try {
      const { data } = await axios.get(`/api/show/search?q=${searchQuery}`, {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      if (data.success) {
        setNowPlayingMovies(data.movies);
      }
    } catch (error) {
      console.error("Error searching movies:", error);
      toast.error("Lỗi khi tìm kiếm phim");
    } finally {
      setIsSearching(false);
    }
  };

  const handleDateTimeAdd = () => {
    if (!dateInput || !timeInput) return;
    const date = dateInput;
    const time = timeInput;

    setDataTimeSelection((prev) => {
      const times = prev[date] || [];
      if (!times.includes(time)) {
        return { ...prev, [date]: [...times, time] };
      }
      return prev;
    });
  };

  const handleRemoveTime = (date, time) => {
    setDataTimeSelection((prev) => {
      const filteredTimes = prev[date].filter((t) => t !== time);
      if (filteredTimes.length === 0) {
        const { [date]: _, ...rest } = prev;
        return rest;
      }

      return {
        ...prev,
        [date]: filteredTimes,
      };
    });
  };

  const handleSubmit = async () => {
    try {
      setAddingShow(true);

      if (
        !selectedMovie ||
        Object.keys(dateTimeSelection).length === 0 ||
        !showPrice
      ) {
        return toast("Missing required fields");
      }

      const showsInput = Object.entries(dateTimeSelection).map(
        ([date, time]) => ({ date, time })
      );

      const payload = {
        movieId: selectedMovie,
        showsInput,
        showPrice: Number(showPrice),
      };

      const { data } = await axios.post("/api/show/add", payload, {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      if (data.success) {
        toast.success(data.message);
        setSelectedMovie(null);
        setDataTimeSelection({});
        setShowPrice("");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("An error occurred. Please try again.");
    }
    setAddingShow(false);
  };

  useEffect(() => {
    if (user) {
      fetchNowPlayingMovies();
    }
  }, [user]);

  return nowPlayingMovies.length > 0 ? (
    <>
      <Title text1="Thêm" text2="Suất chiếu" />

      <form onSubmit={handleSearch} className="flex items-center max-w-md gap-2 mt-8">
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm kiếm phim (tiếng Việt)..." 
          className="flex-1 px-4 py-2 text-sm border rounded-lg border-primary/30 bg-primary/5 focus:outline-none focus:border-primary"
        />
        <button 
          type="submit" 
          disabled={isSearching}
          className="px-6 py-2 text-sm text-white transition rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-50"
        >
          {isSearching ? "Đang tìm..." : "Tìm kiếm"}
        </button>
      </form>

      <p className="mt-8 text-lg font-medium">
        {searchQuery ? "Kết quả tìm kiếm" : "Phim đang hot"}
      </p>
      <div className="pb-4 overflow-x-auto">
        <div className="flex flex-wrap gap-4 mt-4 group w-max">
          {nowPlayingMovies.map((movie) => (
            <div
              key={movie.id}
              className={`relative max-w-40 cursor-pointer group-hover:not-hover:opacity-40 hover:-translate-y-1 transition duration-300`}
              onClick={() => setSelectedMovie(movie.id)}
            >
              <div className="relative overflow-hidden rounded-lg">
                <img
                  src={image_base_url + movie.poster_path}
                  alt=""
                  className="object-cover w-full brightness-90"
                />

                <div className="absolute bottom-0 left-0 flex items-center justify-between w-full p-2 text-sm bg-black/70">
                  <p className="flex items-center gap-1 text-gray-400">
                    <StarIcon className="w-4 h-4 text-primary fill-primary" />
                    {movie.vote_average.toFixed(1)}
                  </p>
                  <p className="text-gray-300">
                    {kConverter(movie.vote_count)} Lượt đánh giá
                  </p>
                </div>
              </div>
              {selectedMovie === movie.id && (
                <div className="absolute flex items-center justify-center w-6 h-6 rounded top-2 right-2 bg-primary">
                  <CheckIcon className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
              )}

              <p className="font-medium truncate">{movie.title}</p>
              <p className="text-sm text-gray-400">{movie.release_date}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Show Price Input  */}
      <div className="mt-8">
        <label className="block mb-2 text-sm font-medium">Giá vé</label>
        <div className="inline-flex items-center gap-2 px-3 py-2 border border-gray-600 rounded-md">
          <input
            min={0}
            type="number"
            value={showPrice}
            onChange={(e) => setShowPrice(e.target.value)}
            placeholder="Nhập giá vé"
            className="outline-none"
          />
          <p className="text-sm text-gray-400">{currency}</p>
        </div>
      </div>

      {/* Date & Time Selection  */}
      <div className="mt-6">
        <label className="block mb-2 text-sm font-medium">
          Chọn ngày & giờ chiếu
        </label>
        <div className="inline-flex gap-5 p-1 pl-3 border border-gray-600 rounded-lg bg-primary/5">
          <input
            type="date"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            className="rounded-md outline-none bg-transparent"
          />
          <div className="flex items-center gap-1 bg-transparent">
            <select
              value={timeInput.split(":")[0]}
              onChange={(e) => setTimeInput(`${e.target.value}:${timeInput.split(":")[1]}`)}
              className="bg-transparent outline-none cursor-pointer"
            >
              {Array.from({ length: 24 }).map((_, i) => (
                <option key={i} value={i.toString().padStart(2, "0")} className="text-black">
                  {i.toString().padStart(2, "0")}
                </option>
              ))}
            </select>
            <span>:</span>
            <select
              value={timeInput.split(":")[1]}
              onChange={(e) => setTimeInput(`${timeInput.split(":")[0]}:${e.target.value}`)}
              className="bg-transparent outline-none cursor-pointer"
            >
              {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map((m) => (
                <option key={m} value={m} className="text-black">
                  {m}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleDateTimeAdd}
            className="px-3 py-2 text-sm text-white rounded-lg cursor-pointer bg-primary/80 hover:bg-primary"
          >
            Thêm giờ
          </button>
        </div>
      </div>

      {/* Display Selected Times  */}
      {Object.keys(dateTimeSelection).length > 0 && (
        <div className="mt-6">
          <h2 className="mb-2">Ngày - Giờ đã chọn</h2>
          <ul className="space-y-3">
            {Object.entries(dateTimeSelection).map(([date, times]) => (
              <li key={date}>
                <div className="font-medium">{date}</div>
                <div className="flex flex-wrap gap-2 mt-1 text-sm">
                  {times.map((time) => (
                    <div
                      key={time}
                      className="flex items-center px-2 py-1 border rounded border-primary"
                    >
                      <span>{time}</span>
                      <DeleteIcon
                        onClick={() => handleRemoveTime(date, time)}
                        width={15}
                        className="ml-2 text-red-500 cursor-pointer hover:text-red-700"
                      />
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={addingShow}
        className="px-8 py-2 mt-6 text-white transition-all rounded cursor-pointer bg-primary hover:bg-primary/90"
      >
        Thêm suất chiếu
      </button>
    </>
  ) : (
    <Loading />
  );
};

export default AddShows;
