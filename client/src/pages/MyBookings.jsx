import { useCallback, useEffect, useState } from "react";
import Loading from "../components/Loading";
import BlurCircle from "../components/BlurCircle";
import timeFormat from "../lib/timeFormat";
import { dateFormat } from "../lib/dateFormat";
import { useAppContext } from "../context/AppContext";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { XIcon } from "lucide-react";

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

  return !isLoading ? (
    <div className="relative px-6 md:px-16 lg:px-40 pt-30 md:pt-40 min-h-[80vh]">
      <BlurCircle top="100px" left="100px" />
      <div>
        <BlurCircle bottom="0px" left="600px" />
      </div>

      <h1 className="mb-6 text-2xl font-bold text-white">Lịch sử đặt vé</h1>

      <div className="grid gap-4 mt-4">
        {bookings.map((item, index) => (
          <div
            key={index}
            className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-gray-900/50 border border-gray-800 rounded-2xl hover:bg-gray-800/50 transition-colors"
          >
            <img
              src={image_base_url + item.show.movie.poster_path}
              alt=""
              className="w-full sm:w-24 h-36 sm:h-32 object-cover rounded-xl shadow-lg"
            />
            
            <div className="flex-1 w-full flex flex-col justify-between py-1">
              <div>
                <h3 className="text-lg font-bold text-white line-clamp-1">{item.show.movie.title}</h3>
                <p className="text-sm text-gray-400 mt-1">{dateFormat(item.show.showDateTime)}</p>
                <p className="text-sm text-gray-400">Ghế: <span className="font-bold text-primary">{item.bookedSeats.join(", ")}</span></p>
              </div>
              
              <div className="flex items-center gap-3 mt-3">
                <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${item.isCancelled ? 'bg-red-500/10 text-red-500 border border-red-500/20' : item.isPaid ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'}`}>
                  {item.isCancelled ? 'Đã hủy' : item.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </span>
                <span className="text-sm font-bold">{item.amount.toLocaleString("vi-VN")} {currency}</span>
              </div>
            </div>

            <div className="w-full sm:w-auto flex flex-col gap-2 shrink-0">
              {item.isPaid && !item.isCancelled ? (
                <button
                  onClick={() => setSelectedTicket(item)}
                  className="px-6 py-2.5 bg-primary hover:bg-primary-dull text-white text-sm font-bold rounded-xl transition shadow-lg shadow-primary/20 w-full"
                >
                  Mở Vé / Mã QR
                </button>
              ) : !item.isCancelled && !item.isPaid ? (
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <Link
                    to={`/payment/${item._id}`}
                    className="px-6 py-2.5 bg-primary hover:bg-primary-dull text-white text-sm font-bold text-center rounded-xl transition shadow-lg shadow-primary/20 flex-1"
                  >
                    Thanh toán
                  </Link>
                  <button
                    onClick={() => handleCancel(item._id)}
                    className="px-6 py-2.5 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white text-sm font-bold rounded-xl transition flex-1"
                  >
                    Hủy vé
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        ))}
        {bookings.length === 0 && (
          <div className="text-center py-10 text-gray-400">Bạn chưa đặt vé nào.</div>
        )}
      </div>

      {/* Ticket Modal Overlay */}
      {selectedTicket && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-[280px] sm:max-w-[320px] mx-auto animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setSelectedTicket(null)}
              className="absolute -top-12 right-0 md:-right-12 text-white/70 hover:text-white bg-gray-800/50 hover:bg-gray-700 p-2 rounded-full transition z-20"
            >
              <XIcon className="w-6 h-6" />
            </button>
            
            {/* The Gorgeous Compact Ticket UI */}
            <div className="relative flex flex-col w-full bg-[#1a1a1a] rounded-[20px] overflow-hidden shadow-2xl border border-gray-700">
              {/* Top: Movie Poster */}
              <div className="relative w-full aspect-[21/9] shrink-0">
                <img
                  src={image_base_url + (selectedTicket.show.movie.backdrop_path || selectedTicket.show.movie.poster_path)}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent"></div>
                <div className="absolute top-2 left-2 bg-primary/90 backdrop-blur-md text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest shadow-lg">
                  CineGo
                </div>
              </div>

              {/* Middle: Ticket Details */}
              <div className="flex-1 px-4 pt-1 pb-4 relative z-10 bg-transparent border-b-2 border-dashed border-gray-700/50">
                <h2 className="text-base sm:text-lg font-bold uppercase mb-1 text-white line-clamp-2 leading-tight drop-shadow-md">
                  {selectedTicket.show.movie.title}
                </h2>
                <p className="text-[10px] sm:text-xs font-medium text-gray-400 mb-3 flex items-center gap-1.5">
                  <span className="px-1 py-0.5 bg-gray-800 rounded text-[9px]">2D</span>
                  {timeFormat(selectedTicket.show.movie.runtime)}
                </p>
                
                <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                  <div>
                    <p className="text-[8px] sm:text-[9px] text-gray-500 uppercase tracking-widest mb-0.5">Giờ chiếu</p>
                    <p className="text-[11px] sm:text-xs font-bold text-gray-200">{dateFormat(selectedTicket.show.showDateTime)}</p>
                  </div>
                  <div>
                    <p className="text-[8px] sm:text-[9px] text-gray-500 uppercase tracking-widest mb-0.5">Ghế ngồi</p>
                    <p className="text-base sm:text-lg font-black text-primary drop-shadow-md leading-none">{selectedTicket.bookedSeats.join(", ")}</p>
                  </div>
                  <div>
                    <p className="text-[8px] sm:text-[9px] text-gray-500 uppercase tracking-widest mb-0.5">Khách hàng</p>
                    <p className="text-[11px] sm:text-xs font-bold text-gray-300 truncate">{selectedTicket.customerName || user?.name || "Ẩn danh"}</p>
                  </div>
                  <div>
                    <p className="text-[8px] sm:text-[9px] text-gray-500 uppercase tracking-widest mb-0.5">Tổng tiền</p>
                    <p className="text-[11px] sm:text-xs font-bold text-gray-300">{selectedTicket.amount.toLocaleString("vi-VN")} {currency}</p>
                  </div>
                </div>
              </div>

              {/* Bottom: Large QR Code */}
              <div className="w-full bg-white p-4 flex flex-col items-center justify-center relative shrink-0">
                {/* Cutouts for ticket effect */}
                <div className="absolute -top-3 -left-3 w-6 h-6 bg-black/80 rounded-full border-b border-r border-gray-700/50"></div>
                <div className="absolute -top-3 -right-3 w-6 h-6 bg-black/80 rounded-full border-b border-l border-gray-700/50"></div>
                
                <h3 className="text-black font-bold text-center mb-2 uppercase tracking-widest text-[10px] sm:text-xs">Quét mã để vào rạp</h3>
                <div className="w-24 sm:w-28 aspect-square relative bg-white border-[3px] border-primary rounded-xl overflow-hidden p-1 shadow-[0_0_10px_rgba(229,9,20,0.2)]">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${selectedTicket.bookingCode || selectedTicket._id}`} 
                    alt="QR Code" 
                    className="w-full h-full object-contain" 
                  />
                </div>
                
                <p className="text-[8px] sm:text-[9px] text-gray-500 uppercase tracking-widest mt-2 mb-0.5 text-center">Mã đặt vé</p>
                <p className="font-mono font-bold text-base sm:text-lg text-black tracking-widest text-center leading-none">
                  {selectedTicket.bookingCode || selectedTicket._id.slice(-6).toUpperCase()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  ) : (
    <Loading />
  );
};

export default MyBookings;
