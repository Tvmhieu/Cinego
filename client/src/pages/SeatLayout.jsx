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
      document.getElementById("timeSelect")?.scrollIntoView({ behavior: "smooth" });
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
      <div key={row} className="flex gap-2 md:gap-3 mt-2">
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
          {Array.from({ length: count }, (_, i) => {
            const seatId = `${row}${i + 1}`;
            const isSelected = selectedSeats.includes(seatId);
            const isOccupied = occupiedSeats.includes(seatId);
            
            return (
              <button
                key={seatId}
                onClick={() => handleSeatClick(seatId)}
                disabled={isOccupied}
                className={`h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-lg flex items-center justify-center text-[10px] md:text-xs font-bold transition-all duration-300 border 
                   ${
                     isSelected
                       ? "bg-primary text-white border-primary shadow-[0_0_15px_rgba(248,69,101,0.6)] scale-110"
                       : isOccupied
                       ? "bg-white/5 text-white/20 border-white/5 opacity-40 cursor-not-allowed"
                       : "bg-white/5 text-white/70 border-white/15 cursor-pointer hover:border-primary hover:text-primary hover:shadow-[0_0_10px_rgba(248,69,101,0.3)] hover:-translate-y-1"
                   }`}
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
    <div className={`flex flex-col relative ${propId ? 'mt-10' : 'px-4 md:px-12 lg:px-24 py-24 md:pt-40'}`}>
      {/* Ambient background glow */}
      {!propId && <div className="absolute top-40 right-20 w-96 h-96 bg-primary/10 blur-[150px] rounded-full pointer-events-none" />}
      
      {/* Available Timings */}
      <div className="flex flex-col items-center mb-10 md:mb-16 w-full relative z-10" id="timeSelect">
        <p className="text-lg md:text-xl font-bold mb-6 flex items-center gap-3 tracking-wide">
          <span className="bg-white/10 text-primary border border-primary/30 w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-[0_0_10px_rgba(248,69,101,0.2)]">2</span>
          Chọn suất chiếu
        </p>

        <div className={`flex flex-wrap justify-center gap-3 md:gap-4 p-5 md:p-6 rounded-3xl transition-all duration-500 bg-white/5 backdrop-blur-md border border-white/5 ${!selectedTime ? 'ring-2 ring-primary ring-offset-4 ring-offset-[#09090b] animate-pulse shadow-[0_0_30px_rgba(248,69,101,0.3)]' : ''}`}>
          {(Array.isArray(show?.dateTime?.[date])
            ? show.dateTime[date]
            : []
          ).map((item) => (
            <div
              key={item.time}
              onClick={() => setSelectedTime(item)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full cursor-pointer transition-all duration-300 border ${
                selectedTime?.time === item.time
                  ? "bg-primary text-white border-primary scale-105 shadow-[0_0_20px_rgba(248,69,101,0.6)]"
                  : "bg-white/5 hover:bg-white/10 text-gray-300 border-white/10 hover:border-white/30"
              }`}
            >
              <ClockIcon className="w-4 h-4" />
              <p className="text-sm font-semibold tracking-wider">{isoTimeFormat(item.time)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Seats Layout  */}
      <div className="relative flex flex-col items-center flex-1 max-md:mt-8 z-10">
        <BlurCircle top="-100px" left="-100px" />
        
        <h1 className="mb-6 text-xl md:text-2xl font-bold flex items-center gap-3 tracking-wide">
          <span className="bg-white/10 text-primary border border-primary/30 w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-[0_0_10px_rgba(248,69,101,0.2)]">3</span>
          Sơ đồ ghế
        </h1>

        <div className={`w-full max-w-full overflow-x-auto pb-6 no-scrollbar p-6 md:p-10 rounded-3xl transition-all duration-500 bg-white/5 backdrop-blur-md border border-white/5 shadow-2xl ${selectedTime && selectedSeats.length === 0 ? 'ring-2 ring-primary ring-offset-4 ring-offset-[#09090b] animate-[pulse_2s_ease-in-out_infinite] shadow-[0_0_40px_rgba(248,69,101,0.2)] bg-primary/5' : ''}`}>
          <div className={`flex flex-col items-center text-xs text-gray-300 min-w-[600px] transition-all duration-500 ${!selectedTime ? 'opacity-30 grayscale blur-[2px]' : ''}`}>
            
            {/* Cinematic Screen */}
            <div className="relative w-full max-w-[500px] mb-12 flex flex-col items-center">
              <div className="w-full h-2 bg-white/20 rounded-t-full shadow-[0_-15px_40px_rgba(255,255,255,0.2)] blur-[1px]" />
              <img src={assets.screenImage} alt="screen" className="w-full mt-2 drop-shadow-[0_20px_30px_rgba(255,255,255,0.15)]" />
              <p className="mt-4 text-sm font-bold tracking-[0.2em] text-gray-400 drop-shadow-md">MÀN HÌNH</p>
            </div>

            <div className="flex flex-col gap-2 md:gap-3 mb-6 md:mb-8">
              {groupRows[0].map((row) => renderSeats(row))}
            </div>

            <div className="flex flex-col gap-2 md:gap-3">
              {groupRows.slice(1).map((group, idx) => (
                <div key={idx} className="flex flex-col gap-2 md:gap-3 mb-6 md:mb-8">{group.map((row) => renderSeats(row))}</div>
              ))}
            </div>
            
            {/* Seat Legend */}
            <div className="flex items-center gap-6 mt-6 p-4 rounded-xl bg-black/40 border border-white/5">
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-white/5 border border-white/20"></div> <span className="text-xs font-medium">Trống</span></div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-primary border border-primary shadow-[0_0_10px_rgba(248,69,101,0.5)]"></div> <span className="text-xs font-medium text-white">Đang chọn</span></div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-white/5 border border-white/5 opacity-50"></div> <span className="text-xs font-medium">Đã đặt</span></div>
            </div>
          </div>
        </div>

        {selectedSeats.length > 0 && selectedTime && (
          <div className="w-full max-w-lg mt-10 p-6 md:p-8 bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-white mb-5 tracking-wide flex items-center gap-2">
              <TicketPlus className="w-5 h-5 text-primary" /> Thông tin vé
            </h2>
            <div className="flex justify-between items-center text-sm mb-3">
              <span className="text-gray-400 font-medium">Ghế đã chọn:</span>
              <span className="font-bold text-white bg-white/10 px-3 py-1 rounded-lg border border-white/5">{selectedSeats.join(", ")}</span>
            </div>
            <div className="flex justify-between items-center text-sm mb-4">
              <span className="text-gray-400 font-medium">Số lượng:</span>
              <span className="font-bold text-white">{selectedSeats.length} vé</span>
            </div>
            <div className="flex justify-between items-center text-lg md:text-xl font-black text-primary mt-4 pt-4 border-t border-white/10">
              <span>Tổng thanh toán:</span>
              <span>{(selectedSeats.length * (selectedTime.price || 250000)).toLocaleString("vi-VN")} VNĐ</span>
            </div>
          </div>
        )}

        <div className="w-full max-w-lg mt-8 p-6 md:p-8 bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6 tracking-wide">Thông tin liên hệ</h2>
          <div className="space-y-5">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-400">Họ và tên *</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full px-5 py-3.5 border rounded-xl bg-white/5 border-white/10 focus:border-primary focus:bg-white/10 outline-none text-white font-medium transition-all duration-300 placeholder:text-gray-600 shadow-inner"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-400">Số điện thoại *</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="0901234567"
                className="w-full px-5 py-3.5 border rounded-xl bg-white/5 border-white/10 focus:border-primary focus:bg-white/10 outline-none text-white font-medium transition-all duration-300 placeholder:text-gray-600 shadow-inner"
              />
            </div>
          </div>
        </div>

        <button
          onClick={bookTickets}
          className="group flex items-center justify-center gap-2 w-full max-w-lg px-8 py-4 mt-8 mb-12 text-base font-bold tracking-wide transition-all duration-300 rounded-full cursor-pointer bg-primary text-white hover:bg-white hover:text-black shadow-[0_0_20px_rgba(248,69,101,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] active:scale-95"
        >
          Xác nhận Thanh toán
          <ArrowRightIcon strokeWidth={3} className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default SeatLayout;
