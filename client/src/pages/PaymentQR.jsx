import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import Loading from "../components/Loading";
import { ArrowLeft, RefreshCcw } from "lucide-react";
import toast from "react-hot-toast";

const PaymentQR = () => {
  const { bookingId } = useParams();
  const { axios, getToken } = useAppContext();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  // Bank Info from ENV or Hardcoded for now
  const BANK_ID = "MB";
  const ACCOUNT_NO = "0346118379";
  const ACCOUNT_NAME = "TRAN VAN MINH HIEU";

  const fetchBooking = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(`/api/booking/detail/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        setBooking(data.booking);
        if (data.booking.isPaid) {
          navigate("/payment-result?status=success&code=" + data.booking.bookingCode);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải thông tin vé");
    } finally {
      setLoading(false);
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    // Cuộn lên đầu trang khi vừa vào
    window.scrollTo(0, 0);
    
    fetchBooking();
    
    // Auto polling every 10 seconds to check payment status
    const intervalId = setInterval(() => {
      fetchBooking();
    }, 10000);

    return () => clearInterval(intervalId);
  }, [bookingId]);

  useEffect(() => {
    if (booking && !booking.isPaid) {
      const createdAt = new Date(booking.createdAt).getTime();
      const expireTime = createdAt + 5 * 60 * 1000;
      
      const updateTimer = () => {
        const now = new Date().getTime();
        const diff = Math.floor((expireTime - now) / 1000);
        
        if (diff <= 0) {
          setTimeLeft(0);
          setIsExpired(true);
        } else {
          setTimeLeft(diff);
        }
      };
      
      updateTimer();
      const timerId = setInterval(updateTimer, 1000);
      return () => clearInterval(timerId);
    }
  }, [booking]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleManualCheck = () => {
    setStatusLoading(true);
    fetchBooking();
  };

  if (loading) return <Loading />;
  if (!booking) return <div className="text-center mt-20">Không tìm thấy vé</div>;

  const amount = booking.amount;
  const content = `${booking.bookingCode}`;
  
  // Create VietQR URL
  const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-20 mt-10 md:mt-0 relative overflow-hidden">
      {/* Background glow for ambiance */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-primary/20 blur-[100px] md:blur-[150px] rounded-full pointer-events-none" />

      <div className="relative w-full max-w-md p-6 md:p-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl shadow-2xl">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 mb-6 text-gray-400 hover:text-white transition-colors duration-300"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium tracking-wide">Quay lại</span>
        </button>

        <h1 className="text-xl md:text-2xl font-bold text-center text-white mb-2 tracking-wide">Thanh toán vé xem phim</h1>
        
        {isExpired ? (
          <div className="text-center p-4 mb-6 bg-red-500/10 border border-red-500/20 rounded-xl backdrop-blur-sm">
            <h2 className="text-red-500 font-bold mb-2">Hết thời gian thanh toán!</h2>
            <p className="text-red-400/80 text-sm">Vé của bạn đã bị hủy do quá thời gian 5 phút. Vui lòng quay lại để đặt lại vé.</p>
          </div>
        ) : (
          <>
            <p className="text-center text-gray-400 mb-4 text-sm md:text-base">Quét mã QR bằng ứng dụng ngân hàng để thanh toán.</p>
            <div className="text-center mb-6">
              <span className="inline-block px-5 py-2 bg-red-500/10 border border-red-500/20 text-primary font-bold rounded-full animate-pulse shadow-[0_0_15px_rgba(248,69,101,0.2)]">
                Thời gian còn lại: {formatTime(timeLeft)}
              </span>
            </div>

            <div className="bg-white/95 p-3 md:p-5 rounded-2xl mb-6 flex justify-center shadow-inner ring-4 ring-white/10">
              <img src={qrUrl} alt="VietQR Code" className="max-w-[220px] md:max-w-[250px] w-full object-contain mix-blend-multiply" />
            </div>
          </>
        )}

        <div className="space-y-3 mb-8 bg-black/40 backdrop-blur-md border border-white/5 p-5 rounded-xl">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm font-medium">Số tiền:</span>
            <span className="text-primary font-bold text-lg md:text-xl">{amount.toLocaleString("vi-VN")} VNĐ</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm font-medium">Nội dung CK:</span>
            <span className="font-mono font-bold text-white bg-white/10 px-3 py-1 rounded-lg tracking-wider border border-white/5">{content}</span>
          </div>
          <div className="text-[11px] md:text-xs text-yellow-500/90 mt-4 text-center leading-relaxed">
            ⚠️ Bắt buộc nhập chính xác nội dung chuyển khoản để hệ thống tự động xác nhận.
          </div>
        </div>

        <button
          onClick={handleManualCheck}
          disabled={statusLoading || isExpired}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 font-bold tracking-wide text-white transition-all duration-300 rounded-full bg-primary hover:bg-white hover:text-black hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary disabled:hover:text-white disabled:hover:shadow-none"
        >
          {statusLoading ? (
            <RefreshCcw className="w-5 h-5 animate-spin" />
          ) : (
            <RefreshCcw className="w-5 h-5" />
          )}
          {statusLoading ? "Đang kiểm tra..." : "Kiểm tra trạng thái thanh toán"}
        </button>
        
        {!isExpired && (
          <p className="text-[11px] md:text-xs text-center text-gray-500 mt-5 font-medium">
            Hệ thống sẽ tự động cập nhật sau mỗi 10 giây nếu nhận được tiền.
          </p>
        )}
      </div>
    </div>
  );
};

export default PaymentQR;
