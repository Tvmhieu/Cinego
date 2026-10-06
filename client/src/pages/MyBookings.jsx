import { useCallback, useEffect, useState } from "react";
import Loading from "../components/Loading";
import BlurCircle from "../components/BlurCircle";
import timeFormat from "../lib/timeFormat";
import { dateFormat } from "../lib/dateFormat";
import { useAppContext } from "../context/AppContext";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const MyBookings = () => {
  const { axios, getToken, user, image_base_url } = useAppContext();

  const currency = import.meta.env.VITE_CURRENCY;

  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

      <h1 className="mb-4 text-lg font-semibold">Vé của tôi</h1>

      <div className="grid gap-8 mt-8">
        {bookings.map((item, index) => (
          <div
            key={index}
            className="relative flex flex-col md:flex-row w-full max-w-4xl mx-auto bg-[#1a1a1a] rounded-3xl overflow-hidden shadow-2xl border border-gray-800/60 group transition hover:border-primary/50"
          >
            {/* Left: Movie Poster */}
            <div className="relative w-full md:w-1/3 aspect-video md:aspect-auto shrink-0">
              <img
                src={image_base_url + item.show.movie.poster_path}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#1a1a1a] via-[#1a1a1a]/40 to-transparent"></div>
              <div className="absolute top-4 left-4 bg-primary/90 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                CineGo Ticket
              </div>
            </div>

            {/* Middle: Ticket Details */}
            <div className="flex-1 flex flex-col md:flex-row relative z-10 -mt-12 md:mt-0 bg-gradient-to-t md:bg-none from-[#1a1a1a] via-[#1a1a1a] to-transparent pt-12 md:pt-0">
              <div className="flex-1 p-6 md:p-8 flex flex-col justify-center relative border-b-2 md:border-b-0 md:border-r-2 border-dashed border-gray-700/50">
                
                {/* Cutouts for ticket effect */}
                <div className="hidden md:block absolute -top-4 -right-4 w-8 h-8 bg-background rounded-full border-b border-l border-gray-800/60"></div>
                <div className="hidden md:block absolute -bottom-4 -right-4 w-8 h-8 bg-background rounded-full border-t border-l border-gray-800/60"></div>
                
                <h2 className="text-2xl md:text-3xl font-extrabold uppercase mb-1 text-white line-clamp-2">
                  {item.show.movie.title}
                </h2>
                <p className="text-sm font-medium text-gray-400 mb-6 flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-gray-800 rounded text-xs">2D</span>
                  Thời lượng: {timeFormat(item.show.movie.runtime)}
                </p>
                
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-1">Giờ chiếu</p>
                    <p className="text-base font-bold text-gray-200">{dateFormat(item.show.showDateTime)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-1">Ghế ngồi</p>
                    <p className="text-2xl font-black text-primary drop-shadow-md">{item.bookedSeats.join(", ")}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-1">Khách hàng</p>
                    <p className="text-sm font-bold text-gray-300 truncate">{item.customerName || user?.name || "Khách ẩn danh"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-1">Tổng tiền</p>
                    <p className="text-sm font-bold text-gray-300">{item.amount.toLocaleString("vi-VN")} {currency}</p>
                  </div>
                </div>
              </div>

              {/* Right: Stub / Actions */}
              <div className="w-full md:w-56 bg-[#1f1f1f] p-6 flex flex-col items-center justify-center relative shrink-0">
                <div className="bg-white p-2 rounded-lg mb-4">
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${item.bookingCode || item._id}`} alt="QR Code" className="w-16 h-16 opacity-90 mix-blend-multiply" />
                </div>
                
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Mã đặt vé</p>
                <p className="font-mono font-bold text-lg text-white tracking-widest mb-5">
                  {item.bookingCode || item._id.slice(-6).toUpperCase()}
                </p>
                
                {/* Status & Actions */}
                <div className="w-full space-y-3">
                  <div className={`w-full text-center text-[11px] font-bold py-2 rounded-md uppercase tracking-wider ${item.isCancelled ? 'bg-red-500/10 text-red-500 border border-red-500/20' : item.isPaid ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'}`}>
                    {item.isCancelled ? 'Đã hủy' : item.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </div>
                  
                  {!item.isPaid && !item.isCancelled && (
                    <div className="flex flex-col gap-2">
                      <Link
                        to={`/payment/${item._id}`}
                        className="w-full text-center bg-primary hover:bg-primary-dull text-white py-2 rounded-md text-xs font-bold transition shadow-lg shadow-primary/20"
                      >
                        Thanh toán
                      </Link>
                      <button
                        onClick={() => handleCancel(item._id)}
                        className="w-full text-center border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white py-2 rounded-md text-xs font-bold transition"
                      >
                        Hủy vé
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default MyBookings;
