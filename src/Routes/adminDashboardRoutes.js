import express from "express";
import { authenticateToken, requireRole } from "../middleware/auth.js";
import { getDashboardStats } from "../Controller/adminDashboardController.js";

const router = express.Router();

router.get("/dashboard", authenticateToken, requireRole(["ADMIN"]), getDashboardStats);

export default router;
