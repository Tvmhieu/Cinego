import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import BlurCircle from "../components/BlurCircle";
import { Heart, PlayCircleIcon, StarIcon, XIcon } from "lucide-react";
import timeFormat from "../lib/timeFormat";
import DateSelect from "../components/DateSelect";
import MovieCard from "../components/MovieCard";
import Loading from "../components/Loading";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import ReactPlayer from "react-player";
import SeatLayout from "./SeatLayout";

const MovieDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [show, setShow] = useState(null);
  const [trailerUrl, setTrailerUrl] = useState("");
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const {
    shows,
    axios,
    getToken,
    user,
    fetchFavouriteMovies,
    favouriteMovies,
    image_base_url,
  } = useAppContext();

  const getShow = async () => {
    try {
      const { data } = await axios.get(`/api/show/${id}`);
      if (data.success) {
        setShow(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleFavourite = async () => {
    try {
      if (!user) return toast.error("Vui lòng đăng nhập để tiếp tục");

      const { data } = await axios.post(
        "/api/user/update-favourite",
        {
          movieId: id,
        },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );

      if (data.success) {
        await fetchFavouriteMovies();
        toast.success(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleWatchTrailer = async () => {
    try {
      const { data } = await axios.get(`/api/show/trailer/${id}`);
      if (data.success && data.url) {
        setTrailerUrl(data.url);
        setShowTrailerModal(true);
      } else {
        toast.error("Không tìm thấy trailer cho bộ phim này!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi tải trailer");
    }
  };

  useEffect(() => {
    getShow();
  }, [id]);

  useEffect(() => {
    if (show && location.state?.scrollToDate) {
      setTimeout(() => {
        document.getElementById("dateSelect")?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    } else if (show && !location.state?.scrollToDate) {
      window.scrollTo(0, 0);
    }
  }, [show, location]);

  return show ? (
    <div className="px-6 md:px-16 lg:px-40 pt-30 md:pt-50 relative">
      {/* Trailer Modal Overlay */}
      {showTrailerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl p-4">
            <button
              onClick={() => setShowTrailerModal(false)}
              className="absolute z-10 p-2 text-white bg-gray-800 rounded-full cursor-pointer -top-10 right-4 hover:bg-gray-700"
            >
              <XIcon className="w-6 h-6" />
            </button>
            <div className="relative pt-[56.25%] bg-black rounded-lg overflow-hidden">
              <ReactPlayer
                url={trailerUrl}
                controls={true}
                playing={true}
                width="100%"
                height="100%"
                className="absolute top-0 left-0"
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col max-w-6xl gap-8 mx-auto md:flex-row">
        <img
          src={image_base_url + show.movie.poster_path}
          alt=""
          className="object-cover rounded-xl h-104 max-w-70"
        />

        <div className="relative flex flex-col gap-3">
          <BlurCircle top="-100px" left="-100px" />

          <p className="text-primary">ENGLISH</p>

          <h1 className="text-4xl font-semibold max-w-96 text-balance">
            {show.movie.title}
          </h1>

          <div className="flex items-center gap-2 text-gray-300">
            <StarIcon className="w-5 h-5 text-primary fill-primary" />
            {show.movie.vote_average?.toFixed(1) || "N/A"} Điểm đánh giá
          </div>

          <p className="max-w-xl mt-2 text-sm leading-tight text-gray-400">
            {show.movie.overview}
          </p>

          <p>
            {timeFormat(show.movie.runtime)} •{" "}
            {show.movie.genres.map((genre) => genre.name).join(", ") || "N/A"} •{" "}
            {show.movie.release_date
              ? show.movie.release_date.split("-")[0]
              : "N/A"}
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-4">
            <button 
              onClick={handleWatchTrailer}
              className="flex items-center gap-2 py-3 text-sm font-medium transition bg-gray-800 rounded-md cursor-pointer px-7 hover:bg-gray-900 active:scale-95"
            >
              <PlayCircleIcon className="w-5 h-5" />
              Xem Trailer
            </button>

            <a
              href="#dateSelect"
              className="px-10 py-3 text-sm font-medium transition rounded-md cursor-pointer bg-primary hover:bg-primary-dull active:scale-95"
            >
              Mua Vé Ngay
            </a>

            <button
              onClick={handleFavourite}
              className="bg-gray-700 p-2.5 rounded-full transition cursor-pointer active:scale-95"
            >
              <Heart
                className={`w-5 h-5 ${
                  favouriteMovies.find((movie) => movie._id === id)
                    ? "fill-primary text-primary"
                    : ""
                } `}
              />
            </button>
          </div>
        </div>
      </div>

      <p className="mt-20 text-lg font-medium">Diễn viên nổi bật</p>
      <div className="pb-4 mt-8 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-4 px-4 w-max">
          {show.movie.casts.slice(0, 12).map((cast, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              {cast.profile_path ? (
                <img
                  src={image_base_url + cast.profile_path}
                  alt=""
                  className="object-cover h-20 rounded-full md:h-20 aspect-square"
                />
              ) : (
                <div className="flex items-center justify-center h-20 bg-gray-700 rounded-full md:h-20 aspect-square">
                  <span className="text-xs text-gray-400">Ẩn ảnh</span>
                </div>
              )}
              <p className="mt-3 text-xs font-medium">{cast.name}</p>
            </div>
          ))}
        </div>
      </div>

      <DateSelect dateTime={show.dateTime} id={id} onSelectDate={setSelectedDate} />

      {selectedDate && <SeatLayout propId={id} propDate={selectedDate} />}

      <p className="mt-20 mb-8 text-lg font-medium">Phim khác bạn có thể thích</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {shows
          .filter((show) => show && show._id)
          .slice(0, 4)
          .map((show) => (
          <MovieCard key={show._id} movie={show} />
        ))}
      </div>

      <div className="flex justify-center mt-20">
        <button
          onClick={() => {
            navigate("/movies");
            scrollTo(0, 0);
          }}
          className="px-10 py-3 text-sm font-medium transition rounded-md cursor-pointer bg-primary hover:bg-primary-dull"
        >
          Xem thêm
        </button>
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default MovieDetails;
