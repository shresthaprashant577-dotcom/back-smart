import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { initiatePayment, confirmPayment } from "../Controller/paymentController.js";

const router = express.Router();

router.post("/initiate", authenticateToken, initiatePayment);
router.post("/confirm", authenticateToken, confirmPayment);

export default router;
