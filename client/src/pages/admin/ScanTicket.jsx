import React, { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import Title from "../../components/admin/Title";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { CheckCircle2Icon, XCircleIcon, AlertTriangleIcon, ClockIcon } from "lucide-react";
import { dateFormat } from "../../lib/dateFormat";

const ScanTicket = () => {
  const { axios, getToken } = useAppContext();
  const [scannedCode, setScannedCode] = useState(null);
  const [bookingInfo, setBookingInfo] = useState(null);
  const [scanStatus, setScanStatus] = useState(null); // VALID, USED, CANCELLED, UNPAID, NOT_FOUND, TOO_EARLY
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState("");
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    Html5Qrcode.getCameras().then(devices => {
      if (devices && devices.length) {
        setCameras(devices);
        
        let backCamera = devices.find(c => c.label.toLowerCase().includes('back') || c.label.toLowerCase().includes('environment'));
        if (backCamera) {
          setSelectedCameraId(backCamera.id);
        } else {
          setSelectedCameraId(devices[0].id);
        }
      }
    }).catch(err => {
      console.error("Lỗi lấy danh sách camera:", err);
    });
  }, []);

  const startScanner = async (cameraId) => {
    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode("qr-reader");
      }
      
      if (html5QrCodeRef.current.isScanning) {
        await html5QrCodeRef.current.stop();
      }

      await html5QrCodeRef.current.start(
        cameraId,
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          if (html5QrCodeRef.current.isScanning) {
            html5QrCodeRef.current.stop().then(() => {
              setScannedCode(decodedText);
              handleScan(decodedText);
            }).catch(console.error);
          }
        },
        (errorMessage) => {
          // Handle scan error quietly
        }
      );
    } catch (error) {
      console.error("Lỗi bật camera:", error);
    }
  };

  useEffect(() => {
    if (!scannedCode && selectedCameraId) {
      startScanner(selectedCameraId);
    }

    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(console.error);
      }
    };
  }, [scannedCode, selectedCameraId]);

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
        setScanStatus("NOT_FOUND");
      } else {
        setBookingInfo(data.booking);
        setScanStatus(data.status);
        if (data.status === "VALID") {
          toast.success("✅ " + data.message, { duration: 4000 });
        } else if (data.status === "TOO_EARLY") {
          toast.error("⏳ " + data.message, { duration: 4000 });
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
  
  const handleCheckIn = async () => {
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
        toast.success(data.message);
        setScanStatus("USED"); // Change to USED so they can't click again immediately
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Lỗi khi cập nhật trạng thái soát vé");
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
          <div className="flex flex-col items-center justify-center p-6 bg-green-500/10 border border-green-500/50 rounded-2xl mb-6 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
            <CheckCircle2Icon className="w-16 h-16 text-green-500 mb-2" />
            <h2 className="text-2xl font-bold text-green-500 uppercase tracking-widest text-center">Vé Hợp Lệ</h2>
            <p className="text-green-400/80 text-sm mt-1 text-center">Vé sẵn sàng để duyệt vào rạp</p>
          </div>
        );
      case "TOO_EARLY":
        return (
          <div className="flex flex-col items-center justify-center p-6 bg-blue-500/10 border border-blue-500/50 rounded-2xl mb-6 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
            <ClockIcon className="w-16 h-16 text-blue-500 mb-2" />
            <h2 className="text-2xl font-bold text-blue-500 uppercase tracking-widest text-center">Chưa Đến Giờ</h2>
            <p className="text-blue-400/80 text-sm mt-1 text-center">Chỉ được duyệt trước giờ chiếu 15 phút</p>
          </div>
        );
      case "USED":
        return (
          <div className="flex flex-col items-center justify-center p-6 bg-red-500/10 border border-red-500/50 rounded-2xl mb-6 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
            <XCircleIcon className="w-16 h-16 text-red-500 mb-2" />
            <h2 className="text-2xl font-bold text-red-500 uppercase tracking-widest text-center">Đã Sử Dụng</h2>
            <p className="text-red-400/80 text-sm mt-1 text-center">Vé này đã được duyệt vào rạp trước đó</p>
          </div>
        );
      case "CANCELLED":
        return (
          <div className="flex flex-col items-center justify-center p-6 bg-red-500/10 border border-red-500/50 rounded-2xl mb-6">
            <XCircleIcon className="w-16 h-16 text-red-500 mb-2" />
            <h2 className="text-2xl font-bold text-red-500 uppercase tracking-widest text-center">Vé Đã Bị Hủy</h2>
            <p className="text-red-400/80 text-sm mt-1 text-center">Khách hàng đã hủy vé này</p>
          </div>
        );
      case "UNPAID":
        return (
          <div className="flex flex-col items-center justify-center p-6 bg-yellow-500/10 border border-yellow-500/50 rounded-2xl mb-6">
            <AlertTriangleIcon className="w-16 h-16 text-yellow-500 mb-2" />
            <h2 className="text-2xl font-bold text-yellow-500 uppercase tracking-widest text-center">Chưa Thanh Toán</h2>
            <p className="text-yellow-400/80 text-sm mt-1 text-center">Vui lòng thu tiền trước khi cho vào rạp</p>
          </div>
        );
      case "NOT_FOUND":
        return (
          <div className="flex flex-col items-center justify-center p-6 bg-red-500/10 border border-red-500/50 rounded-2xl mb-6">
            <XCircleIcon className="w-16 h-16 text-red-500 mb-2" />
            <h2 className="text-2xl font-bold text-red-500 uppercase tracking-widest text-center">Không Tồn Tại</h2>
            <p className="text-red-400/80 text-sm mt-1 text-center">Mã QR này không thuộc hệ thống CineGo</p>
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
            <div className="flex flex-col gap-3 mb-4">
              <p className="text-center text-gray-400 text-sm font-medium">
                Đưa mã QR vào khung hình
              </p>
              
              {cameras.length > 0 && (
                <div className="relative w-full max-w-xs mx-auto">
                  <select 
                    value={selectedCameraId}
                    onChange={(e) => setSelectedCameraId(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-xl focus:ring-primary focus:border-primary block p-2.5 appearance-none shadow-sm cursor-pointer"
                  >
                    {cameras.map((cam, idx) => (
                      <option key={cam.id} value={cam.id}>
                        {cam.label || `Camera ${idx + 1}`}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              )}
            </div>
            <div id="qr-reader" className="w-full overflow-hidden rounded-2xl bg-black border border-gray-800 shadow-inner"></div>
          </>
        ) : (
          <div className="flex flex-col animate-in fade-in zoom-in duration-300">
            {isProcessing && !scanStatus ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Đang xử lý...</p>
              </div>
            ) : scanStatus ? (
              <div className="flex flex-col">
                
                {renderStatusAlert()}

                {bookingInfo && (
                  <div className="bg-[#111] rounded-2xl p-5 border border-gray-800/60 shadow-inner">
                    <div className="text-center border-b border-gray-800/80 pb-4 mb-4">
                      <h3 className="text-lg font-bold text-white mb-2 line-clamp-3 leading-snug">{bookingInfo.show?.movie?.title}</h3>
                      <p className="text-sm text-gray-400">{dateFormat(bookingInfo.show?.showDateTime)}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-y-5 gap-x-4 text-sm">
                      <div>
                        <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1">Mã đặt vé</p>
                        <p className="font-mono text-primary font-medium text-base">{bookingInfo.bookingCode || bookingInfo._id.slice(-6).toUpperCase()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1">Ghế ngồi</p>
                        <p className="font-bold text-lg text-white">{bookingInfo.bookedSeats?.join(", ")}</p>
                      </div>
                      <div className="col-span-2 border-t border-gray-800/50 pt-4">
                        <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1">Khách hàng</p>
                        <p className="font-medium text-gray-300">{bookingInfo.customerName || bookingInfo.user?.name}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6 flex flex-col gap-3">
                  {scanStatus === "VALID" && (
                    <button 
                      onClick={handleCheckIn}
                      disabled={isProcessing}
                      className="w-full py-4 bg-green-600 hover:bg-green-700 active:scale-95 text-white font-medium rounded-2xl transition-all shadow-lg shadow-green-600/20 uppercase tracking-widest flex items-center justify-center disabled:opacity-50"
                    >
                      {isProcessing ? "Đang xử lý..." : "Duyệt Vào Rạp"}
                    </button>
                  )}
                  <button 
                    onClick={resetScanner}
                    disabled={isProcessing}
                    className={`w-full py-4 active:scale-95 font-medium rounded-2xl transition-all uppercase tracking-widest ${scanStatus === "VALID" ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-primary hover:bg-primary-dull text-white shadow-lg shadow-primary/20"}`}
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
