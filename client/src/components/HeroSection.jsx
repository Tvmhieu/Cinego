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
        const { data } = await axios.get("/api/show/banners");
        if (data.success && data.banners && data.banners.length > 0) {
          setMovies(data.banners);
        } else {
          // Fallback to top 5 currently showing movies if no banners configured
          const allShowsRes = await axios.get("/api/show/all");
          if (allShowsRes.data.success && allShowsRes.data.shows && allShowsRes.data.shows.length > 0) {
            setMovies(allShowsRes.data.shows.slice(0, 5));
          }
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
      <div 
        onClick={() => { if (window.innerWidth < 768) navigate("/movies"); }}
        className='flex flex-col items-start justify-center gap-6 px-6 md:px-16 lg:px-36 bg-[url("/backgroundImage.png")] bg-cover bg-center h-[55svh] md:h-[100svh] relative cursor-pointer md:cursor-default'
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
        <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-[80px] md:leading-[90px] font-black tracking-tight max-w-[600px] mt-10 md:mt-10">
            Chào mừng đến với <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">CineGo</span>
          </h1>
          <p className="max-w-md mt-4 md:mt-6 text-sm md:text-lg text-gray-300 font-medium leading-relaxed">
            Hệ thống đặt vé xem phim trực tuyến tiện lợi nhất. Hãy khám phá các bộ phim đang được chiếu tại rạp ngay hôm nay.
          </p>
          <button
            onClick={(e) => { e.stopPropagation(); navigate("/movies"); }}
            className="hidden md:flex group items-center gap-2 px-8 py-3.5 mt-8 text-sm md:text-base font-medium tracking-wide transition-all duration-300 rounded-full cursor-pointer bg-white text-black hover:bg-primary hover:text-white shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(248,69,101,0.4)] active:scale-95"
          >
            Khám phá Phim
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  // Nếu có phim trong rạp, tự động lấy ảnh và thông tin của phim đó làm Banner
  return (
    <div 
      className='flex flex-col items-start justify-center px-6 md:px-24 lg:px-36 bg-cover bg-center h-[65svh] md:h-[100svh] relative transition-all duration-1000 ease-in-out select-none group/hero cursor-pointer md:cursor-default'
      style={{ backgroundImage: `url(${image_base_url + featuredMovie.backdrop_path})` }}
      onClick={() => {
        if (window.innerWidth < 768 && Math.abs((touchStart || 0) - (touchEnd || touchStart || 0)) < minSwipeDistance) {
          navigate(`/movies/${featuredMovie._id}`, { state: { scrollToDate: true } });
        }
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {/* Deep vignette gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-transparent pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-start pt-10 md:pt-10">
        <h1 className="text-3xl sm:text-4xl md:text-[75px] md:leading-[1.1] font-black tracking-tight text-white max-w-[800px] drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] line-clamp-2 md:line-clamp-none">
          {featuredMovie.title}
        </h1>

        <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-3 md:mt-5 text-xs md:text-base font-medium text-gray-200">
          <span className="px-2 py-1 md:px-3 bg-white/10 backdrop-blur-md rounded-md border border-white/10 tracking-wider">
            {featuredMovie.genres?.map(g => g.name).join(" | ")}
          </span>
          <div className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 bg-black/40 backdrop-blur-md rounded-md">
            <CalendarIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" /> {featuredMovie.release_date?.substring(0, 4)}
          </div>
          <div className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 bg-black/40 backdrop-blur-md rounded-md">
            <ClockIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" /> {Math.floor(featuredMovie.runtime / 60)}h {featuredMovie.runtime % 60}m
          </div>
        </div>

        <p className="max-w-2xl mt-4 md:mt-5 text-sm md:text-lg text-gray-300 drop-shadow-md line-clamp-3 leading-relaxed font-medium">
          {featuredMovie.overview}
        </p>
        
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/movies/${featuredMovie._id}`, { state: { scrollToDate: true } }); }}
          className="hidden md:flex group items-center gap-2 px-8 py-4 mt-8 text-sm md:text-base font-medium tracking-wide transition-all duration-300 rounded-full cursor-pointer bg-primary text-white hover:bg-white hover:text-black shadow-[0_0_20px_rgba(248,69,101,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] active:scale-95"
        >
          Đặt vé ngay
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Navigation Buttons */}
      {movies.length > 1 && (
        <>
          <button 
            onClick={handlePrev} 
            className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-black/30 hover:bg-primary rounded-full backdrop-blur-md transition-all duration-300 border border-white/10 hover:border-transparent cursor-pointer z-20 md:opacity-0 md:group-hover/hero:opacity-100 hover:scale-110"
          >
            <ChevronLeft className="w-6 h-6 md:w-8 md:h-8 text-white/80 hover:text-white" />
          </button>
          <button 
            onClick={handleNext} 
            className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-black/30 hover:bg-primary rounded-full backdrop-blur-md transition-all duration-300 border border-white/10 hover:border-transparent cursor-pointer z-20 md:opacity-0 md:group-hover/hero:opacity-100 hover:scale-110"
          >
            <ChevronRight className="w-6 h-6 md:w-8 md:h-8 text-white/80 hover:text-white" />
          </button>
          
          {/* Pagination Indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2.5 z-20">
            {movies.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1.5 rounded-full transition-all duration-500 ease-out ${idx === currentIndex ? "w-10 bg-primary shadow-[0_0_10px_rgba(248,69,101,0.8)]" : "w-2.5 bg-white/30 hover:bg-white/60 cursor-pointer"}`}
                onClick={() => setCurrentIndex(idx)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HeroSection;
