import React, { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import Title from "../../components/admin/Title";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { CheckCircle2Icon, XCircleIcon, AlertTriangleIcon } from "lucide-react";
import { dateFormat } from "../../lib/dateFormat";

const ScanTicket = () => {
  const { axios, getToken } = useAppContext();
  const [scannedCode, setScannedCode] = useState(null);
  const [bookingInfo, setBookingInfo] = useState(null);
  const [scanStatus, setScanStatus] = useState(null); // VALID, USED, CANCELLED, UNPAID, NOT_FOUND
  const [isProcessing, setIsProcessing] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    // Start scanner only if no code is currently being processed
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
          handleScan(decodedText);
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

  const handleScan = async (code) => {
    setIsProcessing(true);
    try {
      const token = await getToken();
      const { data } = await axios.post(
        "/api/admin/scan-ticket",
        { code },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.status === "NOT_FOUND") {
        toast.error("❌ " + data.message, { duration: 4000 });
        resetScanner();
      } else {
        setBookingInfo(data.booking);
        setScanStatus(data.status);
        if (data.status === "VALID") {
          toast.success("✅ " + data.message, { duration: 4000 });
        } else {
          toast.error("❌ " + data.message, { duration: 4000 });
        }
      }
    } catch (error) {
      toast.error("❌ Lỗi mạng hoặc server không phản hồi");
      resetScanner();
    }
    setIsProcessing(false);
  };

  const resetScanner = () => {
    setScannedCode(null);
    setBookingInfo(null);
    setScanStatus(null);
  };

  const renderStatusAlert = () => {
    switch (scanStatus) {
      case "VALID":
        return (
          <div className="flex flex-col items-center justify-center p-6 bg-green-500/10 border border-green-500/50 rounded-2xl mb-6">
            <CheckCircle2Icon className="w-16 h-16 text-green-500 mb-2" />
            <h2 className="text-2xl font-bold text-green-500 uppercase tracking-widest text-center">Vé Hợp Lệ</h2>
            <p className="text-green-400/80 text-sm mt-1">Đã tự động xác nhận vào rạp</p>
          </div>
        );
      case "USED":
        return (
          <div className="flex flex-col items-center justify-center p-6 bg-red-500/10 border border-red-500/50 rounded-2xl mb-6">
            <XCircleIcon className="w-16 h-16 text-red-500 mb-2" />
            <h2 className="text-2xl font-bold text-red-500 uppercase tracking-widest text-center">Đã Sử Dụng</h2>
            <p className="text-red-400/80 text-sm mt-1">Vé này đã được quét trước đó</p>
          </div>
        );
      case "CANCELLED":
        return (
          <div className="flex flex-col items-center justify-center p-6 bg-red-500/10 border border-red-500/50 rounded-2xl mb-6">
            <XCircleIcon className="w-16 h-16 text-red-500 mb-2" />
            <h2 className="text-2xl font-bold text-red-500 uppercase tracking-widest text-center">Vé Đã Bị Hủy</h2>
            <p className="text-red-400/80 text-sm mt-1">Khách hàng đã hủy vé này</p>
          </div>
        );
      case "UNPAID":
        return (
          <div className="flex flex-col items-center justify-center p-6 bg-yellow-500/10 border border-yellow-500/50 rounded-2xl mb-6">
            <AlertTriangleIcon className="w-16 h-16 text-yellow-500 mb-2" />
            <h2 className="text-2xl font-bold text-yellow-500 uppercase tracking-widest text-center">Chưa Thanh Toán</h2>
            <p className="text-yellow-400/80 text-sm mt-1">Vui lòng thu tiền trước khi cho vào rạp</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-full text-left mb-6">
        <Title text1="Quét" text2="Mã Vé" />
      </div>
      
      <div className="w-full max-w-md bg-[#1a1a1a] rounded-3xl overflow-hidden shadow-2xl border border-gray-800 p-4 md:p-6">
        {!scannedCode ? (
          <>
            <p className="text-center text-gray-400 mb-4 text-sm font-medium">
              Đưa mã QR trên vé vào khung hình camera.
            </p>
            <div id="qr-reader" className="w-full overflow-hidden rounded-2xl bg-black border border-gray-800 shadow-inner"></div>
          </>
        ) : (
          <div className="flex flex-col animate-in fade-in zoom-in duration-300">
            {isProcessing && !bookingInfo ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Đang kiểm tra vé...</p>
              </div>
            ) : bookingInfo ? (
              <div className="flex flex-col">
                
                {renderStatusAlert()}

                <div className="bg-[#111] rounded-2xl p-5 border border-gray-800/60 shadow-inner">
                  <div className="text-center border-b border-gray-800/80 pb-4 mb-4">
                    <h3 className="text-xl font-bold text-white mb-1 line-clamp-2">{bookingInfo.show?.movie?.title}</h3>
                    <p className="text-sm text-gray-400">{dateFormat(bookingInfo.show?.showDateTime)}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-5 gap-x-4 text-sm">
                    <div>
                      <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1">Mã đặt vé</p>
                      <p className="font-mono text-primary font-bold text-base">{bookingInfo.bookingCode || bookingInfo._id.slice(-6).toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1">Ghế ngồi</p>
                      <p className="font-bold text-lg text-white">{bookingInfo.bookedSeats?.join(", ")}</p>
                    </div>
                    <div className="col-span-2 border-t border-gray-800/50 pt-4">
                      <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1">Khách hàng</p>
                      <p className="font-semibold text-gray-300">{bookingInfo.customerName || bookingInfo.user?.name}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button 
                    onClick={resetScanner}
                    className="w-full py-4 bg-primary hover:bg-primary-dull active:scale-95 text-white font-bold rounded-2xl transition-all shadow-lg shadow-primary/20 uppercase tracking-widest"
                  >
                    Quét Vé Tiếp Theo
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
