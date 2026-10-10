import { useState, useEffect } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const Rooms = () => {
  const { axios, getToken } = useAppContext();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Room form state
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [roomName, setRoomName] = useState("");
  const [rows, setRows] = useState(10);
  const [cols, setCols] = useState(15);
  const [layout, setLayout] = useState([]);
  
  // Selection state for seat builder
  const [selectedSeats, setSelectedSeats] = useState([]);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const { data } = await axios.get("/api/room/all");
      if (data.success) {
        setRooms(data.rooms);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const initLayout = (r, c) => {
    const newLayout = [];
    for (let i = 0; i < r; i++) {
      const rowName = String.fromCharCode(65 + i);
      const seats = [];
      for (let j = 1; j <= c; j++) {
        seats.push({
          id: `${rowName}${j}`,
          type: "standard",
          priceMultiplier: 1,
        });
      }
      newLayout.push({ rowName, seats });
    }
    setLayout(newLayout);
  };

  const handleOpenBuilder = () => {
    setEditingRoomId(null);
    initLayout(rows, cols);
    setIsModalOpen(true);
  };

  const handleEditRoom = (room) => {
    setEditingRoomId(room._id);
    setRoomName(room.name);
    setRows(room.rows);
    setCols(room.columns);
    setLayout(room.layout);
    setIsModalOpen(true);
  };

  const handleSeatClick = (rIndex, sIndex) => {
    const seatId = layout[rIndex].seats[sIndex].id;
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const applyActionToSelected = (action) => {
    const newLayout = [...layout];
    newLayout.forEach((row) => {
      row.seats.forEach((seat) => {
        if (selectedSeats.includes(seat.id)) {
          if (action === "empty") seat.type = "empty";
          if (action === "vip") { seat.type = "vip"; seat.priceMultiplier = 1.5; }
          if (action === "standard") { seat.type = "standard"; seat.priceMultiplier = 1; }
        }
      });
    });
    setLayout(newLayout);
    setSelectedSeats([]); // clear selection
  };

  const handleSaveRoom = async () => {
    if (!roomName) return toast.error("Vui lòng nhập tên phòng");
    setLoading(true);
    try {
      const token = await getToken();
      
      let res;
      if (editingRoomId) {
        res = await axios.put(`/api/room/${editingRoomId}`, {
          name: roomName,
          rows,
          columns: cols,
          layout
        }, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        res = await axios.post("/api/room/add", {
          name: roomName,
          rows,
          columns: cols,
          layout
        }, { headers: { Authorization: `Bearer ${token}` } });
      }

      if (res.data.success) {
        toast.success(editingRoomId ? "Cập nhật phòng thành công" : "Thêm phòng thành công");
        setIsModalOpen(false);
        setEditingRoomId(null);
        setRoomName("");
        fetchRooms();
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error("Lỗi khi lưu phòng");
    }
    setLoading(false);
  };

  return (
    <div className="text-white">
      <h2 className="text-2xl font-bold mb-6">Quản lý Phòng Chiếu</h2>
      
      <div className="bg-white/5 p-6 rounded-xl border border-white/10 mb-8">
        <h3 className="text-xl font-bold mb-4">Tạo Phòng Mới (Seat Map Builder)</h3>
        <div className="flex gap-4 mb-4">
          <input 
            type="text" 
            placeholder="Tên phòng (VD: Phòng 1)"
            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />
          <input 
            type="number" 
            placeholder="Số hàng"
            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 w-24 text-white"
            value={rows}
            onChange={(e) => setRows(Number(e.target.value))}
          />
          <input 
            type="number" 
            placeholder="Số cột"
            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 w-24 text-white"
            value={cols}
            onChange={(e) => setCols(Number(e.target.value))}
          />
          <button 
            onClick={handleOpenBuilder}
            className="bg-primary px-6 py-2 rounded-lg font-bold hover:opacity-90"
          >
            Dựng Sơ Đồ
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map(room => (
          <div 
            key={room._id} 
            onClick={() => handleEditRoom(room)}
            className="bg-white/5 p-6 rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 hover:border-primary transition-all duration-300 group"
          >
            <div className="flex justify-between items-start">
              <h4 className="text-xl font-bold text-primary mb-2 group-hover:scale-105 transition-transform">{room.name}</h4>
              <span className="text-xs bg-white/10 px-2 py-1 rounded text-gray-300">Click để sửa</span>
            </div>
            <p className="text-gray-400">Kích thước lưới: {room.rows} x {room.columns}</p>
            <p className="text-gray-400 mt-1">
               Tổng ghế: {room.layout?.reduce((total, row) => total + row.seats.filter(s => s.type !== 'empty').length, 0)}
            </p>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-6xl max-h-full overflow-y-auto bg-[#1a1a1a] p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">{editingRoomId ? "Chỉnh sửa phòng" : "Trình thiết kế sơ đồ ghế"}</h3>
              <button onClick={() => { setIsModalOpen(false); setEditingRoomId(null); setRoomName(""); }} className="text-red-500 font-bold hover:text-red-400">Đóng</button>
            </div>

            <div className="flex gap-4 mb-6">
              <button onClick={() => applyActionToSelected("empty")} className="bg-gray-800 px-4 py-2 rounded">Xóa thành Lối Đi</button>
              <button onClick={() => applyActionToSelected("vip")} className="bg-yellow-600 px-4 py-2 rounded">Set Ghế VIP</button>
              <button onClick={() => applyActionToSelected("standard")} className="bg-blue-600 px-4 py-2 rounded">Set Ghế Thường</button>
              <div className="ml-auto flex items-center">
                <span className="mr-2">Đã chọn: {selectedSeats.length} ghế</span>
              </div>
            </div>

            <div className="overflow-x-auto p-4 bg-white/5 rounded-xl">
               <div className="min-w-max flex flex-col items-center gap-2">
                 <div className="w-full text-center bg-gray-600 py-2 rounded-md mb-8">MÀN HÌNH</div>
                 
                 {layout.map((row, rIndex) => (
                   <div key={rIndex} className="flex gap-2 items-center">
                     <div className="w-8 text-center font-bold">{row.rowName}</div>
                     {row.seats.map((seat, sIndex) => (
                       <div 
                         key={seat.id}
                         onClick={() => handleSeatClick(rIndex, sIndex)}
                         className={`w-10 h-10 rounded-t-lg flex items-center justify-center text-xs cursor-pointer select-none transition-all
                           ${seat.type === 'empty' ? 'opacity-0 cursor-default pointer-events-none' : ''}
                           ${seat.type === 'standard' ? 'bg-gray-500' : ''}
                           ${seat.type === 'vip' ? 'bg-yellow-500 text-black' : ''}
                           ${selectedSeats.includes(seat.id) ? 'ring-4 ring-white scale-110' : ''}
                         `}
                       >
                         {seat.type !== 'empty' && seat.id}
                       </div>
                     ))}
                   </div>
                 ))}
               </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                onClick={handleSaveRoom}
                disabled={loading}
                className="bg-primary px-8 py-3 rounded-lg font-bold text-white hover:opacity-90"
              >
                {loading ? "Đang lưu..." : "Lưu Phòng"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;
