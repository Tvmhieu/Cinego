import { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import Title from "../../components/admin/Title";
import { dateFormat } from "../../lib/dateFormat";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CreditCardIcon, TicketCheckIcon, XCircleIcon, AlertCircleIcon, ArrowLeftIcon, TicketIcon, SearchIcon } from "lucide-react";

const ListBookings = () => {
  const { axios, getToken, user } = useAppContext();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const showIdFilter = searchParams.get("showId");

  const currency = import.meta.env.VITE_CURRENCY;

  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const getAllBookings = async () => {
    const abortController = new AbortController();
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication token not available");
      }
      const { data } = await axios.get("/api/admin/all-bookings", {
        headers: { Authorization: `Bearer ${token}` },
        signal: abortController.signal,
      });
      setBookings(data.bookings);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error(error);
        setError("Failed to load bookings. Please try again.");
      }
    }
    setIsLoading(false);
  };

  const handleConfirmPayment = async (bookingId) => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        "/api/admin/confirm-payment",
        { bookingId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success("Đã xác nhận thanh toán!");
        getAllBookings(); // Refresh list
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Lỗi khi xác nhận thanh toán");
    }
  };

  const handleCheckIn = async (bookingId) => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        "/api/admin/check-in",
        { bookingId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(data.message);
        getAllBookings(); // Refresh list
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Lỗi khi cập nhật trạng thái soát vé");
    }
  };

  useEffect(() => {
    if (user) {
      getAllBookings();
    }
  }, [user]);

  const filteredBookings = bookings.filter((item) => {
    if (!item || !item.show || !item.show.movie) return false;
    
    // Show ID filter (from ListShows)
    if (showIdFilter) {
      if (item.show._id !== showIdFilter) return false;
      // Only show valid, paid tickets when viewing a specific show
      if (!item.isPaid || item.isCancelled) return false;
    }
    
    // Search Term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const bookingCode = item.bookingCode?.toLowerCase() || item._id.toLowerCase();
      const movieTitle = item.show.movie.title.toLowerCase();
      const customerName = (item.customerName || item.user?.name || "").toLowerCase();
      const customerPhone = item.customerPhone || "";
      const showCode = item.show.showCode?.toLowerCase() || "";
      
      if (!bookingCode.includes(term) && !movieTitle.includes(term) && !customerName.includes(term) && !customerPhone.includes(term) && !showCode.includes(term)) {
        return false;
      }
    }
    
    return true;
  });

  const renderStatus = (item) => {
    if (item.isCancelled && !item.isPaid) {
      return (
        <span className="flex items-center gap-1 w-max px-2.5 py-1 text-xs font-medium text-red-400 rounded-full bg-red-500/10 border border-red-500/20">
          <XCircleIcon className="w-3.5 h-3.5" /> Đã hủy
        </span>
      );
    }
    if (item.isCancelled && item.isPaid) {
      return (
        <span className="flex items-center gap-1 w-max px-2.5 py-1 text-xs font-medium text-purple-400 rounded-full bg-purple-500/10 border border-purple-500/20">
          <AlertCircleIcon className="w-3.5 h-3.5" /> Hủy (Chờ hoàn tiền)
        </span>
      );
    }
    if (item.isCheckedIn) {
      return (
        <span className="flex items-center gap-1 w-max px-2.5 py-1 text-xs font-medium text-blue-400 rounded-full bg-blue-500/10 border border-blue-500/20">
          <TicketCheckIcon className="w-3.5 h-3.5" /> Đã vào rạp
        </span>
      );
    }
    if (item.isPaid) {
      return (
        <span className="flex items-center gap-1 w-max px-2.5 py-1 text-xs font-medium text-green-400 rounded-full bg-green-500/10 border border-green-500/20">
          <CreditCardIcon className="w-3.5 h-3.5" /> Đã thanh toán
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 w-max px-2.5 py-1 text-xs font-medium text-yellow-400 rounded-full bg-yellow-500/10 border border-yellow-500/20">
        <AlertCircleIcon className="w-3.5 h-3.5" /> Chờ thanh toán
      </span>
    );
  };

  return !isLoading ? (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <Title text1="Danh sách" text2="Vé đã đặt" />
        
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-800 rounded-xl leading-5 bg-[#161616] text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
              placeholder="Tìm mã vé, khách hàng, tên phim, mã suất..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {showIdFilter && (
            <button 
              onClick={() => navigate('/admin/list-shows')}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800/50 border border-gray-700 rounded-xl hover:bg-gray-700 transition shadow-sm whitespace-nowrap"
            >
              <ArrowLeftIcon className="w-4 h-4" /> DS Suất chiếu
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 mb-6 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2">
          <AlertCircleIcon className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Mobile Card Layout */}
      <div className="md:hidden flex flex-col gap-4 pb-6">
        {filteredBookings.length === 0 ? (
          <div className="w-full py-12 flex flex-col items-center justify-center bg-[#111] rounded-2xl border border-gray-800">
            <TicketIcon className="w-12 h-12 text-gray-700 mb-2" />
            <p className="text-gray-500">Chưa có vé nào được đặt</p>
          </div>
        ) : (
          filteredBookings.map((item) => (
            <div key={item._id} className="flex flex-col bg-[#161616] rounded-2xl border border-gray-800 p-4 shadow-md">
              <div className="flex justify-between items-start mb-3 border-b border-gray-800/60 pb-3">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Mã Vé</p>
                  <p className="font-mono font-bold text-primary text-base">{item.bookingCode || item._id.slice(-6).toUpperCase()}</p>
                </div>
                {renderStatus(item)}
              </div>
              
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-4">
                <div className="col-span-2">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Phim & Suất Chiếu {item.show.showCode && `- ${item.show.showCode}`}</p>
                  <p className="text-sm font-bold text-white mb-1 leading-tight">{item.show.movie?.title}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-primary/70"></div> {dateFormat(item.show?.showDateTime)}</p>
                </div>
                
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Khách Hàng</p>
                  <p className="text-sm text-gray-200 font-medium truncate">{item.customerName || item.user?.name || "Khách ẩn danh"}</p>
                  {item.customerPhone && <p className="text-xs text-gray-500 mt-0.5">{item.customerPhone}</p>}
                </div>
                
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Ghế & Tiền</p>
                  <p className="text-sm font-bold text-white">{item.bookedSeats?.join(", ")}</p>
                  <p className="text-xs text-primary font-medium mt-0.5">{(item.amount || 0).toLocaleString("vi-VN")} {currency}</p>
                </div>
              </div>

              <div className="flex gap-2 mt-2">
                {!item.isPaid && !item.isCancelled && (
                  <button
                    onClick={() => handleConfirmPayment(item._id)}
                    className="flex-1 py-2.5 bg-green-600/20 text-green-500 hover:bg-green-600 hover:text-white border border-green-600/30 rounded-xl text-sm font-bold transition active:scale-95"
                  >
                    Xác nhận TT
                  </button>
                )}
                {item.isPaid && !item.isCancelled && (
                  <button
                    onClick={() => handleCheckIn(item._id)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition border active:scale-95 ${item.isCheckedIn ? 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700' : 'bg-blue-600/20 text-blue-500 border-blue-600/30 hover:bg-blue-600 hover:text-white'}`}
                  >
                    {item.isCheckedIn ? "Hủy Soát Vé" : "Xác Nhận Soát Vé"}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden md:block w-full overflow-hidden bg-[#161616] rounded-2xl border border-gray-800 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-900/50 border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Mã vé</th>
                <th className="px-6 py-4 font-medium">Khách hàng</th>
                <th className="px-6 py-4 font-medium">Phim & Suất chiếu</th>
                <th className="px-6 py-4 font-medium">Ghế & Giá</th>
                <th className="px-6 py-4 font-medium">Trạng thái</th>
                <th className="px-6 py-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-800/60">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    Chưa có vé nào được đặt
                  </td>
                </tr>
              ) : (
                filteredBookings.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-primary bg-primary/10 px-2 py-1 rounded border border-primary/20">
                        {item.bookingCode || item._id.slice(-6).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-200">{item.customerName || item.user?.name || "Khách ẩn danh"}</p>
                      {item.customerPhone && (
                        <p className="text-xs text-gray-500 mt-0.5">{item.customerPhone}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-white mb-0.5">
                        {item.show.movie?.title || "Phim không xác định"} 
                        {item.show.showCode && <span className="ml-2 font-mono text-xs text-gray-500">({item.show.showCode})</span>}
                      </p>
                      <p className="text-xs text-gray-400">{dateFormat(item.show?.showDateTime)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-200 mb-0.5">{item.bookedSeats?.join(", ") || "N/A"}</p>
                      <p className="text-xs font-medium text-primary">
                        {(item.amount || 0).toLocaleString("vi-VN")} {currency}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {renderStatus(item)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {!item.isPaid && !item.isCancelled && (
                          <button
                            onClick={() => handleConfirmPayment(item._id)}
                            className="px-4 py-1.5 text-xs font-bold text-green-500 bg-green-500/10 border border-green-500/20 rounded-lg hover:bg-green-500 hover:text-white transition active:scale-95"
                          >
                            Xác nhận TT
                          </button>
                        )}
                        {item.isPaid && !item.isCancelled && (
                          <button
                            onClick={() => handleCheckIn(item._id)}
                            className={`px-4 py-1.5 text-xs font-bold rounded-lg border transition active:scale-95 ${item.isCheckedIn ? 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700 hover:text-white' : 'bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500 hover:text-white'}`}
                          >
                            {item.isCheckedIn ? "Hủy Soát Vé" : "Soát Vé"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default ListBookings;
