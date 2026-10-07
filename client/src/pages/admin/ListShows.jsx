import { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import Title from "../../components/admin/Title";
import { dateFormat } from "../../lib/dateFormat";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FilmIcon, CalendarClockIcon, UsersIcon, CircleDollarSignIcon, Trash2Icon, EyeIcon, SearchIcon, ListIcon, CalendarIcon } from "lucide-react";
import AdminCalendar from "../../components/admin/AdminCalendar";

const ListShows = () => {
  const { axios, getToken, user } = useAppContext();
  const navigate = useNavigate();
  const currency = import.meta.env.VITE_CURRENCY;

  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: 'showDateTime', direction: 'desc' });
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar'

  const getAllShows = async () => {
    try {
      const { data } = await axios.get("/api/admin/all-shows", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      setShows(data.shows);
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancelShow = async (e, showId) => {
    e.stopPropagation();
    if (!window.confirm("Bạn có chắc chắn muốn xóa suất chiếu này?")) return;

    try {
      const { data } = await axios.post(
        "/api/admin/cancel-show",
        { showId },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );

      if (data.success) {
        toast.success(data.message);
        getAllShows(); // Refresh list
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi xóa suất chiếu");
    }
  };

  const getShowStatus = (showDateTime, runtime = 120) => {
    const now = new Date();
    const showDate = new Date(showDateTime);
    const diffMins = (now - showDate) / (1000 * 60);

    if (diffMins < 0) return { text: "Sắp chiếu", color: "text-blue-400 bg-blue-500/10 border-blue-500/20", value: 3 };
    if (diffMins >= 0 && diffMins <= 15) return { text: "Đang mở bán", color: "text-green-400 bg-green-500/10 border-green-500/20", value: 2 };
    if (diffMins > 15 && diffMins < runtime) return { text: "Đang chiếu", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20", value: 1 };
    return { text: "Đã chiếu", color: "text-gray-400 bg-gray-500/10 border-gray-500/20", value: 0 };
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
      getAllShows();
    }
  }, [user]);

  const filteredShows = shows.filter((show) => {
    const term = searchTerm.toLowerCase();
    const title = show.movie?.title?.toLowerCase() || "";
    const code = show.showCode?.toLowerCase() || "";
    const date = dateFormat(show.showDateTime).toLowerCase();
    return title.includes(term) || code.includes(term) || date.includes(term);
  }).sort((a, b) => {
    if (sortConfig.key === 'showCode') {
      const valA = a.showCode || "";
      const valB = b.showCode || "";
      return sortConfig.direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    if (sortConfig.key === 'movie.title') {
      const valA = a.movie?.title || "";
      const valB = b.movie?.title || "";
      return sortConfig.direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    if (sortConfig.key === 'showDateTime') {
      const dateA = new Date(a.showDateTime).getTime();
      const dateB = new Date(b.showDateTime).getTime();
      return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
    }
    if (sortConfig.key === 'paidTickets') {
      const valA = a.paidTickets || 0;
      const valB = b.paidTickets || 0;
      return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
    }
    if (sortConfig.key === 'revenue') {
      const valA = a.revenue || 0;
      const valB = b.revenue || 0;
      return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
    }
    if (sortConfig.key === 'status') {
      const statusA = getShowStatus(a.showDateTime, a.movie?.runtime).value;
      const statusB = getShowStatus(b.showDateTime, b.movie?.runtime).value;
      return sortConfig.direction === 'asc' ? statusA - statusB : statusB - statusA;
    }
    if (sortConfig.key === 'showPrice') {
      const valA = a.showPrice || 0;
      const valB = b.showPrice || 0;
      return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
    }
    return 0;
  });

  const renderSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
    }
    return '';
  };

  return !loading ? (
    <div className="flex flex-col animate-in fade-in duration-500">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Title text1="Danh sách" text2="Suất chiếu" />
        
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          {/* Toggle View Mode */}
          <div className="flex bg-[#161616] p-1 border border-gray-800 rounded-lg w-full md:w-auto">
            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-[#2a2a2a] text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
            >
              <ListIcon className="w-4 h-4" /> Danh sách
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'calendar' ? 'bg-[#2a2a2a] text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
            >
              <CalendarIcon className="w-4 h-4" /> Lịch
            </button>
          </div>

          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-800 rounded-xl leading-5 bg-[#161616] text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
              placeholder="Tìm theo tên phim, mã, ngày chiếu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <AdminCalendar shows={filteredShows} />
      ) : (
        <>

      {/* Mobile Card Layout */}
      <div className="md:hidden flex flex-col gap-4 pb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar text-xs">
          <span className="text-gray-500 whitespace-nowrap">Sắp xếp:</span>
          <button onClick={() => handleSort('showDateTime')} className={`whitespace-nowrap ${sortConfig.key === 'showDateTime' ? 'text-primary font-bold' : 'text-gray-400'}`}>Ngày giờ {renderSortIndicator('showDateTime')}</button>
          <button onClick={() => handleSort('showCode')} className={`whitespace-nowrap ${sortConfig.key === 'showCode' ? 'text-primary font-bold' : 'text-gray-400'}`}>Mã {renderSortIndicator('showCode')}</button>
          <button onClick={() => handleSort('paidTickets')} className={`whitespace-nowrap ${sortConfig.key === 'paidTickets' ? 'text-primary font-bold' : 'text-gray-400'}`}>Vé {renderSortIndicator('paidTickets')}</button>
        </div>
        {filteredShows.length === 0 ? (
          <div className="w-full py-12 flex flex-col items-center justify-center bg-[#111] rounded-2xl border border-gray-800">
            <FilmIcon className="w-12 h-12 text-gray-700 mb-2" />
            <p className="text-gray-500">Không tìm thấy suất chiếu nào</p>
          </div>
        ) : (
          filteredShows.map((show) => {
            const status = getShowStatus(show.showDateTime, show.movie?.runtime);
            return (
              <div 
                key={show._id} 
                onClick={() => navigate(`/admin/list-bookings?showId=${show._id}`)}
                className="flex flex-col bg-[#161616] rounded-2xl border border-gray-800 p-4 shadow-md transition active:scale-95 cursor-pointer"
              >
                <div className="flex justify-between items-start mb-3 border-b border-gray-800/60 pb-3">
                  <div className="flex-1 pr-2">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Mã: <span className="font-mono text-gray-300 font-bold">{show.showCode || "N/A"}</span></p>
                    <p className="font-bold text-white text-base leading-tight">{show.movie?.title}</p>
                  </div>
                  <span className={`flex-shrink-0 px-2.5 py-1 text-xs font-medium rounded-full border ${status.color}`}>
                    {status.text}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-4">
                  <div className="col-span-2 flex justify-between items-start">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Thời Gian</p>
                      <p className="text-sm font-medium text-gray-300 flex items-center gap-1.5"><CalendarClockIcon className="w-4 h-4 text-primary" /> {dateFormat(show.showDateTime)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Giá Vé</p>
                      <p className="text-sm font-bold text-white">{(show.showPrice || 0).toLocaleString("vi-VN")} {currency}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Vé Đã Bán</p>
                    <p className="text-base font-bold text-white flex items-center gap-1.5"><UsersIcon className="w-4 h-4 text-gray-400" /> {show.paidTickets || 0}</p>
                  </div>
                  
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Doanh Thu</p>
                    <p className="text-base font-bold text-green-400 flex items-center gap-1.5"><CircleDollarSignIcon className="w-4 h-4 text-green-500" /> {(show.revenue || 0).toLocaleString("vi-VN")} {currency}</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-2 pt-3 border-t border-gray-800/60">
                  <button
                    onClick={() => navigate(`/admin/list-bookings?showId=${show._id}`)}
                    className="flex-1 flex justify-center items-center gap-2 py-2.5 bg-[#222] text-white hover:bg-[#333] rounded-xl text-sm font-bold transition"
                  >
                    <EyeIcon className="w-4 h-4" /> Xem Vé
                  </button>
                  <button
                    onClick={(e) => handleCancelShow(e, show._id)}
                    className="flex-1 flex justify-center items-center gap-2 py-2.5 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white border border-red-600/20 rounded-xl text-sm font-bold transition"
                  >
                    <Trash2Icon className="w-4 h-4" /> Xóa
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden md:block w-full overflow-hidden bg-[#161616] rounded-2xl border border-gray-800 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-900/50 border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider select-none">
                <th className="px-6 py-4 font-medium cursor-pointer hover:text-white transition" onClick={() => handleSort('showCode')}>Mã{renderSortIndicator('showCode')}</th>
                <th className="px-6 py-4 font-medium cursor-pointer hover:text-white transition" onClick={() => handleSort('movie.title')}>Tên phim{renderSortIndicator('movie.title')}</th>
                <th className="px-6 py-4 font-medium cursor-pointer hover:text-white transition" onClick={() => handleSort('showDateTime')}>Giờ chiếu{renderSortIndicator('showDateTime')}</th>
                <th className="px-6 py-4 font-medium cursor-pointer hover:text-white transition" onClick={() => handleSort('showPrice')}>Giá vé{renderSortIndicator('showPrice')}</th>
                <th className="px-6 py-4 font-medium cursor-pointer hover:text-white transition" onClick={() => handleSort('paidTickets')}>Tổng vé bán{renderSortIndicator('paidTickets')}</th>
                <th className="px-6 py-4 font-medium cursor-pointer hover:text-white transition" onClick={() => handleSort('revenue')}>Doanh thu{renderSortIndicator('revenue')}</th>
                <th className="px-6 py-4 font-medium cursor-pointer hover:text-white transition" onClick={() => handleSort('status')}>Trạng thái{renderSortIndicator('status')}</th>
                <th className="px-6 py-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-800/60">
              {filteredShows.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    Không tìm thấy suất chiếu nào
                  </td>
                </tr>
              ) : (
                filteredShows.map((show, index) => {
                  const status = getShowStatus(show.showDateTime, show.movie?.runtime);
                  return (
                    <tr
                      key={index}
                      onClick={() => navigate(`/admin/list-bookings?showId=${show._id}`)}
                      className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold text-gray-400 bg-gray-800/50 px-2 py-1 rounded">
                          {show.showCode || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-white group-hover:text-primary transition-colors max-w-[250px] truncate" title={show.movie?.title}>{show.movie?.title}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-300">{dateFormat(show.showDateTime)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-300">
                          {(show.showPrice || 0).toLocaleString("vi-VN")} {currency}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-gray-800/50 px-3 py-1 rounded font-bold text-gray-300">
                          {show.paidTickets || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-green-400">
                          {(show.revenue || 0).toLocaleString("vi-VN")} {currency}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-bold rounded border ${status.color}`}>
                          {status.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => handleCancelShow(e, show._id)}
                          className="px-4 py-2 text-xs font-bold text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500 hover:text-white transition active:scale-95"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}
    </div>
  ) : (
    <Loading />
  );
};

export default ListShows;
