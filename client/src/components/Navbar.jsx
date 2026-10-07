import { Link, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { MenuIcon, SearchIcon, TicketPlus, XIcon } from "lucide-react";
import { useState } from "react";
import { useClerk, UserButton, useUser } from "@clerk/clerk-react";
import { useAppContext } from "../context/AppContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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
        className={`fixed md:static top-0 right-0 z-50 flex flex-col md:flex-row items-center md:justify-center gap-6 md:gap-8 md:px-8 py-20 md:py-3 h-screen md:h-auto md:rounded-full backdrop-blur-xl bg-black/95 md:bg-white/5 border-l md:border border-white/10 overflow-y-auto transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? "w-64 opacity-100 shadow-[-20px_0_50px_rgba(0,0,0,0.5)]" : "w-0 md:w-auto opacity-0 md:opacity-100 pointer-events-none md:pointer-events-auto"
        }`}
      >
        <XIcon
          className="absolute w-7 h-7 text-white/50 hover:text-white cursor-pointer md:hidden top-6 right-6 transition-colors"
          onClick={() => setIsOpen(false)}
        />

        {/* Mobile Menu Logo */}
        <div className="md:hidden w-full px-8 mb-4">
          <h2 className="text-2xl font-black italic tracking-tighter"><span className="text-primary">Cine</span>Go</h2>
          <div className="w-full h-px bg-white/10 mt-6"></div>
        </div>
        
        {/* Navigation Links */}
        <div className="flex flex-col md:flex-row w-full md:w-auto items-start md:items-center px-8 md:px-0 gap-6 md:gap-8">
          {[
            { label: "Trang chủ", path: "/" },
            { label: "Phim đang chiếu", path: "/movies" },
            ...(favouriteMovies.length > 0 ? [{ label: "Yêu thích", path: "/favourite" }] : []),
          ].map((link, idx) => (
            <Link
              key={idx}
              onClick={() => {
                scrollTo(0, 0);
                setIsOpen(false);
              }}
              to={link.path}
              className="text-white/70 hover:text-white transition-colors duration-300 tracking-wide font-medium whitespace-nowrap w-full md:w-auto text-lg md:text-base"
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
            className="text-white/70 hover:text-white transition-colors duration-300 tracking-wide font-medium cursor-pointer whitespace-nowrap w-full md:w-auto text-lg md:text-base"
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
              className="font-bold text-primary tracking-wide drop-shadow-[0_0_10px_rgba(248,69,101,0.5)] whitespace-nowrap w-full md:w-auto text-lg md:text-base"
            >
              Quản trị
            </Link>
          )}

        </div>
      </div>

      <div className="relative z-10 flex items-center gap-4 md:gap-6">
        {/* Search Bar */}
        <div className="flex items-center">
          <div className={`overflow-hidden transition-all duration-300 flex items-center ${isSearchOpen ? 'w-40 md:w-48 opacity-100 mr-2' : 'w-0 opacity-0'}`}>
            <input 
              type="text" 
              placeholder="Tìm phim..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  navigate(`/movies?search=${encodeURIComponent(searchQuery)}`);
                  setIsSearchOpen(false);
                }
              }}
              autoFocus={isSearchOpen}
              className="w-full bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm text-white focus:outline-none focus:border-primary transition-colors placeholder:text-gray-400"
            />
          </div>
          <SearchIcon 
            className={`w-5 h-5 transition-colors cursor-pointer max-md:hidden ${isSearchOpen ? 'text-primary' : 'text-white/80 hover:text-white'}`}
            onClick={() => {
              if (isSearchOpen && searchQuery.trim()) {
                navigate(`/movies?search=${encodeURIComponent(searchQuery)}`);
                setIsSearchOpen(false);
              } else {
                setIsSearchOpen(!isSearchOpen);
              }
            }}
          />
        </div>
        
        <div>
          {!user ? (
            <button
              onClick={openSignIn}
              className="px-4 py-1.5 md:px-5 md:py-2 text-sm font-bold tracking-wide text-black transition-all duration-300 rounded-full cursor-pointer bg-white hover:bg-primary hover:text-white hover:shadow-[0_0_15px_rgba(248,69,101,0.4)] active:scale-95"
            >
              Đăng nhập
            </button>
          ) : (
            <UserButton appearance={{ elements: { avatarBox: "w-9 h-9 ring-2 ring-white/10 hover:ring-primary transition-all" } }} />
          )}
        </div>

        <MenuIcon
          className="w-7 h-7 text-white/80 hover:text-white transition-colors cursor-pointer md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        />
      </div>
    </div>
  );
};

export default Navbar;
