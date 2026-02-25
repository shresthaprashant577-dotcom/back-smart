import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { connection } from "./src/Database/db.js";
import authRouter from "./src/Routes/authRoutes.js"; 
import userRouter from "./src/Routes/userRoutes.js";
import menuRouter from "./src/Routes/menuRoutes.js";
import orderRouter from "./src/Routes/orderRoutes.js";
import paymentRouter from "./src/Routes/paymentRoutes.js";
import notificationRouter from "./src/Routes/notificationRoutes.js";
import adminDashboardRouter from "./src/Routes/adminDashboardRoutes.js";
import adminOrdersRouter from "./src/Routes/adminOrdersRoutes.js";
import uploadRouter from "./src/Routes/uploadRoutes.js";
import path from "path"; 
import "./src/Model/userModel.js";
import "./src/Model/categoryModel.js";
import "./src/Model/menuItemModel.js";
import "./src/Model/orderModel.js";
import "./src/Model/orderItemModel.js";
import "./src/Model/paymentModel.js";
import "./src/Model/orderStatusHistoryModel.js";
import "./src/Model/notificationModel.js";
import { createAdminIfNotExists } from "./src/Model/adminModel.js";
import { sequelize } from "./src/Database/db.js";
import { initSocket } from "./src/socket.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true,
  },
});
initSocket(io);

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PATCH","PUT", "DELETE"],
  credentials: true,
}));

// parse JSON bodies
app.use(express.json());

app.use("/uploads/materials", express.static(path.join("./uploads/materials")));
app.use("/uploads/profiles", express.static(path.join("./uploads/profiles")));
app.use("/uploads/menu", express.static(path.join("./uploads/menu")));


// DB connection
// Routes
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/menu", menuRouter);
app.use("/api/orders", orderRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/admin", adminDashboardRouter);
app.use("/api/admin", adminOrdersRouter);
app.use("/api/uploads", uploadRouter);

// Landing page
app.get("/", (req, res) => res.send("User API is running"));

connection()
  .then(async () => {
    await sequelize.sync({ alter: true });
    await createAdminIfNotExists();
    server.listen(5000, () => console.log("Server running on port 5000"));
  })
  .catch((err) => console.error("DB connection failed:", err));
