import {
  ChartLineIcon,
  CircleDollarSignIcon,
  PlayCircleIcon,
  StarIcon,
  UserIcon,
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
    totalUser: 0,
  });

  const [loading, setLoading] = useState(true);

  const dashboardCards = [
    {
      title: "Tổng số vé đặt",
      value: dashboardData.totalBookings || "0",
      icon: ChartLineIcon,
      color: "from-blue-500/20 to-blue-500/5",
      borderColor: "border-blue-500/30",
      iconColor: "text-blue-500",
    },
    {
      title: "Tổng doanh thu",
      value: `${(dashboardData.totalRevenue || 0).toLocaleString("vi-VN")} ${currency}`,
      icon: CircleDollarSignIcon,
      color: "from-green-500/20 to-green-500/5",
      borderColor: "border-green-500/30",
      iconColor: "text-green-500",
    },
    {
      title: "Suất chiếu đang mở",
      value: dashboardData.activeShows.length || "0",
      icon: PlayCircleIcon,
      color: "from-purple-500/20 to-purple-500/5",
      borderColor: "border-purple-500/30",
      iconColor: "text-purple-500",
    },
    {
      title: "Tổng người dùng",
      value: dashboardData.totalUser || "0",
      icon: UserIcon,
      color: "from-primary/20 to-primary/5",
      borderColor: "border-primary/30",
      iconColor: "text-primary",
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
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <div className="mb-6">
        <Title text1="Bảng" text2="Điều khiển" />
      </div>

      <div className="relative">
        <BlurCircle top="-100px" left="10%" />
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {dashboardCards.map((card, index) => (
            <div
              key={index}
              className={`flex items-center justify-between w-full p-5 md:p-6 rounded-2xl bg-gradient-to-br ${card.color} border ${card.borderColor} backdrop-blur-md shadow-lg transition-transform hover:-translate-y-1`}
            >
              <div>
                <h1 className="text-sm font-medium text-gray-400 mb-1">{card.title}</h1>
                <p className="text-2xl md:text-3xl font-bold text-white">{card.value}</p>
              </div>
              <div className={`p-3 rounded-full bg-[#111]/50 shadow-inner ${card.iconColor}`}>
                <card.icon className="w-8 h-8" strokeWidth={1.5} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 mb-4 flex items-center justify-between z-10 relative">
        <h2 className="text-xl font-bold text-white">Hiệu suất theo Phim</h2>
      </div>
      
      {/* Movie Performance Chart */}
      <div className="relative w-full z-10 bg-[#161616] p-6 rounded-2xl border border-gray-800 shadow-xl overflow-hidden mb-6">
        <BlurCircle top="100px" left="-10%" />
        {dashboardData.moviePerformance && dashboardData.moviePerformance.length > 0 ? (
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dashboardData.moviePerformance}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 70,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis 
                  dataKey="title" 
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  tickLine={{ stroke: '#555' }}
                  axisLine={{ stroke: '#555' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  yAxisId="left" 
                  orientation="left" 
                  stroke="#primary"
                  tick={{ fill: '#e50914', fontSize: 12 }}
                  tickLine={{ stroke: '#555' }}
                  axisLine={{ stroke: '#555' }}
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke="#3b82f6" 
                  tick={{ fill: '#3b82f6', fontSize: 12 }}
                  tickLine={{ stroke: '#555' }}
                  axisLine={{ stroke: '#555' }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#333', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold', marginBottom: '8px' }}
                  formatter={(value, name) => {
                    if (name === 'Doanh thu') return [`${value.toLocaleString("vi-VN")} ${currency}`, name];
                    return [value, name];
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar yAxisId="left" dataKey="revenue" name="Doanh thu" fill="#e50914" radius={[4, 4, 0, 0]} barSize={40} />
                <Bar yAxisId="right" dataKey="ticketsSold" name="Vé bán ra" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="w-full p-10 flex flex-col items-center justify-center bg-gray-900/30 border border-gray-800 border-dashed rounded-2xl">
            <ChartLineIcon className="w-12 h-12 text-gray-600 mb-2" />
            <p className="text-gray-500">Chưa có dữ liệu thống kê</p>
          </div>
        )}
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default Dashboard;
