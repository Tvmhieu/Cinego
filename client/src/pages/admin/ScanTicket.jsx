import React, { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import Title from "../../components/admin/Title";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const ScanTicket = () => {
  const { axios, getToken } = useAppContext();
  const [scannedCode, setScannedCode] = useState(null);
  const [bookingInfo, setBookingInfo] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    // We only want to start the scanner if there's no scanned code currently active
    if (!scannedCode && !scannerRef.current) {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );
      
      scannerRef.current = scanner;

      scanner.render(
        (decodedText) => {
          // Pause scanner
          scanner.pause(true);
          setScannedCode(decodedText);
          fetchBookingInfo(decodedText);
        },
        (err) => {}
      );
    }

    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
          scannerRef.current = null;
        } catch (error) {
          console.error("Failed to clear scanner", error);
        }
      }
    };
  }, [scannedCode]);

  const fetchBookingInfo = async (code) => {
    setIsProcessing(true);
    try {
      const token = await getToken();
      const { data } = await axios.get(`/api/admin/booking/${code}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        setBookingInfo(data.booking);
      } else {
        toast.error("❌ " + data.message, { duration: 4000 });
        resetScanner();
      }
    } catch (error) {
      toast.error("❌ Lỗi mạng hoặc server không phản hồi");
      resetScanner();
    }
    setIsProcessing(false);
  };

  const handleConfirmCheckIn = async () => {
    if (!bookingInfo) return;
    
    setIsProcessing(true);
    try {
      const token = await getToken();
      const { data } = await axios.post(
        "/api/admin/check-in",
        { bookingId: bookingInfo._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success("✅ Đã xác nhận vào rạp thành công!");
        setBookingInfo(prev => ({ ...prev, isCheckedIn: true }));
      } else {
        toast.error("❌ " + data.message);
      }
    } catch (error) {
      toast.error("❌ Lỗi khi xác nhận");
    }
    setIsProcessing(false);
  };

  const resetScanner = () => {
    setScannedCode(null);
    setBookingInfo(null);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-full text-left mb-6">
        <Title text1="Quét" text2="Mã Vé" />
      </div>
      
      <div className="w-full max-w-md bg-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl border border-gray-800 p-6">
        {!scannedCode ? (
          <>
            <p className="text-center text-gray-400 mb-4 text-sm font-medium">
              Đưa mã QR trên vé vào khung hình camera.
            </p>
            <div id="qr-reader" className="w-full overflow-hidden rounded-xl bg-black border border-gray-800"></div>
          </>
        ) : (
          <div className="flex flex-col animate-in fade-in zoom-in duration-300">
            {isProcessing && !bookingInfo ? (
              <div className="text-center py-10 text-gray-400">Đang truy xuất thông tin vé...</div>
            ) : bookingInfo ? (
              <div className="flex flex-col gap-4">
                <div className="text-center border-b border-gray-800 pb-4">
                  <h3 className="text-xl font-bold text-white mb-1">{bookingInfo.show?.movie?.title}</h3>
                  <p className="font-mono text-primary font-bold text-lg">{bookingInfo.bookingCode || bookingInfo._id.slice(-6).toUpperCase()}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs uppercase mb-1">Khách hàng</p>
                    <p className="font-semibold">{bookingInfo.customerName || bookingInfo.user?.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase mb-1">Ghế ngồi</p>
                    <p className="font-bold text-lg text-white">{bookingInfo.bookedSeats?.join(", ")}</p>
                  </div>
                </div>

                <div className="mt-4 p-4 rounded-xl text-center font-bold text-lg shadow-inner bg-gray-950/50">
                  {bookingInfo.isCancelled ? (
                    <div className="text-red-500">❌ VÉ NÀY ĐÃ BỊ HỦY</div>
                  ) : !bookingInfo.isPaid ? (
                    <div className="text-yellow-500">⚠️ VÉ CHƯA THANH TOÁN</div>
                  ) : bookingInfo.isCheckedIn ? (
                    <div className="text-red-500">❌ VÉ ĐÃ ĐƯỢC SỬ DỤNG</div>
                  ) : (
                    <div className="text-green-500">✅ VÉ HỢP LỆ (CHƯA VÀO RẠP)</div>
                  )}
                </div>

                <div className="mt-6 flex flex-col gap-3">
                  {bookingInfo.isPaid && !bookingInfo.isCancelled && !bookingInfo.isCheckedIn && (
                    <button 
                      onClick={handleConfirmCheckIn}
                      disabled={isProcessing}
                      className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-xl transition shadow-lg shadow-blue-900/50 disabled:opacity-50 disabled:active:scale-100"
                    >
                      {isProcessing ? "Đang xử lý..." : "XÁC NHẬN VÀO RẠP"}
                    </button>
                  )}
                  <button 
                    onClick={resetScanner}
                    className="w-full py-3 bg-gray-800 hover:bg-gray-700 active:scale-95 text-white font-bold rounded-xl transition"
                  >
                    Quét vé khác
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanTicket;
