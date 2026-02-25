import express from "express";
import {
  getMenu,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getCategories,
} from "../Controller/menuController.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getMenu);
router.get("/categories", getCategories);

router.post("/", authenticateToken, requireRole(["ADMIN"]), createMenuItem);
router.patch("/:id", authenticateToken, requireRole(["ADMIN"]), updateMenuItem);
router.delete("/:id", authenticateToken, requireRole(["ADMIN"]), deleteMenuItem);

export default router;
