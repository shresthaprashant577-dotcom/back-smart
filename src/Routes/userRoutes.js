import express from "express";
import {
  getAll,
  getCustomers,
  getStaff,
  save,
  getById,
  updateById,
  deleteById,
  createStaff,
} from "../Controller/userController.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";
 
export const userRouter = express.Router();
 
userRouter.get("/", authenticateToken, requireRole(["ADMIN"]), getAll);
userRouter.get("/customers", authenticateToken, requireRole(["ADMIN"]), getCustomers);
userRouter.get("/staff", authenticateToken, requireRole(["ADMIN"]), getStaff);
userRouter.post("/staff", authenticateToken, requireRole(["ADMIN"]), createStaff);
userRouter.post("/", save);
userRouter.get("/:id", getById);
userRouter.patch("/:id", updateById);
userRouter.delete("/:id", deleteById);
 
export default userRouter;
