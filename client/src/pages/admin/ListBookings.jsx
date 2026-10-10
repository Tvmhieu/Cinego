import { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import Title from "../../components/admin/Title";
import { dateFormat } from "../../lib/dateFormat";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Trash2Icon, CreditCardIcon, TicketCheckIcon, XCircleIcon, AlertCircleIcon, ArrowLeftIcon, TicketIcon, SearchIcon, ArrowUpIcon, ArrowDownIcon, LayoutGridIcon, TableIcon } from "lucide-react";

const ListBookings = () => {
  const { axios, getToken, user } = useAppContext();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const showIdFilter = searchParams.get("showId");

  const currency = import.meta.env.VITE_CURRENCY;

  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [activeTab, setActiveTab] = useState("upcoming"); // 'upcoming', 'past', 'cancelled'
  const [viewMode, setViewMode] = useState(window.innerWidth >= 768 ? 'table' : 'card');
  const [selectedBookings, setSelectedBookings] = useState([]);

  const getAllBookings = async () => {
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

  const handleCheckIn = async (bookingId) => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        "/api/admin/check-in",
        { bookingId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(data.message);
        getAllBookings(); // Refresh list
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Lỗi khi cập nhật trạng thái soát vé");
    }
  };

  const handleCancelBooking = async (bookingId) => {
    const reason = window.prompt("Nhập lý do hủy vé (Bắt buộc):");
    
    if (reason === null) return; // User clicked Cancel
    
    if (reason.trim() === "") {
      toast.error("Vui lòng nhập lý do hủy vé");
      return;
    }
    
    if (!window.confirm(`Bạn có chắc muốn hủy vé này với lý do: "${reason.trim()}"? Hành động này không thể hoàn tác.`)) return;

    try {
      const token = await getToken();
      const { data } = await axios.post(
        "/api/admin/cancel-booking",
        { bookingId, reason: reason.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(data.message);
        getAllBookings(); // Refresh list
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Lỗi khi hủy vé");
    }
  };

  const handleBulkCancel = async () => {
    if (selectedBookings.length === 0) return;
    if (!window.confirm(`Bạn có chắc muốn hủy ${selectedBookings.length} vé đã chọn? Hành động này không thể hoàn tác.`)) return;

    try {
      const { data } = await axios.post(
        "/api/admin/bulk-cancel-bookings",
        { bookingIds: selectedBookings },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );

      if (data.success) {
        toast.success(data.message);
        setSelectedBookings([]);
        getAllBookings();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi hủy vé hàng loạt");
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  useEffect(() => {
    if (user) {
      getAllBookings();
    }
  }, [user]);

  const filteredBookings = bookings.filter((item) => {
    if (!item || !item.show || !item.show.movie) return false;
    
    // Tab filter
    const showDate = new Date(item.show.showDateTime);
    const now = new Date();
    
    if (activeTab === "upcoming" && (item.isCancelled || showDate <= now)) return false;
    if (activeTab === "past" && (item.isCancelled || showDate > now)) return false;
    if (activeTab === "cancelled" && !item.isCancelled) return false;

    // Show ID filter (from ListShows)
    if (showIdFilter) {
      if (item.show._id !== showIdFilter) return false;
      // Only show valid, paid tickets when viewing a specific show
      if (!item.isPaid || item.isCancelled) return false;
    }
    
    // Search Term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const bookingCode = item.bookingCode?.toLowerCase() || item._id.toLowerCase();
      const movieTitle = item.show.movie.title.toLowerCase();
      const customerName = (item.customerName || item.user?.name || "").toLowerCase();
      const customerPhone = item.customerPhone || "";
      const showCode = item.show.showCode?.toLowerCase() || "";
      
      if (!bookingCode.includes(term) && !movieTitle.includes(term) && !customerName.includes(term) && !customerPhone.includes(term) && !showCode.includes(term)) {
        return false;
      }
    }
    
    return true;
  }).sort((a, b) => {
    if (sortConfig.key === 'bookingCode') {
      const valA = a.bookingCode || a._id;
      const valB = b.bookingCode || b._id;
      return sortConfig.direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    if (sortConfig.key === 'customerName') {
      const valA = a.customerName || a.user?.name || "";
      const valB = b.customerName || b.user?.name || "";
      return sortConfig.direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    if (sortConfig.key === 'movie.title') {
      const valA = a.show?.movie?.title || "";
      const valB = b.show?.movie?.title || "";
      return sortConfig.direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    if (sortConfig.key === 'show.showDateTime') {
      const dateA = new Date(a.show?.showDateTime).getTime();
      const dateB = new Date(b.show?.showDateTime).getTime();
      return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
    }
    if (sortConfig.key === 'amount') {
      const valA = a.amount || 0;
      const valB = b.amount || 0;
      return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
    }
    if (sortConfig.key === 'status') {
      const getStatusValue = (item) => {
        if (item.isCancelled && !item.isPaid) return -2;
        if (item.isCancelled && item.isPaid) return -1;
        if (item.isCheckedIn) return 2;
        if (item.isPaid) return 1;
        return 0; // pending
      };
      const statA = getStatusValue(a);
      const statB = getStatusValue(b);
      return sortConfig.direction === 'asc' ? statA - statB : statB - statA;
    }
    return 0;
  });

  const renderSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
    }
    return '';
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedBookings(filteredBookings.map(b => b._id));
    } else {
      setSelectedBookings([]);
    }
  };

  const handleSelectBooking = (e, bookingId) => {
    e.stopPropagation();
    if (e.target.checked) {
      setSelectedBookings([...selectedBookings, bookingId]);
    } else {
      setSelectedBookings(selectedBookings.filter(id => id !== bookingId));
    }
  };

  const renderStatus = (item) => {
    if (item.isCancelled && !item.isPaid) {
      return (
        <span className="flex items-center gap-1 w-max px-2.5 py-1 text-[10px] sm:text-xs font-medium text-red-400 rounded-full bg-red-500/10 border border-red-500/20">
          <XCircleIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Đã hủy
        </span>
      );
    }
    if (item.isCancelled && item.isPaid) {
      return (
        <span className="flex items-center gap-1 w-max px-2.5 py-1 text-[10px] sm:text-xs font-medium text-purple-400 rounded-full bg-purple-500/10 border border-purple-500/20">
          <AlertCircleIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Hủy (Chờ hoàn tiền)
        </span>
      );
    }
    if (item.isCheckedIn) {
      return (
        <span className="flex items-center gap-1 w-max px-2.5 py-1 text-[10px] sm:text-xs font-medium text-blue-400 rounded-full bg-blue-500/10 border border-blue-500/20">
          <TicketCheckIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Đã vào rạp
        </span>
      );
    }
    if (item.isPaid) {
      return (
        <span className="flex items-center gap-1 w-max px-2.5 py-1 text-[10px] sm:text-xs font-medium text-green-400 rounded-full bg-green-500/10 border border-green-500/20">
          <CreditCardIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Đã thanh toán
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 w-max px-2.5 py-1 text-[10px] sm:text-xs font-medium text-yellow-400 rounded-full bg-yellow-500/10 border border-yellow-500/20">
        <AlertCircleIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Chờ thanh toán
      </span>
    );
  };

  return !isLoading ? (
    <div className="flex flex-col animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <Title text1="Danh sách" text2="Vé đã đặt" />
        
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          {/* Toggle View Mode */}
          <div className="flex bg-[#161616] p-1 border border-gray-800 rounded-lg w-full md:w-auto overflow-x-auto no-scrollbar snap-x">
            <button
              onClick={() => setViewMode('card')}
              className={`flex-none md:flex-auto flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors snap-start ${viewMode === 'card' ? 'bg-[#2a2a2a] text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
            >
              <LayoutGridIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Dạng Thẻ
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex-none md:flex-auto flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors snap-start ${viewMode === 'table' ? 'bg-[#2a2a2a] text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
            >
              <TableIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Bảng
            </button>
          </div>

          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-800 rounded-xl leading-5 bg-[#161616] text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
              placeholder="Tìm mã vé, khách hàng, tên phim, mã suất..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {selectedBookings.length > 0 && (
            <button
              onClick={handleBulkCancel}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition whitespace-nowrap"
            >
              <Trash2Icon className="w-4 h-4" />
              Hủy đã chọn ({selectedBookings.length})
            </button>
          )}

          {showIdFilter && (
            <button 
              onClick={() => navigate('/admin/list-shows')}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800/50 border border-gray-700 rounded-xl hover:bg-gray-700 transition shadow-sm whitespace-nowrap"
            >
              <ArrowLeftIcon className="w-4 h-4" /> DS Suất chiếu
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 mb-6 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2">
          <AlertCircleIcon className="w-5 h-5" />
          {error}
        </div>
      )}

      {!showIdFilter && (
        <div className="flex gap-4 mb-6 border-b border-gray-800 pb-2">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`pb-2 px-1 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "upcoming" ? "border-primary text-primary" : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            Sắp chiếu ({bookings.filter(b => b && b.show && !b.isCancelled && new Date(b.show.showDateTime) > new Date()).length})
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`pb-2 px-1 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "past" ? "border-primary text-primary" : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            Đã chiếu ({bookings.filter(b => b && b.show && !b.isCancelled && new Date(b.show.showDateTime) <= new Date()).length})
          </button>
          <button
            onClick={() => setActiveTab("cancelled")}
            className={`pb-2 px-1 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "cancelled" ? "border-primary text-primary" : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            Đã hủy ({bookings.filter(b => b.isCancelled).length})
          </button>
        </div>
      )}

      {viewMode === 'card' && (
        <div className="flex flex-col gap-4 pb-6">
          <div className="flex items-center justify-between gap-2 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-xs whitespace-nowrap">Sắp xếp:</span>
              <select
                value={sortConfig.key}
                onChange={(e) => setSortConfig({ ...sortConfig, key: e.target.value })}
                className="bg-[#161616] border border-gray-800 text-gray-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary transition-colors"
              >
                <option value="show.showDateTime">Ngày chiếu</option>
                <option value="bookingCode">Mã vé</option>
                <option value="status">Trạng thái</option>
              </select>
            </div>
            <button 
              onClick={() => setSortConfig({ ...sortConfig, direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
              className="flex items-center justify-center gap-1 px-2 py-1.5 bg-[#161616] border border-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors text-xs"
            >
              {sortConfig.direction === 'asc' ? (
                <><ArrowUpIcon className="w-3.5 h-3.5" /> Tăng dần</>
              ) : (
                <><ArrowDownIcon className="w-3.5 h-3.5" /> Giảm dần</>
              )}
            </button>
          </div>
          {filteredBookings.length === 0 ? (
            <div className="w-full py-12 flex flex-col items-center justify-center bg-[#111] rounded-2xl border border-gray-800">
              <TicketIcon className="w-12 h-12 text-gray-700 mb-2" />
              <p className="text-gray-500">Chưa có vé nào được đặt</p>
            </div>
          ) : (
            filteredBookings.map((item) => (
              <div key={item._id} className="flex flex-col bg-[#161616] rounded-xl border border-gray-800 p-3 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-mono font-medium text-primary text-sm">{item.bookingCode || item._id.slice(-6).toUpperCase()}</p>
                  <div className="flex flex-col items-end gap-1">
                    {renderStatus(item)}
                    {item.isCancelled && item.cancellationReason && (
                      <span className="text-[10px] text-gray-500 max-w-[120px] truncate" title={item.cancellationReason}>
                        {item.cancellationReason}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col gap-1.5 mb-3 border-y border-gray-800/60 py-2">
                  <div className="flex justify-between items-start text-xs">
                    <span className="text-gray-500 font-medium">Khách/Mã:</span>
                    <div className="text-right">
                      <span className="text-gray-200 font-medium block">{item.customerName || item.user?.name || "Khách ẩn danh"}</span>
                      <span className="text-gray-500 text-[10px]">KH-{item.user?._id?.slice(-6).toUpperCase() || "GUEST"}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-start text-xs">
                    <span className="text-gray-500 font-medium">Phim:</span>
                    <span className="text-white text-right max-w-[180px] truncate">{item.show.movie?.title}</span>
                  </div>
                  <div className="flex justify-between items-start text-xs">
                    <span className="text-gray-500 font-medium">Lịch chiếu:</span>
                    <span className="text-gray-300 text-right">{dateFormat(item.show?.showDateTime)}</span>
                  </div>
                  <div className="flex justify-between items-start text-xs">
                    <span className="text-gray-500 font-medium">Ghế:</span>
                    <span className="text-gray-200 font-medium text-right">{item.bookedSeats?.join(", ")}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-primary font-medium text-sm">{(item.amount || 0).toLocaleString("vi-VN")} {currency}</span>
                  <div className="flex gap-2">
                    {!item.isCancelled && (
                      <button
                        onClick={() => handleCancelBooking(item._id)}
                        className="px-3 py-1.5 bg-red-600/10 text-red-500 border border-red-600/20 rounded-lg text-xs font-medium transition active:scale-95"
                      >
                        Hủy Vé
                      </button>
                    )}
                    {!item.isPaid && !item.isCancelled && (
                      <button
                        onClick={() => handleConfirmPayment(item._id)}
                        className="px-3 py-1.5 bg-green-600/20 text-green-500 border border-green-600/30 rounded-lg text-xs font-medium transition active:scale-95"
                      >
                        Xác nhận TT
                      </button>
                    )}
                    {item.isPaid && !item.isCancelled && (
                      <button
                        onClick={() => handleCheckIn(item._id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border active:scale-95 ${item.isCheckedIn ? 'bg-gray-800 text-gray-300 border-gray-700' : 'bg-blue-600/20 text-blue-500 border-blue-600/30'}`}
                      >
                        {item.isCheckedIn ? "Hủy Soát Vé" : "Soát Vé"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Table Layout */}
      {viewMode === 'table' && (
      <div className="w-full overflow-hidden bg-[#161616] rounded-2xl border border-gray-800 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-900/50 border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider select-none">
                <th className="px-6 py-4">
                  <input
                    type="checkbox"
                    className="rounded border-gray-700 bg-gray-800 text-primary focus:ring-primary focus:ring-offset-gray-900"
                    onChange={handleSelectAll}
                    checked={filteredBookings.length > 0 && selectedBookings.length === filteredBookings.length}
                  />
                </th>
                <th className="px-6 py-4 font-medium cursor-pointer hover:text-white transition" onClick={() => handleSort('bookingCode')}>Mã vé{renderSortIndicator('bookingCode')}</th>
                <th className="px-6 py-4 font-medium cursor-pointer hover:text-white transition" onClick={() => handleSort('customerName')}>Khách hàng{renderSortIndicator('customerName')}</th>
                <th className="px-6 py-4 font-medium cursor-pointer hover:text-white transition" onClick={() => handleSort('movie.title')}>Phim & Suất chiếu{renderSortIndicator('movie.title')}</th>
                <th className="px-6 py-4 font-medium text-center">Ghế</th>
                <th className="px-6 py-4 font-medium cursor-pointer hover:text-white transition" onClick={() => handleSort('amount')}>Giá{renderSortIndicator('amount')}</th>
                <th className="px-6 py-4 font-medium cursor-pointer hover:text-white transition" onClick={() => handleSort('status')}>Trạng thái{renderSortIndicator('status')}</th>
                <th className="px-6 py-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-800/60">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    Chưa có vé nào được đặt
                  </td>
                </tr>
              ) : (
                filteredBookings.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="rounded border-gray-700 bg-gray-800 text-primary focus:ring-primary focus:ring-offset-gray-900"
                        checked={selectedBookings.includes(item._id)}
                        onChange={(e) => handleSelectBooking(e, item._id)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-medium text-primary bg-primary/10 px-2 py-1 rounded border border-primary/20">
                        {item.bookingCode || item._id.slice(-6).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-200">{item.customerName || item.user?.name || "Khách ẩn danh"}</p>
                      {item.customerPhone && (
                        <p className="text-xs text-gray-500 mt-0.5">{item.customerPhone}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-white mb-0.5">
                        {item.show.movie?.title || "Phim không xác định"} 
                        {item.show.showCode && <span className="ml-2 font-mono text-xs text-gray-500">({item.show.showCode})</span>}
                      </p>
                      <p className="text-xs text-gray-400">{dateFormat(item.show?.showDateTime)}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <p className="font-medium text-gray-200 mb-0.5">{item.bookedSeats?.join(", ") || "N/A"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-primary">
                        {(item.amount || 0).toLocaleString("vi-VN")} {currency}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {renderStatus(item)}
                      {item.isCancelled && item.cancellationReason && (
                        <p className="text-[10px] text-gray-500 mt-1 max-w-[150px] truncate" title={item.cancellationReason}>
                          Lý do: {item.cancellationReason}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {!item.isCancelled && (
                          <button
                            onClick={() => handleCancelBooking(item._id)}
                            className="px-4 py-1.5 text-xs font-medium text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500 hover:text-white transition active:scale-95"
                          >
                            Hủy Vé
                          </button>
                        )}
                        {!item.isPaid && !item.isCancelled && (
                          <button
                            onClick={() => handleConfirmPayment(item._id)}
                            className="px-4 py-1.5 text-xs font-medium text-green-500 bg-green-500/10 border border-green-500/20 rounded-lg hover:bg-green-500 hover:text-white transition active:scale-95"
                          >
                            Xác nhận TT
                          </button>
                        )}
                        {item.isPaid && !item.isCancelled && (
                          <button
                            onClick={() => handleCheckIn(item._id)}
                            className={`px-4 py-1.5 text-xs font-medium rounded-lg border transition active:scale-95 ${item.isCheckedIn ? 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700 hover:text-white' : 'bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500 hover:text-white'}`}
                          >
                            {item.isCheckedIn ? "Hủy Soát Vé" : "Soát Vé"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </div>
  ) : (
    <Loading />
  );
};

export default ListBookings;
