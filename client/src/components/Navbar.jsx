import { Link, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { MenuIcon, SearchIcon, TicketPlus, XIcon } from "lucide-react";
import { useState } from "react";
import { useClerk, UserButton, useUser } from "@clerk/clerk-react";
import { useAppContext } from "../context/AppContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  const { openSignIn } = useClerk();

  const navigate = useNavigate();

  const { favouriteMovies, isAdmin } = useAppContext();

  return (
    <div className="fixed top-0 left-0 z-50 flex items-center justify-between w-full px-4 py-4 md:px-12 lg:px-24 transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" />
      
      <Link to="/" className="relative z-10 max-md:flex-1 text-2xl md:text-3xl font-black tracking-tighter text-white italic drop-shadow-md">
        <span className="text-primary">Cine</span>Go
      </Link>

      <div
        className={`max-md:absolute max-md:top-0 max-md:left-0 max-md:font-semibold max-md:text-lg z-50 flex flex-col md:flex-row items-center max-md:justify-center gap-6 md:gap-8 md:px-8 py-3 max-md:h-screen md:rounded-full backdrop-blur-md bg-black/90 md:bg-white/5 border-b md:border border-white/5 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? "max-md:w-full opacity-100" : "max-md:w-0 max-md:opacity-0 md:opacity-100"
        }`}
      >
        <XIcon
          className="absolute w-7 h-7 text-white/50 hover:text-white cursor-pointer md:hidden top-6 right-6 transition-colors"
          onClick={() => setIsOpen(false)}
        />
        
        {/* Navigation Links */}
        {[
          { label: "Trang chủ", path: "/" },
          { label: "Phim", path: "/movies" },
          ...(favouriteMovies.length > 0 ? [{ label: "Yêu thích", path: "/favourite" }] : []),
        ].map((link, idx) => (
          <Link
            key={idx}
            onClick={() => {
              scrollTo(0, 0);
              setIsOpen(false);
            }}
            to={link.path}
            className="text-white/70 hover:text-white transition-colors duration-300 tracking-wide font-medium"
          >
            {link.label}
          </Link>
        ))}

        <a
          href="/my-bookings"
          onClick={(e) => {
            e.preventDefault();
            setIsOpen(false);
            if (!user) {
              openSignIn();
            } else {
              navigate("/my-bookings");
              scrollTo(0, 0);
            }
          }}
          className="text-white/70 hover:text-white transition-colors duration-300 tracking-wide font-medium cursor-pointer"
        >
          Vé của tôi
        </a>

        {isAdmin && (
          <Link
            onClick={() => {
              scrollTo(0, 0);
              setIsOpen(false);
            }}
            to="/admin"
            className="font-bold text-primary tracking-wide drop-shadow-[0_0_10px_rgba(248,69,101,0.5)]"
          >
            Quản trị
          </Link>
        )}
      </div>

      <div className="relative z-10 flex items-center gap-6">
        <SearchIcon className="w-5 h-5 text-white/80 hover:text-white transition-colors cursor-pointer max-md:hidden" />
        {!user ? (
          <button
            onClick={openSignIn}
            className="px-5 py-2 text-sm font-bold tracking-wide text-black transition-all duration-300 rounded-full cursor-pointer bg-white hover:bg-primary hover:text-white hover:shadow-[0_0_15px_rgba(248,69,101,0.4)] active:scale-95"
          >
            Đăng nhập
          </button>
        ) : (
          <UserButton appearance={{ elements: { avatarBox: "w-9 h-9 ring-2 ring-white/10 hover:ring-primary transition-all" } }} />
        )}
      </div>

      <MenuIcon
        className="relative z-10 w-7 h-7 text-white/80 hover:text-white transition-colors cursor-pointer max-md:ml-4 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      />
    </div>
  );
};

export default Navbar;
