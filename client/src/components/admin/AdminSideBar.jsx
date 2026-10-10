import { useState, useEffect } from "react";
import {
  LayoutDashboardIcon,
  ListCollapseIcon,
  ListIcon,
  PlusSquareIcon,
  UsersIcon,
  ScanLineIcon,
  MenuIcon,
  XIcon,
  ImagePlayIcon,
  MonitorIcon,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { assets } from "../../assets/assets";

const AdminSideBar = () => {
  const location = useLocation();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const user = {
    firstName: "Admin",
    lastName: "User",
    imageUrl: assets.profile,
  };

  const adminNavlinks = [
    { name: "Bảng điều khiển", path: "/admin", icon: LayoutDashboardIcon },
    { name: "Phòng chiếu", path: "/admin/rooms", icon: MonitorIcon },
    { name: "Thêm suất chiếu", path: "/admin/add-shows", icon: PlusSquareIcon },
    { name: "DS Suất chiếu", path: "/admin/list-shows", icon: ListIcon },
    { name: "DS Vé đã đặt", path: "/admin/list-bookings", icon: ListCollapseIcon },
    { name: "Tài khoản", path: "/admin/users", icon: UsersIcon },
    { name: "Quản lý Banner", path: "/admin/banners", icon: ImagePlayIcon },
  ];

  // Close mobile menu on route change
  useEffect(() => {
    setIsMoreOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col items-center pt-10 pb-6 max-w-[280px] w-full h-[calc(100vh-64px)] border-r border-white/5 bg-black/20 backdrop-blur-xl text-sm relative z-20">
        <div className="relative group">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <img
            className="h-16 w-16 rounded-full mx-auto relative ring-2 ring-white/10 group-hover:ring-primary transition-all duration-300"
            src={user.imageUrl}
            alt="sidebar"
          />
        </div>
        <p className="mt-3 text-base font-medium tracking-wide">
          {user.firstName} {user.lastName}
        </p>
        <p className="text-xs text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-md mt-1 border border-primary/20 uppercase tracking-widest">Administrator</p>

        <div className="w-full mt-10 px-4 space-y-2">
          {adminNavlinks.map((link, index) => (
            <NavLink
              key={index}
              to={link.path}
              end
              className={({ isActive }) =>
                `relative flex items-center gap-3 w-full px-5 py-3.5 rounded-2xl text-gray-400 hover:text-white transition-all duration-300 group overflow-hidden ${
                  isActive ? "bg-white/10 text-white shadow-[0_10px_20px_rgba(0,0,0,0.2)] border border-white/10" : "hover:bg-white/5 border border-transparent"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-0 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'group-hover:opacity-100'}`} />
                  <link.icon className={`w-5 h-5 relative z-10 transition-colors ${isActive ? 'text-primary' : 'group-hover:text-primary'}`} />
                  <p className="relative z-10 font-medium">{link.name}</p>
                </>
              )}
            </NavLink>
          ))}
          
          <div className="pt-4 mt-4 border-t border-white/5">
            {/* Scan QR Button on Desktop */}
            <NavLink
              to="/admin/scan"
              end
              className={({ isActive }) =>
                `relative flex items-center gap-3 w-full px-5 py-3.5 rounded-2xl transition-all duration-300 group overflow-hidden ${
                  isActive ? "bg-primary text-white shadow-[0_0_20px_rgba(248,69,101,0.4)]" : "bg-white/5 text-white hover:bg-primary/20 hover:text-white border border-white/10"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <ScanLineIcon className={`w-5 h-5 relative z-10 ${isActive ? 'text-white' : 'text-primary group-hover:text-primary'}`} />
                  <p className="relative z-10 font-medium tracking-wide">Quét vé ngay</p>
                </>
              )}
            </NavLink>
          </div>
        </div>
      </div>

      {/* Mobile Slide-up Menu Drawer */}
      <div 
        className={`md:hidden fixed inset-0 z-[40] bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${isMoreOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsMoreOpen(false)}
      >
        <div 
          className={`absolute bottom-16 left-0 w-full bg-[#111] border-t border-white/10 rounded-t-3xl p-6 pb-10 flex flex-col gap-2 transition-transform duration-300 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] ${isMoreOpen ? "translate-y-0" : "translate-y-full"}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white tracking-wide">Menu Quản Trị</h3>
            <button onClick={() => setIsMoreOpen(false)} className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-white transition">
              <XIcon className="w-5 h-5" />
            </button>
          </div>
          
          {adminNavlinks.map((link, index) => (
            <NavLink
              key={index}
              to={link.path}
              end
              className={({ isActive }) =>
                `flex items-center gap-4 w-full p-4 rounded-2xl text-gray-300 transition-all active:scale-95 ${
                  isActive ? "bg-primary/20 text-white border border-primary/30 font-bold shadow-md" : "bg-white/5 border border-transparent"
                }`
              }
            >
              <link.icon className="w-6 h-6" />
              <p className="text-base">{link.name}</p>
            </NavLink>
          ))}
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 w-full h-16 bg-black/80 backdrop-blur-xl border-t border-white/10 z-[50] flex items-center justify-between px-2 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        {/* Left Side Links */}
        <div className="flex flex-1 justify-around">
          <NavLink to="/admin" end className={({ isActive }) => `flex flex-col items-center p-2 transition-colors ${isActive ? 'text-primary' : 'text-gray-500 hover:text-white'}`}>
            <LayoutDashboardIcon className="w-6 h-6" />
          </NavLink>
          <NavLink to="/admin/list-shows" className={({ isActive }) => `flex flex-col items-center p-2 transition-colors ${isActive ? 'text-primary' : 'text-gray-500 hover:text-white'}`}>
            <ListIcon className="w-6 h-6" />
          </NavLink>
        </div>

        {/* Center Floating Scan Button */}
        <div className="relative -top-6 flex justify-center w-20">
          <NavLink 
            to="/admin/scan"
            className={({ isActive }) => `flex items-center justify-center w-14 h-14 rounded-full shadow-[0_10px_20px_rgba(248,69,101,0.4)] transition-all duration-300 active:scale-95 ${isActive ? 'bg-white text-primary ring-4 ring-black' : 'bg-primary text-white ring-4 ring-black hover:bg-white hover:text-primary'}`}
          >
            <ScanLineIcon className="w-7 h-7" strokeWidth={2.5} />
          </NavLink>
        </div>

        {/* Right Side Links */}
        <div className="flex flex-1 justify-around">
          <NavLink to="/admin/list-bookings" className={({ isActive }) => `flex flex-col items-center p-2 transition-colors ${isActive ? 'text-primary' : 'text-gray-500 hover:text-white'}`}>
            <ListCollapseIcon className="w-6 h-6" />
          </NavLink>
          <button onClick={() => setIsMoreOpen(!isMoreOpen)} className={`flex flex-col items-center p-2 transition-colors ${isMoreOpen ? 'text-primary' : 'text-gray-500 hover:text-white'}`}>
            <MenuIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminSideBar;
