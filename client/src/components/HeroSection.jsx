import { ArrowRight, CalendarIcon, ClockIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { useEffect, useState } from "react";

const HeroSection = () => {
  const navigate = useNavigate();
  const { axios, image_base_url } = useAppContext();
  const [movies, setMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchTopMovie = async () => {
      try {
        const { data } = await axios.get("/api/show/all");
        if (data.success && data.shows && data.shows.length > 0) {
          // Lấy top 5 phim để làm carousel
          setMovies(data.shows.slice(0, 5));
        }
      } catch (error) {
        console.error("Error fetching featured movie:", error);
      }
    };
    fetchTopMovie();
  }, [axios]);

  useEffect(() => {
    if (movies.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === movies.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [movies.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? movies.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === movies.length - 1 ? 0 : prev + 1));
  };

  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50; 

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) handleNext();
    else if (distance < -minSwipeDistance) handlePrev();
  };

  const [isMouseDown, setIsMouseDown] = useState(false);
  const [mouseStart, setMouseStart] = useState(null);

  const onMouseDown = (e) => {
    setIsMouseDown(true);
    setMouseStart(e.clientX);
    setTouchEnd(null);
  };

  const onMouseMove = (e) => {
    if (!isMouseDown) return;
    setTouchEnd(e.clientX);
  };

  const onMouseUp = () => {
    setIsMouseDown(false);
    if (!mouseStart || !touchEnd) return;
    const distance = mouseStart - touchEnd;
    if (distance > minSwipeDistance) handleNext();
    else if (distance < -minSwipeDistance) handlePrev();
  };

  const featuredMovie = movies[currentIndex];

  // Nếu chưa có phim nào trong rạp, hiển thị mặc định
  if (!featuredMovie) {
    return (
      <div className='flex flex-col items-start justify-center gap-4 px-6 md:px-16 lg:px-36 bg-[url("/backgroundImage.png")] bg-cover bg-center h-screen'>
        <h1 className="text-5xl md:text-[70px] md:leading-[80px] font-semibold max-w-[600px] mt-20">
          Chào mừng đến với <br /> CineGo
        </h1>
        <p className="max-w-md text-gray-300">
          Hệ thống đặt vé xem phim trực tuyến tiện lợi nhất. Hãy khám phá các bộ phim đang được chiếu tại rạp ngay hôm nay.
        </p>
        <button
          onClick={() => navigate("/movies")}
          className="flex items-center gap-1 px-6 py-3 text-sm transition rounded-full cursor-pointer bg-primary hover:bg-primary-dull font-medium"
        >
          Khám phá Phim
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // Nếu có phim trong rạp, tự động lấy ảnh và thông tin của phim đó làm Banner
  return (
    <div 
      className='flex flex-col items-start justify-center gap-4 px-16 md:px-24 lg:px-36 bg-cover bg-center h-screen relative before:absolute before:inset-0 before:bg-gradient-to-r before:from-black/90 before:to-transparent transition-all duration-700 select-none'
      style={{ backgroundImage: `url(${image_base_url + featuredMovie.backdrop_path})` }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp} // Handle case where mouse leaves the element while dragging
    >
      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-start">
        <h1 className="text-5xl md:text-[70px] md:leading-[80px] font-semibold max-w-[800px] mt-20 drop-shadow-lg">
          {featuredMovie.title}
        </h1>

        <div className="flex items-center gap-4 mt-4 text-gray-200">
          <span>{featuredMovie.genres?.map(g => g.name).join(" | ")}</span>
          <div className="flex items-center gap-1">
            <CalendarIcon className="w-4.5 h-4.5" /> {featuredMovie.release_date?.substring(0, 4)}
          </div>
          <div className="flex items-center gap-1">
            <ClockIcon className="w-4.5 h-4.5" /> {Math.floor(featuredMovie.runtime / 60)}h {featuredMovie.runtime % 60}m
          </div>
        </div>

        <p className="max-w-xl mt-4 text-gray-300 drop-shadow-md line-clamp-3">
          {featuredMovie.overview}
        </p>
        
        <button
          onClick={() => navigate(`/movies/${featuredMovie._id}`, { state: { scrollToDate: true } })}
          className="flex items-center gap-2 px-6 py-3 mt-6 text-sm transition rounded-full cursor-pointer bg-primary hover:bg-primary-dull font-medium shadow-lg"
        >
          Đặt vé ngay
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Buttons */}
      {movies.length > 1 && (
        <>
          <button 
            onClick={handlePrev} 
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-3 bg-black/40 hover:bg-primary rounded-full backdrop-blur-md transition-colors border border-white/20 cursor-pointer z-20 group"
          >
            <ChevronLeft className="w-8 h-8 text-white/70 group-hover:text-white transition-colors" />
          </button>
          <button 
            onClick={handleNext} 
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 bg-black/40 hover:bg-primary rounded-full backdrop-blur-md transition-colors border border-white/20 cursor-pointer z-20 group"
          >
            <ChevronRight className="w-8 h-8 text-white/70 group-hover:text-white transition-colors" />
          </button>
          
          {/* Pagination Indicators */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {movies.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? "w-8 bg-primary" : "w-2 bg-white/40"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HeroSection;
