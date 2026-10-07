import { useCallback, useEffect, useState } from "react";
import Loading from "../components/Loading";
import BlurCircle from "../components/BlurCircle";
import timeFormat from "../lib/timeFormat";
import { dateFormat } from "../lib/dateFormat";
import { useAppContext } from "../context/AppContext";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { XIcon, ClockIcon, TicketPlus } from "lucide-react";

const MyBookings = () => {
  const { axios, getToken, user, image_base_url } = useAppContext();
  const currency = import.meta.env.VITE_CURRENCY;

  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const getMyBookings = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/user/bookings", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  }, [axios, getToken]);

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy vé này? Hủy xong sẽ không thể khôi phục.")) return;
    
    try {
      const { data } = await axios.post(`/api/booking/cancel/${bookingId}`, {}, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      });
      if (data.success) {
        toast.success(data.message);
        getMyBookings();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi hủy vé");
    }
  };

  useEffect(() => {
    if (user) {
      getMyBookings();
    } else {
      setIsLoading(false);
    }
  }, [user, getMyBookings]);

  const [activeTab, setActiveTab] = useState("valid"); // 'valid', 'cancelled'

  const filteredBookings = bookings.filter(item => 
    activeTab === "valid" ? !item.isCancelled : item.isCancelled
  );

  return !isLoading ? (
    <div className="relative px-6 md:px-16 lg:px-40 pt-30 md:pt-40 min-h-[80vh]">
      <BlurCircle top="100px" left="100px" />
      <div>
        <BlurCircle bottom="0px" left="600px" />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 md:mb-12 gap-6">
        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-md flex items-center gap-4">
          <span className="w-2 h-8 md:h-10 bg-primary rounded-full shadow-[0_0_15px_rgba(248,69,101,0.5)]" />
          Vé của tôi
        </h1>
        
        <div className="flex gap-6 border-b border-white/10 pb-1">
          <button
            onClick={() => setActiveTab("valid")}
            className={`pb-3 px-2 text-sm md:text-base font-medium transition-all relative ${
              activeTab === "valid" ? "text-primary" : "text-gray-500 hover:text-white"
            }`}
          >
            Đang xử lý ({bookings.filter(b => !b.isCancelled).length})
            {activeTab === "valid" && (
              <span className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-md shadow-[0_0_10px_rgba(248,69,101,0.8)]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("cancelled")}
            className={`pb-3 px-2 text-sm md:text-base font-medium transition-all relative ${
              activeTab === "cancelled" ? "text-primary" : "text-gray-500 hover:text-white"
            }`}
          >
            Đã hủy ({bookings.filter(b => b.isCancelled).length})
            {activeTab === "cancelled" && (
              <span className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-md shadow-[0_0_10px_rgba(248,69,101,0.8)]" />
            )}
          </button>
        </div>
      </div>

      <div className="grid gap-6 mt-6">
        {filteredBookings.map((item, index) => (
          <div
            key={index}
            className="group flex flex-col md:flex-row items-center gap-6 p-5 md:p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl hover:border-white/20 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] relative overflow-hidden"
          >
            {/* Subtle glow on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="w-full md:w-32 lg:w-40 h-48 md:h-full md:aspect-[2/3] shrink-0 overflow-hidden rounded-2xl ring-1 ring-white/10">
              <img
                src={image_base_url + item.show.movie.poster_path}
                alt=""
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            
            <div className="flex-1 w-full flex flex-col justify-between py-2 relative z-10">
              <div>
                <h3 className="text-xl md:text-2xl font-black text-white line-clamp-1 group-hover:text-primary transition-colors tracking-wide">{item.show.movie.title}</h3>
                <p className="text-sm md:text-base text-gray-400 mt-2 font-medium flex items-center gap-2">
                  <ClockIcon className="w-4 h-4 text-primary" /> {dateFormat(item.show.showDateTime)}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-sm text-gray-400 font-medium">Ghế:</span>
                  <span className="bg-white/10 px-3 py-1 rounded-lg border border-white/5 font-medium text-primary tracking-widest">{item.bookedSeats.join(", ")}</span>
                </div>
              </div>
              
              <div className="flex flex-col mt-6">
                <div className="flex items-center gap-4">
                  <span className={`text-[10px] md:text-xs font-medium px-3 py-1.5 rounded-md uppercase tracking-wider ${item.isCancelled ? 'bg-red-500/10 text-red-500 border border-red-500/20' : item.isPaid ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'}`}>
                    {item.isCancelled ? 'Đã hủy' : item.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </span>
                  <span className="text-lg md:text-xl font-black text-white">{item.amount.toLocaleString("vi-VN")} {currency}</span>
                </div>
                {item.isCancelled && item.cancellationReason && (
                  <p className="text-sm text-red-400/90 mt-3 font-medium bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                    <span className="font-medium text-red-500">Lý do hủy:</span> {item.cancellationReason}
                  </p>
                )}
              </div>
            </div>

            <div className="w-full md:w-48 lg:w-56 flex flex-col gap-3 shrink-0 relative z-10 border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-6">
              {item.isPaid && !item.isCancelled ? (
                <button
                  onClick={() => setSelectedTicket(item)}
                  className="px-6 py-4 bg-primary hover:bg-white hover:text-black text-white text-sm font-medium tracking-wide rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(248,69,101,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] active:scale-95 w-full flex justify-center items-center gap-2"
                >
                  <TicketPlus className="w-5 h-5" /> Mở Vé / Mã QR
                </button>
              ) : !item.isCancelled && !item.isPaid ? (
                <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full">
                  <Link
                    to={`/payment/${item._id}`}
                    className="px-6 py-3.5 bg-primary hover:bg-white hover:text-black text-white text-sm font-medium tracking-wide text-center rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(248,69,101,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] active:scale-95 flex-1"
                  >
                    Thanh toán
                  </Link>
                  <button
                    onClick={() => handleCancel(item._id)}
                    className="px-6 py-3.5 bg-white/5 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 text-sm font-medium tracking-wide rounded-2xl transition-all duration-300 flex-1 active:scale-95"
                  >
                    Hủy vé
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        ))}
        {filteredBookings.length === 0 && (
          <div className="text-center py-20 text-gray-500 font-medium bg-white/5 border border-white/5 rounded-3xl">
            {activeTab === "valid" ? "Bạn chưa đặt vé nào." : "Không có vé nào bị hủy."}
          </div>
        )}
      </div>

      {/* Ticket Modal Overlay */}
      {selectedTicket && (
        <>
          <div 
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" 
            onClick={() => setSelectedTicket(null)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[340px] sm:max-w-sm z-[101] animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setSelectedTicket(null)}
              className="absolute -top-12 right-0 md:-right-12 text-white/70 hover:text-white bg-gray-800/50 hover:bg-gray-700 p-2 rounded-full transition z-20"
            >
              <XIcon className="w-6 h-6" />
            </button>
            
            {/* The Gorgeous Compact Ticket UI */}
            <div className="relative flex flex-col w-full bg-[#1a1a1a] rounded-[24px] overflow-hidden shadow-2xl border border-gray-700">
              {/* Top: Movie Poster */}
              <div className="relative w-full aspect-[21/9] shrink-0">
                <img
                  src={image_base_url + (selectedTicket.show.movie.backdrop_path || selectedTicket.show.movie.poster_path)}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent"></div>
                <div className="absolute top-3 left-3 bg-primary/90 backdrop-blur-md text-white text-[9px] font-medium px-2.5 py-1 rounded-full uppercase tracking-widest shadow-lg">
                  CineGo
                </div>
              </div>

              {/* Middle: Ticket Details */}
              <div className="flex-1 px-5 pt-1 pb-4 relative z-10 bg-transparent border-b-2 border-dashed border-gray-700/50">
                <h2 className="text-lg sm:text-xl font-bold uppercase mb-1 text-white line-clamp-2 leading-tight drop-shadow-md">
                  {selectedTicket.show.movie.title}
                </h2>
                <p className="text-xs sm:text-sm font-medium text-gray-400 mb-3 flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 bg-gray-800 rounded text-[10px]">2D</span>
                  {timeFormat(selectedTicket.show.movie.runtime)}
                </p>
                
                <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                  <div>
                    <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-widest mb-0.5">Giờ chiếu</p>
                    <p className="text-xs sm:text-sm font-medium text-gray-200">{dateFormat(selectedTicket.show.showDateTime)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-widest mb-0.5">Ghế ngồi</p>
                    <p className="text-lg sm:text-xl font-black text-primary drop-shadow-md leading-none">{selectedTicket.bookedSeats.join(", ")}</p>
                  </div>
                  <div>
                    <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-widest mb-0.5">Khách hàng</p>
                    <p className="text-xs sm:text-sm font-medium text-gray-300 truncate">{selectedTicket.customerName || user?.name || "Ẩn danh"}</p>
                  </div>
                  <div>
                    <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-widest mb-0.5">Tổng tiền</p>
                    <p className="text-xs sm:text-sm font-medium text-gray-300">{selectedTicket.amount.toLocaleString("vi-VN")} {currency}</p>
                  </div>
                </div>
              </div>

              {/* Bottom: Large QR Code */}
              <div className="w-full bg-white p-5 sm:p-6 flex flex-col items-center justify-center relative shrink-0">
                {/* Cutouts for ticket effect */}
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-black/80 rounded-full border-b border-r border-gray-700/50"></div>
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-black/80 rounded-full border-b border-l border-gray-700/50"></div>
                
                <h3 className="text-black font-medium text-center mb-3 uppercase tracking-widest text-xs sm:text-sm">Quét mã để vào rạp</h3>
                <div className="w-48 aspect-square relative bg-white">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${selectedTicket.bookingCode || selectedTicket._id}`} 
                    alt="QR Code" 
                    className="w-full h-full object-contain" 
                  />
                </div>
                
                <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest mt-4 mb-1 text-center">Mã đặt vé</p>
                <p className="font-mono font-bold text-xl sm:text-2xl text-black tracking-widest text-center leading-none">
                  {selectedTicket.bookingCode || selectedTicket._id.slice(-6).toUpperCase()}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  ) : (
    <Loading />
  );
};

export default MyBookings;
