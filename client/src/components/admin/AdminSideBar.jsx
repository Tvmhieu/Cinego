import {
  LayoutDashboardIcon,
  ListCollapseIcon,
  ListIcon,
  PlusSquareIcon,
  UsersIcon,
  ScanLineIcon,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { assets } from "../../assets/assets";

const AdminSideBar = () => {
  const location = useLocation();
  const user = {
    firstName: "Admin",
    lastName: "User",
    imageUrl: assets.profile,
  };

  const adminNavlinks = [
    { name: "Bảng điều khiển", path: "/admin", icon: LayoutDashboardIcon },
    { name: "Thêm suất chiếu", path: "/admin/add-shows", icon: PlusSquareIcon },
    { name: "DS Suất chiếu", path: "/admin/list-shows", icon: ListIcon },
    { name: "DS Vé đã đặt", path: "/admin/list-bookings", icon: ListCollapseIcon },
    { name: "Tài khoản", path: "/admin/users", icon: UsersIcon },
    { name: "Quản lý Banner", path: "/admin/banners", icon: ListIcon },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col items-center pt-8 max-w-60 w-full h-[calc(100vh-64px)] border-r border-gray-300/20 text-sm">
        <img
          className="h-14 w-14 rounded-full mx-auto"
          src={user.imageUrl}
          alt="sidebar"
        />
        <p className="mt-2 text-base">
          {user.firstName} {user.lastName}
        </p>

        <div className="w-full mt-6">
          {adminNavlinks.map((link, index) => (
            <NavLink
              key={index}
              to={link.path}
              end
              className={({ isActive }) =>
                `relative flex items-center gap-2 w-full py-2.5 pl-10 text-gray-400 hover:text-gray-200 transition ${
                  isActive && "bg-primary/15 text-primary group"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <link.icon className="w-5 h-5" />
                  <p>{link.name}</p>
                  <span
                    className={`w-1.5 h-10 rounded-l right-0 absolute ${
                      isActive && "bg-primary"
                    }`}
                  />
                </>
              )}
            </NavLink>
          ))}
          {/* Scan QR Button on Desktop */}
          <NavLink
            to="/admin/scan"
            end
            className={({ isActive }) =>
              `relative flex items-center gap-2 w-full py-2.5 pl-10 mt-2 text-gray-400 hover:text-gray-200 transition ${
                isActive && "bg-primary/15 text-primary group"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <ScanLineIcon className="w-5 h-5" />
                <p>Quét vé</p>
                <span
                  className={`w-1.5 h-10 rounded-l right-0 absolute ${
                    isActive && "bg-primary"
                  }`}
                />
              </>
            )}
          </NavLink>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 w-full h-16 bg-[#111] border-t border-gray-800 z-50 flex items-center justify-between px-2 pb-safe">
        {/* Left Side Links */}
        <div className="flex flex-1 justify-around">
          <NavLink to="/admin" end className={({ isActive }) => `flex flex-col items-center p-2 ${isActive ? 'text-primary' : 'text-gray-500'}`}>
            <LayoutDashboardIcon className="w-6 h-6" />
          </NavLink>
          <NavLink to="/admin/list-shows" className={({ isActive }) => `flex flex-col items-center p-2 ${isActive ? 'text-primary' : 'text-gray-500'}`}>
            <ListIcon className="w-6 h-6" />
          </NavLink>
        </div>

        {/* Center Floating Scan Button */}
        <div className="relative -top-6 flex justify-center w-20">
          <NavLink 
            to="/admin/scan"
            className={({ isActive }) => `flex items-center justify-center w-14 h-14 rounded-full shadow-[0_0_15px_rgba(229,9,20,0.5)] transition-transform active:scale-95 ${isActive ? 'bg-white text-primary' : 'bg-primary text-white'}`}
          >
            <ScanLineIcon className="w-8 h-8" strokeWidth={2.5} />
          </NavLink>
        </div>

        {/* Right Side Links */}
        <div className="flex flex-1 justify-around">
          <NavLink to="/admin/list-bookings" className={({ isActive }) => `flex flex-col items-center p-2 ${isActive ? 'text-primary' : 'text-gray-500'}`}>
            <ListCollapseIcon className="w-6 h-6" />
          </NavLink>
          <NavLink to="/admin/users" className={({ isActive }) => `flex flex-col items-center p-2 ${isActive ? 'text-primary' : 'text-gray-500'}`}>
            <UsersIcon className="w-6 h-6" />
          </NavLink>
        </div>
      </div>
    </>
  );
};

export default AdminSideBar;
