import crypto from "crypto";
import { sequelize } from "../Database/db.js";
import { Order } from "../Model/orderModel.js";
import { OrderItem } from "../Model/orderItemModel.js";
import { MenuItem } from "../Model/menuItemModel.js";
import { OrderStatusHistory } from "../Model/orderStatusHistoryModel.js";
import { User } from "../Model/userModel.js";
import { Notification } from "../Model/notificationModel.js";
import { emitNotification } from "../socket.js";

const ORDER_STATUSES = new Set([
  "ORDER_RECEIVED",
  "PREPARING",
  "READY",
  "COMPLETED",
  "CANCELLED",
]);

const buildQrToken = () => {
  return `BB-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
};

const buildOtp = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

export const createOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userId = req.user?.id;
    const { items, orderType, tableNo, deliveryAddress, specialInstructions } = req.body;

    if (!userId) {
      await t.rollback();
      return res.status(401).send({ message: "Unauthorized" });
    }

    if (!Array.isArray(items) || items.length === 0) {
      await t.rollback();
      return res.status(400).send({ message: "Order items are required" });
    }

    if (!orderType || !["dinein", "delivery", "pickup"].includes(orderType)) {
      await t.rollback();
      return res.status(400).send({ message: "Invalid order type" });
    }

    if (orderType === "dinein" && !tableNo) {
      await t.rollback();
      return res.status(400).send({ message: "Table number required for dine-in" });
    }

    if (orderType === "delivery" && !deliveryAddress) {
      await t.rollback();
      return res.status(400).send({ message: "Delivery address required" });
    }

    const menuIds = items.map((i) => i.menuItemId);
    const menuItems = await MenuItem.findAll({ where: { id: menuIds } });

    if (menuItems.length !== menuIds.length) {
      await t.rollback();
      return res.status(400).send({ message: "One or more menu items not found" });
    }

    let totalAmount = 0;
    const orderItemsPayload = items.map((item) => {
      const menuItem = menuItems.find((m) => m.id === item.menuItemId);
      const qty = Number(item.quantity || 0);
      if (!menuItem || qty <= 0) return null;
      const unitPrice = Number(menuItem.price);
      const totalPrice = unitPrice * qty;
      totalAmount += totalPrice;
      return {
        menuItemId: menuItem.id,
        quantity: qty,
        unitPrice,
        totalPrice,
      };
    });

    if (orderItemsPayload.some((i) => i === null)) {
      await t.rollback();
      return res.status(400).send({ message: "Invalid item quantity" });
    }

    const order = await Order.create(
      {
        userId,
        orderType,
        tableNo: tableNo || null,
        deliveryAddress: deliveryAddress || null,
        specialInstructions: specialInstructions || null,
        totalAmount,
        status: "ORDER_RECEIVED",
        qrToken: buildQrToken(),
        qrExpiryTime: new Date(Date.now() + 30 * 60 * 1000),
        otpCode: buildOtp(),
      },
      { transaction: t }
    );

    const orderItems = orderItemsPayload.map((item) => ({
      ...item,
      orderId: order.id,
    }));

    await OrderItem.bulkCreate(orderItems, { transaction: t });
    await OrderStatusHistory.create(
      { orderId: order.id, status: "ORDER_RECEIVED" },
      { transaction: t }
    );

    await t.commit();
    const notify = await Notification.create({
      userId,
      title: `Order #${order.id} received`,
      message: "Your order has been received and is being prepared.",
      type: "Orders",
      link: `/dashboard/order/${order.id}`,
    });
    emitNotification(userId, notify.toJSON());

    res.status(201).send({ data: order, message: "Order created" });
  } catch (e) {
    await t.rollback();
    res.status(500).send({ message: e.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).send({ message: "Unauthorized" });

    const orders = await Order.findAll({
      where: { userId },
      include: [{ model: OrderItem, include: [MenuItem] }],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).send({ data: orders });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) return res.status(401).send({ message: "Unauthorized" });

    const order = await Order.findOne({
      where: { id, userId },
      include: [
        { model: OrderItem, include: [MenuItem] },
        { model: OrderStatusHistory },
        { model: User },
      ],
    });

    if (!order) return res.status(404).send({ message: "Order not found" });
    res.status(200).send({ data: order });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) return res.status(400).send({ message: "Status required" });
    if (!ORDER_STATUSES.has(status)) {
      return res.status(400).send({ message: "Invalid status" });
    }

    const order = await Order.findByPk(id);
    if (!order) return res.status(404).send({ message: "Order not found" });

    order.status = status;
    await order.save();

    await OrderStatusHistory.create({ orderId: order.id, status });

    if (order.userId) {
      const notify = await Notification.create({
        userId: order.userId,
        title: `Order #${order.id} ${status.replaceAll("_", " ").toLowerCase()}`,
        message: `Your order status is now ${status.replaceAll("_", " ").toLowerCase()}.`,
        type: "Orders",
        link: `/dashboard/order/${order.id}`,
      });
      emitNotification(order.userId, notify.toJSON());
    }

    res.status(200).send({ data: order, message: "Status updated" });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
};

export const markArrivingSoon = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { minutes } = req.body;

    if (!userId) return res.status(401).send({ message: "Unauthorized" });

    const order = await Order.findOne({ where: { id, userId } });
    if (!order) return res.status(404).send({ message: "Order not found" });

    order.comingNotificationSent = true;
    order.expectedArrivalMinutes = minutes || 10;
    await order.save();

    res.status(200).send({ data: order, message: "Marked as arriving soon" });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
};
