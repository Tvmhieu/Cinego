import { useState, useMemo, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon, ClockIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";

const AdminCalendar = ({ shows }) => {
  const navigate = useNavigate();
  const { axios } = useAppContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayShows, setSelectedDayShows] = useState(null); // { dateStr, shows: [] }
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState("");

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const { data } = await axios.get("/api/room/all");
        if (data.success) {
          setRooms(data.rooms);
        }
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    };
    fetchRooms();
  }, [axios]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  const monthNames = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
  ];
  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDayShows(null);
  };
  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDayShows(null);
  };
  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDayShows(null);
  };

  const filteredShows = useMemo(() => {
    if (!selectedRoomId) return shows;
    return shows.filter(show => show.room && show.room._id === selectedRoomId);
  }, [shows, selectedRoomId]);

  const showsByDate = useMemo(() => {
    const map = {};
    filteredShows.forEach(show => {
      const d = new Date(show.showDateTime);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(show);
    });
    Object.keys(map).forEach(key => {
      map[key].sort((a, b) => new Date(a.showDateTime) - new Date(b.showDateTime));
    });
    return map;
  }, [filteredShows]);

  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  while (calendarDays.length % 7 !== 0) {
    calendarDays.push(null);
  }

  const todayStr = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  const currency = import.meta.env.VITE_CURRENCY || "VND";

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      {/* Calendar Section */}
      <div className="w-full bg-[#161616] rounded-xl border border-gray-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-gray-800 bg-[#161616] gap-4">
          <h2 className="text-xl font-medium text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-gray-400" />
            {monthNames[month]} {year}
          </h2>
          <div className="flex items-center gap-3">
            <select
              value={selectedRoomId}
              onChange={(e) => {
                setSelectedRoomId(e.target.value);
                setSelectedDayShows(null);
              }}
              className="bg-[#111] border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary transition-colors cursor-pointer"
            >
              <option value="" className="bg-[#111] text-gray-300">Tất cả phòng</option>
              {rooms.map(room => (
                <option key={room._id} value={room._id} className="bg-[#111] text-gray-300">
                  {room.name}
                </option>
              ))}
            </select>
            <button 
              onClick={handleToday}
              className="px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-white bg-transparent border border-gray-700 hover:border-gray-500 rounded-lg transition-colors"
            >
              Hôm nay
            </button>
            <div className="flex gap-1">
              <button 
                onClick={handlePrevMonth}
                className="p-1.5 text-gray-400 hover:text-white bg-transparent border border-gray-700 hover:border-gray-500 rounded-lg transition-colors"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <button 
                onClick={handleNextMonth}
                className="p-1.5 text-gray-400 hover:text-white bg-transparent border border-gray-700 hover:border-gray-500 rounded-lg transition-colors"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-gray-800 bg-[#111]">
          {dayNames.map((day, idx) => (
            <div key={idx} className="py-3 text-center text-xs font-medium text-gray-400 border-r border-gray-800 last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 auto-rows-[minmax(120px,auto)]">
          {calendarDays.map((day, idx) => {
            if (!day) {
              return <div key={`empty-${idx}`} className="bg-[#111] border-r border-b border-gray-800" />;
            }

            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = dateKey === todayStr;
            const dayShows = showsByDate[dateKey] || [];
            const hasShows = dayShows.length > 0;
            const isSelected = selectedDayShows?.dateKey === dateKey;

            return (
              <div 
                key={dateKey} 
                onClick={() => hasShows && setSelectedDayShows({ dateKey, dateStr: `${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`, shows: dayShows })}
                className={`relative p-3 border-r border-b border-gray-800 flex flex-col gap-2 transition-all duration-300 ${
                  isSelected 
                    ? 'bg-gray-800/80 scale-105 z-10 shadow-2xl border-primary ring-1 ring-primary/50' 
                    : hasShows 
                      ? 'hover:bg-gray-800 cursor-pointer bg-[#161616]' 
                      : 'bg-[#111]'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-sm w-7 h-7 flex items-center justify-center rounded-full ${
                    isToday 
                      ? 'bg-primary text-white font-medium' 
                      : isSelected 
                        ? 'bg-white text-black font-medium' 
                        : 'text-gray-400'
                  }`}>
                    {day}
                  </span>
                  {hasShows && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-900 text-primary border border-gray-700/50">
                      {dayShows.length} suất
                    </span>
                  )}
                </div>
                
                <div className="flex flex-col gap-1.5 overflow-hidden mt-1">
                  {dayShows.slice(0, 3).map(show => {
                    const d = new Date(show.showDateTime);
                    const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
                    return (
                      <div key={show._id} className="text-[11px] leading-tight text-gray-400 truncate flex flex-col gap-0.5">
                        <div className="flex gap-1.5 items-center">
                          <span className="text-gray-300 font-medium">{timeStr}</span>
                          {!selectedRoomId && show.room && <span className="text-primary text-[10px] border border-primary/30 px-1 rounded-sm bg-primary/10">[{show.room.name}]</span>}
                        </div>
                        <span className="truncate text-gray-400">{show.movie?.title}</span>
                      </div>
                    );
                  })}
                  {dayShows.length > 3 && (
                    <div className="text-[10px] text-gray-500 mt-1 pl-1">
                      + {dayShows.length - 3} suất khác
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Schedule (Simple List) */}
      {selectedDayShows && (
        <div className="w-full bg-[#161616] rounded-xl border border-primary/50 shadow-[0_0_20px_rgba(229,9,20,0.1)] p-8 animate-in fade-in slide-in-from-bottom-2 duration-500 relative z-20">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-800">
            <div>
              <h3 className="text-xl font-medium text-white flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-primary" />
                Lịch chiếu ngày {selectedDayShows.dateStr}
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                Có tổng cộng {selectedDayShows.shows.length} suất chiếu
              </p>
            </div>
            <button 
              onClick={() => setSelectedDayShows(null)}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Đóng lại
            </button>
          </div>

          <div className="grid gap-0 border-t border-l border-r border-gray-800 rounded-xl overflow-hidden shadow-lg">
            {selectedDayShows.shows.map((show, index) => {
              const d = new Date(show.showDateTime);
              const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
              return (
                <div 
                  key={show._id}
                  onClick={() => navigate(`/admin/list-bookings?showId=${show._id}`)}
                  className={`flex flex-col sm:flex-row sm:items-center gap-6 p-5 bg-[#111] border-b border-gray-800 hover:bg-gray-800/80 transition-colors cursor-pointer group`}
                >
                  <div className="w-16 text-lg font-medium text-white">
                    {timeStr}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-200 text-base group-hover:text-primary transition-colors">{show.movie?.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{show.room?.name || "Chưa xếp phòng"}</p>
                  </div>
                  <div className="flex items-center gap-8 text-sm">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase text-gray-500">Giá vé</span>
                      <span className="text-gray-300">{(show.showPrice || 0).toLocaleString("vi-VN")} {currency}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase text-gray-500">Đã bán</span>
                      <span className="text-gray-300">{show.paidTickets || 0} vé</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCalendar;
