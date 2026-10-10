import Room from "../models/Room.js";
import Show from "../models/Show.js";
import Booking from "../models/Booking.js";

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

    // Find all shows for this room
    const shows = await Show.find({ room: roomId });
    const showIds = shows.map(s => s._id);

    // Delete associated bookings and shows
    if (showIds.length > 0) {
      await Booking.deleteMany({ show: { $in: showIds } });
      await Show.deleteMany({ room: roomId });
    }

    await Room.findByIdAndDelete(roomId);
    res.json({ success: true, message: "Đã xóa phòng chiếu và các suất chiếu/vé liên quan!" });
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

// Get room stats
export const getRoomStats = async (req, res) => {
  try {
    const { roomId } = req.params;
    const showCount = await Show.countDocuments({ room: roomId });
    res.json({ success: true, showCount });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};
