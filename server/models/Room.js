import mongoose from "mongoose";

const seatSchema = new mongoose.Schema({
  id: { type: String, required: true }, // e.g., "A1"
  type: { type: String, enum: ["standard", "vip", "empty"], default: "standard" },
  priceMultiplier: { type: Number, default: 1 },
}, { _id: false });

const rowSchema = new mongoose.Schema({
  rowName: { type: String, required: true }, // e.g., "A", "B"
  seats: [seatSchema]
}, { _id: false });

const roomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    rows: { type: Number, required: true },
    columns: { type: Number, required: true },
    layout: [rowSchema]
  },
  { timestamps: true }
);

const Room = mongoose.model("Room", roomSchema);

export default Room;
