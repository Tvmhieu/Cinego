import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { assets } from "../assets/assets";
import Loading from "../components/Loading";
import { ArrowRightIcon, ClockIcon } from "lucide-react";
import isoTimeFormat from "../lib/isoTimeFormat";
import BlurCircle from "../components/BlurCircle";
import toast from "react-hot-toast";
import { useAppContext } from "../context/AppContext";

const SeatLayout = ({ propId, propDate }) => {
  const groupRows = [
    ["A", "B"],
    ["C", "D"],
    ["E", "F"],
    ["G", "H"],
    ["I", "J"],
  ];

  const { id: paramId, date: paramDate } = useParams();
  const id = propId || paramId;
  const date = propDate || paramDate;
  
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [show, setShow] = useState(null);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const navigate = useNavigate();

  const { axios, getToken, user } = useAppContext();

  const getShow = async () => {
    try {
      const { data } = await axios.get(`/api/show/${id}`);

      if (data.success) {
        setShow(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSeatClick = (seatId) => {
    if (!selectedTime) {
      document.getElementById("dateSelect")?.scrollIntoView({ behavior: "smooth" });
      return toast("Vui lòng chọn khung giờ chiếu trước");
    }
    if (!selectedSeats.includes(seatId) && selectedSeats.length >= 5) {
      return toast("Bạn chỉ được chọn tối đa 5 ghế");
    }
    if (occupiedSeats.includes(seatId)) {
      return toast("Ghế này đã có người đặt");
    }
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((seat) => seat !== seatId)
        : [...prev, seatId]
    );
  };

  const renderSeats = (row, count = 9) => {
    return (
      <div key={row} className="flex gap-2 mt-2">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {Array.from({ length: count }, (_, i) => {
            const seatId = `${row}${i + 1}`;
            return (
              <button
                key={seatId}
                onClick={() => handleSeatClick(seatId)}
                className={`h-8 w-8 rounded border border-primary/60 cursor-pointer
                   ${
                     selectedSeats.includes(seatId) && "bg-primary text-white"
                   } ${occupiedSeats.includes(seatId) && "opacity-50"}`}
              >
                {seatId}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const getOccupiedSeats = async () => {
    try {
      const { data } = await axios.get(
        `/api/booking/seats/${selectedTime.showId}`
      );

      if (data.success) {
        setOccupiedSeats(data.occupiedSeats);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const bookTickets = async () => {
    try {
      if (!user) return toast.error("Vui lòng đăng nhập để tiếp tục");

      if (!selectedSeats || !selectedSeats.length) {
        if (!selectedTime) document.getElementById("dateSelect")?.scrollIntoView({ behavior: "smooth" });
        return toast.error("Vui lòng chọn khung giờ và ghế ngồi");
      }

      if (!customerName.trim() || !customerPhone.trim()) {
        return toast.error("Vui lòng nhập họ tên và số điện thoại");
      }

      if (!/^\d{9,11}$/.test(customerPhone.trim())) {
        return toast.error("Số điện thoại không hợp lệ");
      }

      const { data } = await axios.post(
        "/api/booking/create",
        { 
          showId: selectedTime.showId, 
          selectedSeats,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim()
        },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );

      if (data.success) {
        // Redirect to QR payment page
        navigate(`/payment/${data.bookingId}`);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    getShow();
  }, [id]);

  useEffect(() => {
    if (selectedTime) {
      getOccupiedSeats();
    }
  }, [selectedTime]);

  return show ? (
    <div className={`flex flex-col md:flex-row ${propId ? 'mt-10' : 'px-6 md:px-16 lg:px-40 py-30 md:pt-50'}`}>
      {/* Available Timings */}
      <div className="py-10 border rounded-lg w-60 bg-primary/10 border-primary/20 h-max md:sticky md:top-30">
        <p className="px-6 text-lg font-semibold">Khung giờ chiếu</p>

        <div className="mt-5 space-y-1">
          {(Array.isArray(show?.dateTime?.[date])
            ? show.dateTime[date]
            : []
          ).map((item) => (
            <div
              key={item.time}
              onClick={() => setSelectedTime(item)}
              className={`flex items-center gap-2 px-6 py-2 w-max rounded-r-md cursor-pointer transition ${
                selectedTime?.time === item.time
                  ? "bg-primary text-white"
                  : "hover:bg-primary/20"
              }`}
            >
              <ClockIcon className="w-4 h-4" />
              <p className="text-sm">{isoTimeFormat(item.time)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Seats Layout  */}
      <div className="relative flex flex-col items-center flex-1 max-md:mt-16">
        <BlurCircle top="-100px" left="-100px" />
        <BlurCircle bottom="0" right="0" />

        <h1 className="mb-4 text-2xl font-semibold">Chọn ghế ngồi</h1>

        <div className="w-full max-w-full overflow-x-auto pb-4 no-scrollbar">
          <div className="flex flex-col items-center text-xs text-gray-300 min-w-[600px]">
            <img src={assets.screenImage} alt="screen" />
            <p className="mb-6 text-sm text-gray-400">MÀN HÌNH CHÍNH</p>

            <div className="flex flex-col gap-2 mt-4 mb-6">
              {groupRows[0].map((row) => renderSeats(row))}
            </div>

            <div className="flex flex-col gap-2">
              {groupRows.slice(1).map((group, idx) => (
                <div key={idx} className="flex flex-col gap-2 mb-6">{group.map((row) => renderSeats(row))}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full max-w-md mt-10 space-y-4">
          <h2 className="text-lg font-semibold text-white">Thông tin khách hàng</h2>
          <div>
            <label className="block mb-1 text-sm text-gray-400">Họ và tên *</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nhập họ và tên..."
              className="w-full px-4 py-2 border rounded-md bg-transparent border-gray-600 focus:border-primary outline-none text-white"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm text-gray-400">Số điện thoại *</label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Nhập số điện thoại..."
              className="w-full px-4 py-2 border rounded-md bg-transparent border-gray-600 focus:border-primary outline-none text-white"
            />
          </div>
        </div>

        <button
          onClick={bookTickets}
          className="flex items-center gap-1 px-10 py-3 mt-8 text-sm font-medium transition rounded-full cursor-pointer bg-primary hover:bg-primary-dull active:scale-95"
        >
          Thanh toán ngay
          <ArrowRightIcon strokeWidth={3} className="w-4 h-4" />
        </button>
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default SeatLayout;
