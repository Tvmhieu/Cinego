import React, { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import Title from "../../components/admin/Title";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const ScanTicket = () => {
  const { axios, getToken } = useAppContext();
  const [scanResult, setScanResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Only initialize if not already scanning
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(onScanSuccess, onScanFailure);

    function onScanSuccess(decodedText) {
      // Pause scanner while processing to avoid multiple calls
      if (isProcessing) return;
      
      setScanResult(decodedText);
      handleCheckIn(decodedText);
    }

    function onScanFailure(error) {
      // Ignore scan failures (happens continuously until a QR is found)
    }

    return () => {
      // Cleanup
      try {
        scanner.clear();
      } catch (error) {
        console.error("Failed to clear scanner", error);
      }
    };
  }, [isProcessing]);

  const handleCheckIn = async (bookingId) => {
    setIsProcessing(true);
    try {
      const token = await getToken();
      const { data } = await axios.post(
        "/api/admin/check-in",
        { bookingId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        if (data.isCheckedIn) {
          toast.success("✅ Soát vé thành công cho mã: " + bookingId, { duration: 4000 });
        } else {
          toast.success("Đã HỦY soát vé cho mã: " + bookingId, { duration: 4000 });
        }
      } else {
        toast.error("❌ " + data.message, { duration: 4000 });
      }
    } catch (error) {
      toast.error("❌ Lỗi mạng hoặc server không phản hồi");
    }
    
    // Allow scanning again after 3 seconds
    setTimeout(() => {
      setScanResult(null);
      setIsProcessing(false);
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-full text-left mb-6">
        <Title text1="Quét" text2="Mã Vé" />
      </div>
      
      <div className="w-full max-w-md bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-800 p-6">
        <p className="text-center text-gray-400 mb-4 text-sm">
          Đưa mã QR trên vé của khách hàng vào khung hình camera để soát vé tự động.
        </p>
        
        <div id="qr-reader" className="w-full overflow-hidden rounded-lg bg-black"></div>
        
        {scanResult && (
          <div className="mt-6 p-4 bg-primary/20 border border-primary/50 rounded-lg text-center">
            <p className="text-sm text-gray-300 mb-1">Mã vừa quét:</p>
            <p className="text-xl font-mono font-bold text-primary">{scanResult}</p>
            <p className="text-xs text-gray-400 mt-2">Vui lòng chờ vài giây để quét vé tiếp theo...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanTicket;
