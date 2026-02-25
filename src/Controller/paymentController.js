import { Payment } from "../Model/paymentModel.js";
import { Order } from "../Model/orderModel.js";

const ALLOWED_METHODS = ["COD", "KHALTI", "ESEWA"];

export const initiatePayment = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { orderId, method, reference } = req.body;

    if (!userId) return res.status(401).send({ message: "Unauthorized" });
    if (!orderId || !method) {
      return res.status(400).send({ message: "Order ID and method are required" });
    }
    if (!ALLOWED_METHODS.includes(method)) {
      return res.status(400).send({ message: "Invalid payment method" });
    }

    const order = await Order.findOne({ where: { id: orderId, userId } });
    if (!order) return res.status(404).send({ message: "Order not found" });

    const payment = await Payment.create({
      orderId: order.id,
      method,
      status: method === "COD" ? "PENDING" : "PENDING",
      reference: reference || null,
      amount: order.totalAmount,
    });

    if (method === "COD") {
      order.paymentStatus = "COD";
      await order.save();
    }

    res.status(201).send({ data: payment, message: "Payment initiated" });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
};

// Temporary confirm endpoint (simulate gateway verification)
export const confirmPayment = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { paymentId, status, reference } = req.body;

    if (!userId) return res.status(401).send({ message: "Unauthorized" });
    if (!paymentId || !status) {
      return res.status(400).send({ message: "Payment ID and status are required" });
    }

    const payment = await Payment.findByPk(paymentId, { include: [Order] });
    if (!payment || payment.Order?.userId !== userId) {
      return res.status(404).send({ message: "Payment not found" });
    }

    payment.status = status;
    payment.reference = reference || payment.reference;
    await payment.save();

    if (status === "SUCCESS") {
      payment.Order.paymentStatus = "PAID";
      await payment.Order.save();
    }

    res.status(200).send({ data: payment, message: "Payment updated" });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
};
