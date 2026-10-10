import express from "express";
import { addRoom, getAllRooms, deleteRoom, updateRoom } from "../controllers/roomControllers.js";
import { requireAuth } from "@clerk/express";

const roomRouter = express.Router();

// Since rooms are managed by admin, we should ideally check admin role, but relying on requireAuth for now
roomRouter.post("/add", requireAuth(), addRoom);
roomRouter.get("/all", getAllRooms); // Public or admin? Usually admin, but we keep it open for booking
roomRouter.delete("/:roomId", requireAuth(), deleteRoom);
roomRouter.put("/:roomId", requireAuth(), updateRoom);

export default roomRouter;
