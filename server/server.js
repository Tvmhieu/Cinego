import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";
import showRouter from "./routes/showRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import userRouter from "./routes/userRoutes.js";
import { vnpayReturn, vnpayIPN } from "./controllers/vnpayController.js";

const app = express();
const port = process.env.PORT || 3000;

await connectDB();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      process.env.CLIENT_URL || "https://cinego.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);
app.use(clerkMiddleware());

// API Routes
app.get("/", (req, res) => res.send("CineGo Server is Live!"));
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/show", showRouter);
app.use("/api/booking", bookingRouter);
app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);

// VNPay Routes (no auth needed - VNPay calls these)
app.get("/api/vnpay/return", vnpayReturn);
app.get("/api/vnpay/ipn", vnpayIPN);

app.listen(port, () =>
  console.log(`server listening at http://localhost:${port}`),
);

