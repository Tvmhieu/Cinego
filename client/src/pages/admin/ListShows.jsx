import { useEffect, useState } from "react";
import { dummyShowsData } from "../../assets/assets";
import Loading from "../../components/Loading";
import Title from "../../components/admin/Title";
import { dateFormat } from "../../lib/dateFormat";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const ListShows = () => {
  const { axios, getToken, user } = useAppContext();

  const currency = import.meta.env.VITE_CURRENCY;

  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAllShows = async () => {
    try {
      // setShows([
      //   {
      //     movie: dummyShowsData[0],
      //     showDateTime: "2025-06-30T02:30:00.000Z",
      //     showPrice: 59,
      //     occupiedSeats: {
      //       A1: "user_1",
      //       B1: "user_2",
      //       C1: "user_3",
      //     },
      //   },
      // ]);

      const { data } = await axios.get("/api/admin/all-shows", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      setShows(data.shows);
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancelShow = async (showId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa suất chiếu này?")) return;

    try {
      const { data } = await axios.post(
        "/api/admin/cancel-show",
        { showId },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );

      if (data.success) {
        toast.success(data.message);
        getAllShows(); // Refresh list
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi xóa suất chiếu");
    }
  };

  useEffect(() => {
    if (user) {
      getAllShows();
    }
  }, [user]);

  return !loading ? (
    <>
      <Title text1="Danh sách" text2="Suất chiếu" />

      <div className="max-w-4xl mt-6 overflow-x-auto">
        <table className="w-full overflow-hidden border-collapse rounded-md text-nowrap">
          <thead>
            <tr className="text-left text-white bg-primary/20">
              <th className="p-2 pl-5 font-medium">Tên phim</th>
              <th className="p-2 font-medium">Giờ chiếu</th>
              <th className="p-2 font-medium">Tổng vé bán</th>
              <th className="p-2 font-medium">Doanh thu</th>
              <th className="p-2 font-medium">Thao tác</th>
            </tr>
          </thead>

          <tbody className="text-sm font-light">
            {shows.map((show, index) => (
              <tr
                key={index}
                className="border-b border-primary/10 bg-primary/5 even:bg-primary/10"
              >
                <td className="p-2 pl-5 min-w-45">{show.movie.title}</td>
                <td className="p-2">{dateFormat(show.showDateTime)}</td>
                <td className="p-2">
                  {Object.keys(show.occupiedSeats).length}
                </td>
                <td className="p-2">
                  {(Object.keys(show.occupiedSeats).length * show.showPrice).toLocaleString("vi-VN")} {currency}
                </td>
                <td className="p-2">
                  <button
                    onClick={() => handleCancelShow(show._id)}
                    className="px-3 py-1 text-xs font-medium text-white transition rounded-md cursor-pointer bg-red-600 hover:bg-red-700 active:scale-95"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  ) : (
    <Loading />
  );
};

export default ListShows;
