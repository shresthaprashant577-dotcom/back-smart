import { Op } from "sequelize";
import { Order } from "../Model/orderModel.js";
import { OrderItem } from "../Model/orderItemModel.js";
import { MenuItem } from "../Model/menuItemModel.js";
import { User } from "../Model/userModel.js";

export const getAllOrders = async (req, res) => {
  try {
    const { status, search, sort = "date" } = req.query;
    const where = {};

    if (status && status !== "All") {
      where.status = status.toUpperCase();
    }

    if (search) {
      where.id = { [Op.eq]: Number(search) || -1 };
    }

    const orderBy =
      sort === "total"
        ? [["totalAmount", "DESC"]]
        : sort === "status"
        ? [["status", "ASC"]]
        : [["createdAt", "DESC"]];

    const orders = await Order.findAll({
      where,
      include: [
        { model: User },
        { model: OrderItem, include: [MenuItem] },
      ],
      order: orderBy,
    });

    res.status(200).send({ data: orders });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
};

export const getOrderByIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id, {
      include: [
        { model: User },
        { model: OrderItem, include: [MenuItem] },
      ],
    });
    if (!order) return res.status(404).send({ message: "Order not found" });
    res.status(200).send({ data: order });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
};
