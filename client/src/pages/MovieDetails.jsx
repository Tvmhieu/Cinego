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
    <div className="px-4 md:px-12 lg:px-24 pt-24 md:pt-40 relative overflow-hidden">
      {/* Cinematic background glow based on poster */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-[0.03] blur-3xl"
        style={{ backgroundImage: `url(${image_base_url + show.movie.backdrop_path})` }}
      />


      {/* Trailer Modal Overlay */}
      {showTrailerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-4xl p-4 md:p-6">
            <button
              onClick={() => setShowTrailerModal(false)}
              className="absolute z-10 p-2.5 text-white bg-white/10 backdrop-blur-md border border-white/20 rounded-full cursor-pointer -top-4 md:-top-12 right-4 md:right-0 hover:bg-primary transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
            >
              <XIcon className="w-6 h-6" />
            </button>
            <div className="relative pt-[56.25%] bg-black rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/5">
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

      <div className="relative z-10 flex flex-col max-w-6xl gap-10 md:gap-16 mx-auto md:flex-row items-center md:items-start">
        <div className="relative group perspective-1000">
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <img
            src={image_base_url + show.movie.poster_path}
            alt={show.movie.title}
            className="relative object-cover rounded-2xl h-[400px] md:h-[500px] lg:h-[550px] max-w-[280px] md:max-w-[350px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10 group-hover:scale-[1.02] transition-transform duration-500"
          />
        </div>

        <div className="relative flex flex-col gap-4 md:gap-5 w-full">
          <BlurCircle top="-100px" left="-100px" />

          <p className="text-primary font-medium tracking-[0.2em] text-xs md:text-sm uppercase bg-primary/10 w-max px-3 py-1 rounded-md border border-primary/20">
            {show.movie.original_language === 'en' ? 'ENGLISH' : show.movie.original_language?.toUpperCase() || 'PHIM RẠP'}
          </p>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black max-w-[600px] text-balance leading-tight drop-shadow-md">
            {show.movie.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-gray-300 font-medium">
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
              <StarIcon className="w-4.5 h-4.5 text-primary fill-primary drop-shadow-[0_0_5px_rgba(248,69,101,0.5)]" />
              <span className="text-white font-medium">{show.movie.vote_average?.toFixed(1) || "N/A"}</span>
              <span className="text-xs text-gray-500">/ 10</span>
            </div>
            
            <span className="text-white/20">•</span>
            
            <span>
              {timeFormat(show.movie.runtime)}
            </span>
            
            <span className="text-white/20">•</span>
            
            <span>
              {show.movie.genres.map((genre) => genre.name).join(", ") || "N/A"}
            </span>
            
            <span className="text-white/20">•</span>
            
            <span>
              {show.movie.release_date ? show.movie.release_date.split("-")[0] : "N/A"}
            </span>
          </div>

          <p className="max-w-xl mt-2 text-base leading-relaxed text-gray-400 font-medium">
            {show.movie.overview}
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-6">
            <button 
              onClick={handleWatchTrailer}
              className="flex items-center gap-2 py-3.5 px-8 text-sm font-medium tracking-wide transition-all bg-white/5 backdrop-blur-md border border-white/10 rounded-full cursor-pointer hover:bg-white/10 hover:border-white/30 active:scale-95"
            >
              <PlayCircleIcon className="w-5 h-5" />
              Xem Trailer
            </button>

            <a
              href="#dateSelect"
              className="px-10 py-3.5 text-sm font-medium tracking-wide transition-all rounded-full cursor-pointer bg-primary text-white hover:bg-white hover:text-black shadow-[0_0_20px_rgba(248,69,101,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] active:scale-95"
            >
              Mua Vé Ngay
            </a>

            <button
              onClick={handleFavourite}
              className="bg-white/5 backdrop-blur-md border border-white/10 p-3.5 rounded-full transition-all cursor-pointer hover:bg-white/10 hover:scale-110 active:scale-95 group"
            >
              <Heart
                className={`w-5 h-5 transition-colors ${
                  favouriteMovies.find((movie) => movie._id === id)
                    ? "fill-primary text-primary drop-shadow-[0_0_10px_rgba(248,69,101,0.8)]"
                    : "text-white/70 group-hover:text-primary"
                } `}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <p className="mt-20 text-xl font-bold tracking-wide flex items-center gap-3">
          <span className="w-2 h-8 bg-primary rounded-full" /> Diễn viên nổi bật
        </p>
        <div className="pb-6 mt-8 overflow-x-auto no-scrollbar mask-image-fade">
          <div className="flex items-start gap-6 px-2 w-max">
            {show.movie.casts.slice(0, 12).map((cast, index) => (
              <div key={index} className="flex flex-col items-center text-center w-[90px] group">
                <div className="relative overflow-hidden rounded-full ring-2 ring-white/10 group-hover:ring-primary transition-all duration-300 p-0.5">
                  {cast.profile_path ? (
                    <img
                      src={image_base_url + cast.profile_path}
                      alt={cast.name}
                      className="object-cover h-20 w-20 rounded-full md:h-[90px] md:w-[90px] aspect-square transform group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-20 w-20 bg-white/5 rounded-full md:h-[90px] md:w-[90px] aspect-square">
                      <span className="text-xs font-medium text-gray-500">Ẩn ảnh</span>
                    </div>
                  )}
                </div>
                <p className="mt-4 text-[13px] font-medium leading-tight group-hover:text-primary transition-colors">{cast.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <DateSelect dateTime={show.dateTime} id={id} onSelectDate={setSelectedDate} />
      </div>

      {selectedDate && <SeatLayout propId={id} propDate={selectedDate} />}

      <div className="relative z-10 max-w-6xl mx-auto">
        <p className="mt-24 mb-10 text-xl font-bold tracking-wide flex items-center gap-3">
          <span className="w-2 h-8 bg-primary rounded-full" /> Phim khác bạn có thể thích
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {shows
            .filter((show) => show && show._id)
            .slice(0, 4)
            .map((show) => (
            <MovieCard key={show._id} movie={show} />
          ))}
        </div>

        <div className="flex justify-center mt-16 mb-10">
          <button
            onClick={() => {
              navigate("/movies");
              scrollTo(0, 0);
            }}
            className="px-10 py-3.5 text-sm font-medium tracking-wide transition-all rounded-full cursor-pointer bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white hover:text-black hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-95"
          >
            Xem tất cả phim
          </button>
        </div>
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default MovieDetails;
