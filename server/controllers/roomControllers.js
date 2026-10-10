import Room from "../models/Room.js";

// Add a new room
export const addRoom = async (req, res) => {
  try {
    const { name, rows, columns, layout } = req.body;

    const existingRoom = await Room.findOne({ name });
    if (existingRoom) {
      return res.json({ success: false, message: "Tên phòng đã tồn tại!" });
    }

    const room = await Room.create({
      name,
      rows,
      columns,
      layout,
    });

    res.json({ success: true, message: "Đã thêm phòng chiếu thành công!", room });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Get all rooms
export const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find({}).sort({ createdAt: -1 });
    res.json({ success: true, rooms });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Delete room
export const deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    await Room.findByIdAndDelete(roomId);
    res.json({ success: true, message: "Đã xóa phòng chiếu!" });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Update room
export const updateRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { name, layout, rows, columns } = req.body;

    const room = await Room.findByIdAndUpdate(
      roomId,
      { name, layout, rows, columns },
      { new: true }
    );

    res.json({ success: true, message: "Cập nhật phòng thành công!", room });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};
