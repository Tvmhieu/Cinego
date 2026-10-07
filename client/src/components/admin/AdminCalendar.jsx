import { useState, useMemo } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminCalendar = ({ shows }) => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  const monthNames = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
  ];
  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleToday = () => setCurrentDate(new Date());

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

  // Fill the rest of the week
  while (calendarDays.length % 7 !== 0) {
    calendarDays.push(null);
  }

  const todayStr = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  return (
    <div className="w-full bg-[#161616] rounded-2xl border border-gray-800 shadow-xl overflow-hidden flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-[#1a1a1a]">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          {monthNames[month]}, {year}
        </h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleToday}
            className="px-3 py-1.5 text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
          >
            Hôm nay
          </button>
          <button 
            onClick={handlePrevMonth}
            className="p-1.5 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <button 
            onClick={handleNextMonth}
            className="p-1.5 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-gray-800">
        {dayNames.map((day, idx) => (
          <div key={idx} className="py-2 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider border-r border-gray-800 last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 auto-rows-[minmax(120px,auto)] flex-1">
        {calendarDays.map((day, idx) => {
          if (!day) {
            return <div key={`empty-${idx}`} className="bg-[#111] border-r border-b border-gray-800/50" />;
          }

          const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday = dateKey === todayStr;
          const dayShows = showsByDate[dateKey] || [];

          return (
            <div 
              key={dateKey} 
              className={`p-2 border-r border-b border-gray-800/50 flex flex-col gap-1 transition-colors hover:bg-gray-800/20 ${isToday ? 'bg-primary/5' : ''}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-primary text-white' : 'text-gray-400'}`}>
                  {day}
                </span>
                {dayShows.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">
                    {dayShows.length} suất
                  </span>
                )}
              </div>
              
              <div className="flex flex-col gap-1 overflow-y-auto max-h-[150px] no-scrollbar">
                {dayShows.map(show => {
                  const d = new Date(show.showDateTime);
                  const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
                  return (
                    <div 
                      key={show._id}
                      onClick={() => navigate(`/admin/list-bookings?showId=${show._id}`)}
                      className="text-[11px] p-1.5 rounded bg-[#222] border border-gray-700 hover:border-primary/50 cursor-pointer flex flex-col group transition-colors"
                      title={show.movie?.title}
                    >
                      <span className="font-bold text-primary group-hover:text-primary-dull transition-colors">{timeStr}</span>
                      <span className="text-gray-300 truncate">{show.movie?.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminCalendar;
