import { useEffect, useState } from "react";
import { dummyBookingData } from "../../assets/assets";
import Loading from "../../components/Loading";
import Title from "../../components/admin/Title";
import { dateFormat } from "../../lib/dateFormat";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const ListBookings = () => {
  const { axios, getToken, user } = useAppContext();

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
      <Title text1="List" text2="Bookings" />
      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}
      <div className="max-w-5xl mt-6 overflow-x-auto">
        <table className="w-full overflow-hidden border-collapse rounded-md text-nowrap">
          <thead>
            <tr className="text-left text-white bg-primary/20">
              <th className="p-2 pl-5 font-medium">User Name</th>
              <th className="p-2 font-medium">Movie Name</th>
              <th className="p-2 font-medium">Show Time</th>
              <th className="p-2 font-medium">Seats</th>
              <th className="p-2 font-medium">Amount</th>
              <th className="p-2 font-medium">Status</th>
              <th className="p-2 font-medium">Action</th>
            </tr>
          </thead>

          <tbody className="text-sm font-light">
            {bookings
              .filter((item) => item && item.user && item.show && item.show.movie) // Filter out null/incomplete data
              .map((item, index) => (
                <tr
                  key={item._id || index}
                  className="border-b border-primary/20 bg-primary/5 even:bg-primary/10"
                >
                  <td className="p-2 pl-5 min-w-45">{item.user?.name || "Unknown User"}</td>
                  <td className="p-2">{item.show.movie?.title || "Unknown Movie"}</td>
                  <td className="p-2">{dateFormat(item.show?.showDateTime)}</td>
                  <td className="p-2">{item.bookedSeats?.join(", ") || "N/A"}</td>
                  <td className="p-2">
                    {currency}
                    {item.amount || 0}
                  </td>
                  <td className="p-2">
                    {item.isPaid ? (
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
                    {!item.isPaid && (
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
