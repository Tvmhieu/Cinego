import { useState, useMemo } from "react";
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon, ClockIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminCalendar = ({ shows }) => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayShows, setSelectedDayShows] = useState(null); // { dateStr, shows: [] }

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

  const showsByDate = useMemo(() => {
    const map = {};
    shows.forEach(show => {
      const d = new Date(show.showDateTime);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(show);
    });
    Object.keys(map).forEach(key => {
      map[key].sort((a, b) => new Date(a.showDateTime) - new Date(b.showDateTime));
    });
    return map;
  }, [shows]);

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
    <div className="flex flex-col gap-6">
      {/* Calendar Section */}
      <div className="w-full bg-[#111] rounded-xl border border-gray-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800 bg-[#161616]">
          <h2 className="text-xl font-medium text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-gray-400" />
            {monthNames[month]} {year}
          </h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleToday}
              className="px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded transition-colors"
            >
              Hôm nay
            </button>
            <div className="flex gap-1">
              <button 
                onClick={handlePrevMonth}
                className="p-1.5 text-gray-400 hover:text-white bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded transition-colors"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <button 
                onClick={handleNextMonth}
                className="p-1.5 text-gray-400 hover:text-white bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded transition-colors"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-gray-800 bg-[#0a0a0a]">
          {dayNames.map((day, idx) => (
            <div key={idx} className="py-3 text-center text-xs font-medium text-gray-500 border-r border-gray-800 last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 auto-rows-[minmax(100px,auto)]">
          {calendarDays.map((day, idx) => {
            if (!day) {
              return <div key={`empty-${idx}`} className="bg-[#0a0a0a] border-r border-b border-gray-800/50" />;
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
                className={`p-2 border-r border-b border-gray-800/50 flex flex-col gap-1.5 transition-colors ${
                  isSelected ? 'bg-white/5 border-white/20' : hasShows ? 'hover:bg-gray-900 cursor-pointer' : 'bg-[#111]'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-sm w-7 h-7 flex items-center justify-center rounded-full ${
                    isToday ? 'bg-white text-black font-bold' : isSelected ? 'text-white font-bold' : 'text-gray-400'
                  }`}>
                    {day}
                  </span>
                  {hasShows && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
                      {dayShows.length} suất
                    </span>
                  )}
                </div>
                
                <div className="flex flex-col gap-1 overflow-hidden">
                  {dayShows.slice(0, 3).map(show => {
                    const d = new Date(show.showDateTime);
                    const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
                    return (
                      <div key={show._id} className="text-[11px] px-1.5 py-1 rounded bg-[#1a1a1a] text-gray-400 truncate border border-gray-800/50">
                        <span className="text-gray-200">{timeStr}</span> - {show.movie?.title}
                      </div>
                    );
                  })}
                  {dayShows.length > 3 && (
                    <div className="text-[10px] text-gray-500 pl-1">
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
        <div className="w-full bg-[#111] rounded-xl border border-gray-800 p-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
            <div>
              <h3 className="text-xl font-medium text-white flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-gray-400" />
                Lịch chiếu ngày {selectedDayShows.dateStr}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
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

          <div className="grid gap-3">
            {selectedDayShows.shows.map((show) => {
              const d = new Date(show.showDateTime);
              const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
              return (
                <div 
                  key={show._id}
                  onClick={() => navigate(`/admin/list-bookings?showId=${show._id}`)}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg bg-[#161616] border border-gray-800 hover:border-gray-600 hover:bg-[#1a1a1a] transition-colors cursor-pointer"
                >
                  <div className="w-16 font-mono text-lg font-medium text-white">
                    {timeStr}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white text-base">{show.movie?.title}</h4>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-gray-400">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase text-gray-500">Giá vé</span>
                      <span className="text-gray-300">{(show.showPrice || 0).toLocaleString("vi-VN")} {currency}</span>
                    </div>
                    <div className="flex flex-col">
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
