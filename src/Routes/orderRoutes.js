import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { createOrder, getMyOrders, getOrderById, markArrivingSoon, updateOrderStatus } from "../Controller/orderController.js";
import { requireRole } from "../middleware/auth.js";

const router = express.Router();

router.post("/", authenticateToken, createOrder);
router.get("/my", authenticateToken, getMyOrders);
router.get("/:id", authenticateToken, getOrderById);
router.post("/:id/arriving", authenticateToken, markArrivingSoon);
router.patch("/:id/status", authenticateToken, requireRole(["ADMIN", "KITCHEN", "CASHIER"]), updateOrderStatus);

export default router;
