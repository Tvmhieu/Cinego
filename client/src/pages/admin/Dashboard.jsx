import {
  ChartLineIcon,
  CircleDollarSignIcon,
  PlayCircleIcon,
  FilmIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import Title from "../../components/admin/Title";
import BlurCircle from "../../components/BlurCircle";
import { dateFormat } from "../../lib/dateFormat";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const { axios, getToken, user, image_base_url } = useAppContext();
  const currency = import.meta.env.VITE_CURRENCY;

  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    activeShows: [],
    activeMoviesCount: 0,
    moviePerformance: [],
  });

  const [loading, setLoading] = useState(true);
  const [selectedMoviePerf, setSelectedMoviePerf] = useState(null);

  const dashboardCards = [
    {
      title: "Tổng số vé đặt",
      value: dashboardData.totalBookings || "0",
      icon: ChartLineIcon,
      color: "from-white/5 to-transparent",
      borderColor: "border-white/10 group-hover:border-primary/50",
      iconColor: "text-white group-hover:text-primary transition-colors duration-300",
    },
    {
      title: "Tổng doanh thu",
      value: `${(dashboardData.totalRevenue || 0).toLocaleString("vi-VN")} ${currency}`,
      icon: CircleDollarSignIcon,
      color: "from-white/5 to-transparent",
      borderColor: "border-white/10 group-hover:border-primary/50",
      iconColor: "text-white group-hover:text-primary transition-colors duration-300",
    },
    {
      title: "Suất chiếu đang mở",
      value: dashboardData.activeShows?.length || "0",
      icon: PlayCircleIcon,
      color: "from-white/5 to-transparent",
      borderColor: "border-white/10 group-hover:border-primary/50",
      iconColor: "text-white group-hover:text-primary transition-colors duration-300",
    },
    {
      title: "Số phim đang chiếu",
      value: dashboardData.activeMoviesCount || "0",
      icon: FilmIcon,
      color: "from-white/5 to-transparent",
      borderColor: "border-white/10 group-hover:border-primary/50",
      iconColor: "text-white group-hover:text-primary transition-colors duration-300",
    },
  ];

  const fetchDashboardData = async () => {
    try {
      const { data } = await axios.get("/api/admin/dashboard", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      if (data.success) {
        setDashboardData(data.dashboardData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Error fetching dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  return !loading ? (
    <div className="flex flex-col animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">

      <div className="relative">
        <BlurCircle top="-100px" left="10%" />
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {dashboardCards.map((card, index) => (
            <div
              key={index}
              className={`group flex items-center justify-between w-full p-6 rounded-3xl bg-gradient-to-br ${card.color} border ${card.borderColor} backdrop-blur-xl shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(248,69,101,0.15)] relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="relative z-10">
                <h1 className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-2">{card.title}</h1>
                <p className="text-2xl md:text-3xl font-black text-white tracking-tight">{card.value}</p>
              </div>
              <div className={`relative z-10 p-4 rounded-2xl bg-white/5 border border-white/5 shadow-inner transition-transform duration-300 group-hover:scale-110 group-hover:bg-primary/20 group-hover:border-primary/30 ${card.iconColor}`}>
                <card.icon className="w-7 h-7" strokeWidth={2} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 mb-6 flex items-center justify-between z-10 relative">
        <h2 className="text-xl font-bold text-white tracking-wide">Hiệu suất theo Phim</h2>
      </div>
      
      {/* Movie Performance Chart */}
      <div className="relative w-full z-10 bg-white/5 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden mb-6 group">
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
        <BlurCircle top="100px" left="-10%" />
        {dashboardData.moviePerformance && dashboardData.moviePerformance.length > 0 ? (
          <div className="h-[450px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dashboardData.moviePerformance}
                margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="title" 
                  tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 600 }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  height={30}
                  tickFormatter={(value) => value.length > 12 ? value.substring(0, 12) + '...' : value}
                />
                <YAxis 
                  yAxisId="left" 
                  orientation="left" 
                  stroke="rgba(255,255,255,0.1)"
                  tick={{ fill: '#f84565', fontSize: 12, fontWeight: 700 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke="rgba(255,255,255,0.1)" 
                  tick={{ fill: '#fff', fontSize: 12, fontWeight: 700 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', padding: '12px 16px' }}
                  itemStyle={{ fontWeight: 'bold' }}
                  labelStyle={{ color: '#fff', fontWeight: '900', marginBottom: '12px', fontSize: '14px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}
                  formatter={(value, name) => {
                    if (name === 'Doanh thu') return [`${value.toLocaleString("vi-VN")} ${currency}`, name];
                    return [value, name];
                  }}
                  cursor={{ fill: 'rgba(248,69,101,0.05)' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '13px', fontWeight: 'bold' }} />
                <Bar 
                  yAxisId="left" 
                  dataKey="revenue" 
                  name="Doanh thu" 
                  fill="#f84565" 
                  radius={[6, 6, 0, 0]} 
                  barSize={32}
                  onClick={(data) => setSelectedMoviePerf(data)}
                  cursor="pointer"
                />
                <Bar 
                  yAxisId="right" 
                  dataKey="ticketsSold" 
                  name="Vé bán ra" 
                  fill="#ffffff" 
                  radius={[6, 6, 0, 0]} 
                  barSize={32}
                  onClick={(data) => setSelectedMoviePerf(data)}
                  cursor="pointer"
                />
                <Bar 
                  yAxisId="right" 
                  dataKey="showCount" 
                  name="Số suất chiếu" 
                  fill="rgba(255,255,255,0.3)" 
                  radius={[6, 6, 0, 0]} 
                  barSize={32}
                  onClick={(data) => setSelectedMoviePerf(data)}
                  cursor="pointer"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="w-full p-16 flex flex-col items-center justify-center bg-white/5 border border-white/10 border-dashed rounded-3xl">
            <ChartLineIcon className="w-16 h-16 text-gray-600 mb-4" strokeWidth={1} />
            <p className="text-gray-400 font-medium tracking-wide">Chưa có dữ liệu thống kê</p>
          </div>
        )}
      </div>

      {/* Selected Movie Details Modal */}
      {selectedMoviePerf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedMoviePerf(null)}>
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#1a1a1a] rounded-2xl shadow-2xl border border-gray-700 p-6 sm:p-8 animate-in zoom-in-95 duration-300 scrollbar-hide" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedMoviePerf(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700 p-2 rounded-full transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <ChartLineIcon className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 line-clamp-2 leading-tight">
                {selectedMoviePerf.title || selectedMoviePerf.payload?.title}
              </h2>
              <p className="text-gray-400 text-sm">Chi tiết hiệu suất phim</p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:gap-4 mb-6">
              <div className="flex items-center justify-between p-4 bg-gray-800/40 rounded-xl border border-gray-700/50">
                <span className="text-gray-400 font-medium">Số suất chiếu</span>
                <span className="text-lg font-bold text-white">{selectedMoviePerf.showCount || selectedMoviePerf.payload?.showCount || 0}</span>
              </div>
              <div className="flex flex-col gap-2 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-blue-400 font-medium">Tổng số vé đã bán</span>
                  <span className="text-lg font-bold text-blue-500">{selectedMoviePerf.ticketsSold || selectedMoviePerf.payload?.ticketsSold || 0} vé</span>
                </div>
                
                {/* Breakdown by Price */}
                {(() => {
                  const details = selectedMoviePerf.ticketDetails || selectedMoviePerf.payload?.ticketDetails;
                  if (details && Object.keys(details).length > 0) {
                    return (
                      <div className="mt-2 space-y-2 border-t border-blue-500/20 pt-2">
                        {Object.entries(details).map(([price, info]) => (
                          <div key={price} className="text-sm">
                            <div className="flex justify-between text-blue-300">
                              <span>Giá {Number(price).toLocaleString("vi-VN")} {currency}:</span>
                              <span className="font-medium">{info.count} vé</span>
                            </div>
                            <div className="text-xs text-blue-400/70 mt-1 max-h-20 overflow-y-auto pr-1 custom-scrollbar">
                              <span className="italic">Ghế: </span>
                              {info.seats.join(", ")}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
              <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                <span className="text-red-400 font-medium">Tổng doanh thu</span>
                <span className="text-lg font-bold text-primary">{(selectedMoviePerf.revenue || selectedMoviePerf.payload?.revenue || 0).toLocaleString("vi-VN")} {currency}</span>
              </div>
            </div>
            
            <button 
              onClick={() => setSelectedMoviePerf(null)}
              className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  ) : (
    <Loading />
  );
};

export default Dashboard;
