import { Op, QueryTypes } from "sequelize";
import { sequelize } from "../Database/db.js";
import { Order } from "../Model/orderModel.js";

const RANGE_MAP = {
  "7d": 7,
  "30d": 30,
};

const getRangeStart = (range) => {
  const days = RANGE_MAP[range] || 7;
  const start = new Date();
  start.setDate(start.getDate() - days);
  return start;
};

export const getDashboardStats = async (req, res) => {
  try {
    const range = req.query.range || "7d";
    const startDate = getRangeStart(range);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayOrders = await Order.count({
      where: { createdAt: { [Op.gte]: todayStart } },
    });

    const revenue = await Order.sum("totalAmount", {
      where: { status: "COMPLETED", createdAt: { [Op.gte]: startDate } },
    });

    const completedCount = await Order.count({
      where: { status: "COMPLETED", createdAt: { [Op.gte]: startDate } },
    });
    const totalCount = await Order.count({
      where: { createdAt: { [Op.gte]: startDate } },
    });

    const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const avgPrepMs = await Order.findAll({
      attributes: [
        [sequelize.fn("AVG", sequelize.literal("EXTRACT(EPOCH FROM (\"updatedAt\" - \"createdAt\"))")), "avgSeconds"],
      ],
      where: { status: "COMPLETED", createdAt: { [Op.gte]: startDate } },
      raw: true,
    });
    const avgSeconds = Number(avgPrepMs?.[0]?.avgSeconds || 0);
    const avgPrepMinutes = Math.round(avgSeconds / 60);

    const revenueOverTime = await sequelize.query(
      `
      SELECT DATE("createdAt") as day, SUM("totalAmount") as revenue
      FROM orders
      WHERE "createdAt" >= :start AND status = 'COMPLETED'
      GROUP BY day
      ORDER BY day ASC
      `,
      { replacements: { start: startDate }, type: QueryTypes.SELECT }
    );

    const busiestHours = await sequelize.query(
      `
      SELECT EXTRACT(HOUR FROM "createdAt") as hour, COUNT(*) as orders
      FROM orders
      WHERE "createdAt" >= :start
      GROUP BY hour
      ORDER BY hour ASC
      `,
      { replacements: { start: startDate }, type: QueryTypes.SELECT }
    );

    const topItems = await sequelize.query(
      `
      SELECT mi.name as name, SUM(oi.quantity) as qty, SUM(oi.totalPrice) as revenue
      FROM order_items oi
      JOIN menu_items mi ON mi.id = oi."menuItemId"
      JOIN orders o ON o.id = oi."orderId"
      WHERE o."createdAt" >= :start
      GROUP BY mi.name
      ORDER BY qty DESC
      LIMIT 5
      `,
      { replacements: { start: startDate }, type: QueryTypes.SELECT }
    );

    res.status(200).send({
      data: {
        todayOrders,
        revenue: Number(revenue || 0),
        completionRate,
        avgPrepMinutes,
        revenueOverTime,
        busiestHours,
        topItems,
      },
    });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
};
