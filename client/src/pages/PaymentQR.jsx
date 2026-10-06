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
    fetchBooking();
    
    // Auto polling every 10 seconds to check payment status
    const intervalId = setInterval(() => {
      fetchBooking();
    }, 10000);

    return () => clearInterval(intervalId);
  }, [bookingId]);

  const handleManualCheck = () => {
    setStatusLoading(true);
    fetchBooking();
  };

  if (loading) return <Loading />;
  if (!booking) return <div className="text-center mt-20">Không tìm thấy vé</div>;

  const amount = booking.amount;
  const content = `CINEGO ${booking.bookingCode}`;
  
  // Create VietQR URL
  const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-20 mt-10 md:mt-0">
      <div className="w-full max-w-md p-8 bg-gray-900 border border-gray-700 rounded-2xl shadow-xl">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 mb-6 text-gray-400 hover:text-white transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại</span>
        </button>

        <h1 className="text-2xl font-bold text-center text-white mb-2">Thanh toán vé xem phim</h1>
        <p className="text-center text-gray-400 mb-6">Quét mã QR bằng ứng dụng ngân hàng để thanh toán.</p>

        <div className="bg-white p-4 rounded-xl mb-6 flex justify-center">
          <img src={qrUrl} alt="VietQR Code" className="max-w-[250px] w-full object-contain" />
        </div>

        <div className="space-y-3 mb-8 bg-gray-800 p-4 rounded-lg">
          <div className="flex justify-between">
            <span className="text-gray-400">Số tiền:</span>
            <span className="text-primary font-bold">{amount.toLocaleString("vi-VN")} VNĐ</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Nội dung CK:</span>
            <span className="font-mono font-bold text-white bg-gray-700 px-2 py-0.5 rounded">{content}</span>
          </div>
          <div className="text-xs text-yellow-400 mt-2 text-center">
            ⚠️ Bắt buộc nhập chính xác nội dung chuyển khoản để hệ thống tự động xác nhận.
          </div>
        </div>

        <button
          onClick={handleManualCheck}
          disabled={statusLoading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 font-medium transition rounded-full bg-primary hover:bg-primary-dull active:scale-95 disabled:opacity-70"
        >
          {statusLoading ? (
            <RefreshCcw className="w-5 h-5 animate-spin" />
          ) : (
            <RefreshCcw className="w-5 h-5" />
          )}
          {statusLoading ? "Đang kiểm tra..." : "Kiểm tra trạng thái thanh toán"}
        </button>
        
        <p className="text-xs text-center text-gray-500 mt-4">
          Hệ thống sẽ tự động cập nhật sau mỗi 10 giây nếu nhận được tiền.
        </p>
      </div>
    </div>
  );
};

export default PaymentQR;
