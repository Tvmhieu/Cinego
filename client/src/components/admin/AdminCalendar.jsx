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
      <div className="w-full bg-[#0a0a0a] rounded-lg border border-[#2a2a2a] overflow-hidden flex flex-col font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-[#2a2a2a] bg-[#0a0a0a] gap-4">
          <h2 className="text-xl font-medium text-[#f1f1f1] tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[#888]" />
            {monthNames[month]} {year}
          </h2>
          <div className="flex items-center gap-3">
            <select
              value={selectedRoomId}
              onChange={(e) => {
                setSelectedRoomId(e.target.value);
                setSelectedDayShows(null);
              }}
              className="bg-[#111] border border-[#333] text-[#ccc] text-xs font-mono rounded px-3 py-1.5 focus:outline-none focus:border-[#555] transition-colors cursor-pointer appearance-none"
            >
              <option value="" className="bg-[#111] text-[#ccc]">TẤT CẢ PHÒNG</option>
              {rooms.map(room => (
                <option key={room._id} value={room._id} className="bg-[#111] text-[#ccc]">
                  {room.name.toUpperCase()}
                </option>
              ))}
            </select>
            <button 
              onClick={handleToday}
              className="px-3 py-1.5 text-xs font-mono text-[#888] hover:text-[#eee] bg-transparent border border-[#333] hover:border-[#555] rounded transition-colors"
            >
              HÔM NAY
            </button>
            <div className="flex gap-1">
              <button 
                onClick={handlePrevMonth}
                className="p-1.5 text-[#888] hover:text-[#eee] bg-transparent border border-[#333] hover:border-[#555] rounded transition-colors"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <button 
                onClick={handleNextMonth}
                className="p-1.5 text-[#888] hover:text-[#eee] bg-transparent border border-[#333] hover:border-[#555] rounded transition-colors"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-[#2a2a2a] bg-[#0a0a0a]">
          {dayNames.map((day, idx) => (
            <div key={idx} className="py-2.5 text-center text-[10px] uppercase font-mono tracking-widest text-[#666] border-r border-[#2a2a2a] last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 auto-rows-[minmax(120px,auto)]">
          {calendarDays.map((day, idx) => {
            if (!day) {
              return <div key={`empty-${idx}`} className="bg-[#050505] border-r border-b border-[#2a2a2a]" />;
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
                className={`p-3 border-r border-b border-[#2a2a2a] flex flex-col gap-2 transition-all duration-200 ${
                  isSelected ? 'bg-[#1a1a1a] shadow-inner' : hasShows ? 'hover:bg-[#111] cursor-pointer bg-[#0a0a0a]' : 'bg-[#050505]'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-sm font-mono flex items-center justify-center ${
                    isToday ? 'text-white border-b border-white pb-0.5' : isSelected ? 'text-white' : 'text-[#666]'
                  }`}>
                    {String(day).padStart(2, '0')}
                  </span>
                  {hasShows && (
                    <span className="text-[9px] font-mono tracking-wider text-[#888]">
                      {dayShows.length} SUẤT
                    </span>
                  )}
                </div>
                
                <div className="flex flex-col gap-1.5 overflow-hidden mt-1">
                  {dayShows.slice(0, 3).map(show => {
                    const d = new Date(show.showDateTime);
                    const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
                    return (
                      <div key={show._id} className="text-[11px] leading-tight text-[#999] truncate flex flex-col gap-0.5">
                        <div className="flex gap-1.5 items-center">
                          <span className="font-mono text-[#ccc]">{timeStr}</span>
                          {!selectedRoomId && show.room && <span className="text-[#666] font-mono text-[9px] border border-[#333] px-1 rounded-sm">[{show.room.name}]</span>}
                        </div>
                        <span className="truncate">{show.movie?.title}</span>
                      </div>
                    );
                  })}
                  {dayShows.length > 3 && (
                    <div className="text-[9px] font-mono text-[#666] mt-1">
                      + {dayShows.length - 3} SUẤT KHÁC
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
        <div className="w-full bg-[#0a0a0a] rounded-lg border border-[#2a2a2a] p-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#2a2a2a]">
            <div>
              <h3 className="text-lg font-medium text-[#f1f1f1] flex items-center gap-2">
                <ClockIcon className="w-4 h-4 text-[#888]" />
                LỊCH CHIẾU - {selectedDayShows.dateStr}
              </h3>
              <p className="text-xs font-mono text-[#666] mt-2 tracking-widest uppercase">
                Tổng cộng: {selectedDayShows.shows.length} suất
              </p>
            </div>
            <button 
              onClick={() => setSelectedDayShows(null)}
              className="text-xs font-mono text-[#888] hover:text-[#eee] transition-colors uppercase tracking-wider"
            >
              [ Đóng ]
            </button>
          </div>

          <div className="grid gap-0 border-t border-l border-r border-[#2a2a2a] rounded overflow-hidden">
            {selectedDayShows.shows.map((show, index) => {
              const d = new Date(show.showDateTime);
              const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
              return (
                <div 
                  key={show._id}
                  onClick={() => navigate(`/admin/list-bookings?showId=${show._id}`)}
                  className={`flex flex-col sm:flex-row sm:items-center gap-6 p-5 bg-[#0a0a0a] border-b border-[#2a2a2a] hover:bg-[#111] transition-colors cursor-pointer group`}
                >
                  <div className="w-16 font-mono text-xl text-[#eee]">
                    {timeStr}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-[#eee] text-base group-hover:text-white transition-colors">{show.movie?.title}</h4>
                    <p className="text-xs font-mono text-[#888] mt-1.5 uppercase tracking-wider">{show.room?.name || "Chưa xếp phòng"}</p>
                  </div>
                  <div className="flex items-center gap-8 text-sm font-mono">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] uppercase text-[#666] tracking-widest">Giá vé</span>
                      <span className="text-[#ccc]">{(show.showPrice || 0).toLocaleString("vi-VN")} {currency}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] uppercase text-[#666] tracking-widest">Đã bán</span>
                      <span className="text-[#ccc]">{show.paidTickets || 0}</span>
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
