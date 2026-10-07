import { useState, useMemo } from "react";
import { ChevronLeftIcon, ChevronRightIcon, CalendarClockIcon, TicketIcon, XIcon, ArrowRightIcon } from "lucide-react";
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

  const currency = import.meta.env.VITE_CURRENCY || "VND";

  return (
    <div className="w-full bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col relative">
      <div className="flex items-center justify-between p-6 border-b border-white/10 bg-black/20">
        <h2 className="text-2xl font-black text-white flex items-center gap-3 tracking-wide">
          <CalendarClockIcon className="w-7 h-7 text-primary" />
          {monthNames[month]}, {year}
        </h2>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleToday}
            className="px-4 py-2 text-sm font-bold text-white bg-white/10 hover:bg-primary border border-white/10 rounded-xl transition-all duration-300 shadow-md"
          >
            Hôm nay
          </button>
          <div className="flex gap-1 bg-white/5 rounded-xl p-1 border border-white/10">
            <button 
              onClick={handlePrevMonth}
              className="p-2 text-gray-400 hover:text-white bg-transparent hover:bg-white/10 rounded-lg transition"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <button 
              onClick={handleNextMonth}
              className="p-2 text-gray-400 hover:text-white bg-transparent hover:bg-white/10 rounded-lg transition"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-white/5 bg-black/40">
        {dayNames.map((day, idx) => (
          <div key={idx} className="py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest border-r border-white/5 last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 auto-rows-[minmax(140px,auto)] flex-1">
        {calendarDays.map((day, idx) => {
          if (!day) {
            return <div key={`empty-${idx}`} className="bg-black/20 border-r border-b border-white/5" />;
          }

          const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday = dateKey === todayStr;
          const dayShows = showsByDate[dateKey] || [];
          const hasShows = dayShows.length > 0;

          return (
            <div 
              key={dateKey} 
              onClick={() => hasShows && setSelectedDayShows({ dateStr: `${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`, shows: dayShows })}
              className={`p-3 border-r border-b border-white/5 flex flex-col gap-2 transition-all duration-300 group ${isToday ? 'bg-primary/5 shadow-[inset_0_0_20px_rgba(248,69,101,0.1)]' : ''} ${hasShows ? 'hover:bg-white/10 cursor-pointer' : 'opacity-80'}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full transition-all ${isToday ? 'bg-primary text-white shadow-[0_0_15px_rgba(248,69,101,0.5)]' : 'text-gray-300 group-hover:bg-white/10'}`}>
                  {day}
                </span>
                {hasShows && (
                  <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-primary/20 text-primary border border-primary/30 group-hover:bg-primary group-hover:text-white transition-colors">
                    {dayShows.length} suất
                  </span>
                )}
              </div>
              
              <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[150px] no-scrollbar">
                {dayShows.slice(0, 3).map(show => {
                  const d = new Date(show.showDateTime);
                  const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
                  return (
                    <div 
                      key={show._id}
                      className="text-[11px] p-2 rounded-xl bg-black/40 border border-white/5 flex flex-col transition-all group-hover:border-white/20"
                    >
                      <span className="font-black text-primary">{timeStr}</span>
                      <span className="text-gray-300 truncate font-medium mt-0.5">{show.movie?.title}</span>
                    </div>
                  );
                })}
                {dayShows.length > 3 && (
                  <div className="text-[11px] p-2 text-center text-gray-400 font-bold bg-white/5 rounded-xl border border-white/5">
                    + {dayShows.length - 3} suất nữa
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Zoom Modal for Day Shows */}
      {selectedDayShows && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setSelectedDayShows(null)}
        >
          <div 
            className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-[#0a0a0a] rounded-3xl shadow-[0_0_50px_rgba(248,69,101,0.15)] border border-white/10 animate-in zoom-in-95 duration-300 overflow-hidden" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
              <div>
                <h3 className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-1">Lịch chiếu chi tiết</h3>
                <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                  <CalendarClockIcon className="w-8 h-8 text-primary" />
                  Ngày {selectedDayShows.dateStr}
                </h2>
              </div>
              <button 
                onClick={() => setSelectedDayShows(null)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-primary text-gray-400 hover:text-white transition-all duration-300 border border-white/10"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Shows List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
              {selectedDayShows.shows.map((show) => {
                const d = new Date(show.showDateTime);
                const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
                return (
                  <div 
                    key={show._id} 
                    onClick={() => navigate(`/admin/list-bookings?showId=${show._id}`)}
                    className="group flex flex-col md:flex-row gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex md:flex-col items-center justify-center min-w-[100px] p-3 rounded-xl bg-black/40 border border-white/5 text-center">
                      <span className="text-3xl font-black text-primary drop-shadow-[0_0_10px_rgba(248,69,101,0.5)]">{timeStr}</span>
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="text-xl font-bold text-white mb-2">{show.movie?.title}</h4>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-400">
                        <span className="flex items-center gap-1.5"><TicketIcon className="w-4 h-4" /> {(show.showPrice || 0).toLocaleString("vi-VN")} {currency}</span>
                        <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Đã bán: {show.paidTickets || 0} vé</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-end">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 group-hover:bg-primary text-gray-400 group-hover:text-white transition-all duration-300 group-hover:translate-x-1">
                        <ArrowRightIcon className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCalendar;
