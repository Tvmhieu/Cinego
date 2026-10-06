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

      <div className="mt-10 mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Suất chiếu đang mở</h2>
      </div>
      
      {/* Active Shows Grid */}
      <div className="relative w-full">
        <BlurCircle top="100px" left="-10%" />
        {dashboardData.activeShows.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 pb-6">
            {dashboardData.activeShows.map((show) => (
              <div
                key={show._id}
                className="group flex flex-col h-full overflow-hidden transition-all duration-300 border rounded-2xl bg-[#1a1a1a]/80 border-gray-800 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(229,9,20,0.15)] hover:-translate-y-2 backdrop-blur-sm"
              >
                <div className="relative aspect-[2/3] w-full overflow-hidden">
                  <img
                    src={image_base_url + show.movie.poster_path}
                    alt={`${show.movie.title} poster`}
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md border border-white/10">
                    <StarIcon className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-bold text-white">{show.movie.vote_average?.toFixed(1) || "N/A"}</span>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-primary font-bold text-sm bg-black/60 w-max px-2 py-0.5 rounded backdrop-blur-md">
                      {show.showPrice.toLocaleString("vi-VN")} {currency}
                    </p>
                  </div>
                </div>
                
                <div className="p-4 flex flex-col flex-1 justify-between">
                  <p className="font-bold text-white line-clamp-2 leading-tight mb-2 group-hover:text-primary transition-colors">{show.movie.title}</p>
                  <div className="flex items-center gap-2 mt-auto">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <p className="text-xs font-medium text-gray-400">
                      {dateFormat(show.showDateTime)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full p-10 flex flex-col items-center justify-center bg-gray-900/30 border border-gray-800 border-dashed rounded-2xl">
            <PlayCircleIcon className="w-12 h-12 text-gray-600 mb-2" />
            <p className="text-gray-500">Chưa có suất chiếu nào đang mở</p>
          </div>
        )}
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default Dashboard;
