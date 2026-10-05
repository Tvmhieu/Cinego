import { Link } from "react-router-dom";
import { assets } from "../assets/assets";

const Footer = () => {
  return (
    <footer className="px-6 md:px-16 lg:px-36 mt-40 w-full text-gray-300">
      <div className="flex flex-col md:flex-row justify-between w-full gap-10 border-b border-gray-500 pb-14">
        <div className="md:max-w-96">
          <span className="text-3xl font-bold tracking-tight text-white italic"><span className="text-primary">Cine</span>Go</span>
          <p className="mt-6 text-sm">
            CineGo là nền tảng đặt vé xem phim trực tuyến hàng đầu, giúp bạn 
            khám phá các bộ phim mới nhất và tìm kiếm rạp chiếu gần bạn.
            Trải nghiệm đặt vé nhanh chóng, an toàn cùng nhiều ưu đãi hấp dẫn!
          </p>
          <div className="flex items-center gap-2 mt-4">
            <img
              src={assets.googlePlay}
              alt="Get it on Google Play"
              className="h-9 w-auto"
            />
            <img
              src={assets.appStore}
              alt="Download on the App Store"
              className="h-9 w-auto"
            />
          </div>
        </div>
        <div className="flex-1 flex items-start md:justify-end gap-20 md:gap-40">
          <div>
            <h2 className="font-semibold mb-5">Liên kết nhanh</h2>

            <ul className="text-sm space-y-2">
              <li>
                <Link to="/">Trang chủ</Link>
              </li>
              <li>
                <Link to="/movies">Phim</Link>
              </li>
              <li>
                <Link to="/theaters">Rạp chiếu</Link>
              </li>
              <li>
                <Link to="/favourite">Yêu thích</Link>
              </li>
              <li>
                <Link to="/contact">Liên hệ</Link>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="font-semibold mb-5">Liên hệ với chúng tôi</h2>
            <div className="text-sm space-y-2">
              <p>
                Hỗ trợ:{" "}
                <a href="mailto:support@cinego.com" className="underline">
                  support@cinego.com
                </a>
              </p>
              <p>
                Hợp tác:{" "}
                <a href="mailto:business@cinego.com" className="underline">
                  business@cinego.com
                </a>
              </p>
              <p>Hotline: 1900 1234</p>
            </div>
          </div>
        </div>
      </div>
      <p className="pt-4 text-center text-sm pb-5">
        &copy; {new Date().getFullYear()} CineGo. Bản quyền thuộc về {" "}
        <a
          href="#"
          className="underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Minh Hieu
        </a>
      </p>
    </footer>
  );
};

export default Footer;
