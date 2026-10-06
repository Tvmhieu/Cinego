import { useEffect, useState } from "react";
import { dummyBookingData } from "../../assets/assets";
import Loading from "../../components/Loading";
import Title from "../../components/admin/Title";
import { dateFormat } from "../../lib/dateFormat";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { useSearchParams, useNavigate } from "react-router-dom";

const ListBookings = () => {
  const { axios, getToken, user } = useAppContext();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const showIdFilter = searchParams.get("showId");

  const currency = import.meta.env.VITE_CURRENCY;

  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const getAllBookings = async () => {
    // setBookings(dummyBookingData);
    // setIsLoading(false);

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

  useEffect(() => {
    if (user) {
      getAllBookings();
    }
  }, [user]);

  return !isLoading ? (
    <>
      <div className="flex items-center justify-between">
        <Title text1="Danh sách" text2="Vé đã đặt" />
        {showIdFilter && (
          <button 
            onClick={() => navigate('/admin/list-shows')}
            className="px-4 py-2 text-sm text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-800 transition"
          >
            Quay lại Danh sách suất chiếu
          </button>
        )}
      </div>
      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}
      <div className="max-w-5xl mt-6 overflow-x-auto">
        <table className="w-full overflow-hidden border-collapse rounded-md text-nowrap">
          <thead>
            <tr className="text-left text-white bg-primary/20">
              <th className="p-2 pl-5 font-medium">Tên khách hàng</th>
              <th className="p-2 font-medium">Tên phim</th>
              <th className="p-2 font-medium">Giờ chiếu</th>
              <th className="p-2 font-medium">Ghế</th>
              <th className="p-2 font-medium">Tổng tiền</th>
              <th className="p-2 font-medium">Trạng thái</th>
              <th className="p-2 font-medium">Thao tác</th>
            </tr>
          </thead>

          <tbody className="text-sm font-light">
            {bookings
              .filter((item) => {
                if (!item || !item.user || !item.show || !item.show.movie) return false;
                if (showIdFilter && item.show._id !== showIdFilter) return false;
                return true;
              })
              .map((item, index) => (
                <tr
                  key={item._id || index}
                  className="border-b border-primary/20 bg-primary/5 even:bg-primary/10"
                >
                  <td className="p-2 pl-5 min-w-45">
                    {item.customerName || item.user?.name || "Khách ẩn danh"}
                    {item.customerPhone && (
                      <div className="text-xs text-gray-400">{item.customerPhone}</div>
                    )}
                  </td>
                  <td className="p-2">{item.show.movie?.title || "Phim không xác định"}</td>
                  <td className="p-2">{dateFormat(item.show?.showDateTime)}</td>
                  <td className="p-2">{item.bookedSeats?.join(", ") || "N/A"}</td>
                  <td className="p-2">
                    {(item.amount || 0).toLocaleString("vi-VN")} {currency}
                  </td>
                  <td className="p-2">
                    {item.isCancelled && !item.isPaid ? (
                      <span className="px-2 py-1 text-xs font-medium text-red-400 rounded-full bg-red-500/20">
                        Đã hủy
                      </span>
                    ) : item.isCancelled && item.isPaid ? (
                      <span className="px-2 py-1 text-xs font-medium text-purple-400 rounded-full bg-purple-500/20">
                        Thanh toán muộn (Cần xử lý)
                      </span>
                    ) : item.isPaid ? (
                      <span className="px-2 py-1 text-xs font-medium text-green-400 rounded-full bg-green-500/20">
                        Đã thanh toán
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium text-yellow-400 rounded-full bg-yellow-500/20">
                        Chờ thanh toán
                      </span>
                    )}
                  </td>
                  <td className="p-2">
                    {!item.isPaid && !item.isCancelled && (
                      <button
                        onClick={() => handleConfirmPayment(item._id)}
                        className="px-3 py-1 text-xs font-medium text-white transition rounded-md cursor-pointer bg-green-600 hover:bg-green-700 active:scale-95"
                      >
                        Xác nhận
                      </button>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  ) : (
    <Loading />
  );
};

export default ListBookings;
