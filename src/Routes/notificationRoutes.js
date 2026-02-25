import express from "express";
import { authenticateToken, requireRole } from "../middleware/auth.js";
import { getMyNotifications, markAsRead, createNotification } from "../Controller/notificationController.js";

const router = express.Router();

router.get("/", authenticateToken, getMyNotifications);
router.patch("/:id/read", authenticateToken, markAsRead);
router.post("/", authenticateToken, requireRole(["ADMIN"]), createNotification);

export default router;
