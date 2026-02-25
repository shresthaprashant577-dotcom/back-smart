import express from "express";
import { authenticateToken, requireRole } from "../middleware/auth.js";
import { getAllOrders, getOrderByIdAdmin } from "../Controller/adminOrdersController.js";

const router = express.Router();

router.get("/orders", authenticateToken, requireRole(["ADMIN", "CASHIER", "KITCHEN"]), getAllOrders);
router.get("/orders/:id", authenticateToken, requireRole(["ADMIN", "CASHIER", "KITCHEN"]), getOrderByIdAdmin);

export default router;
