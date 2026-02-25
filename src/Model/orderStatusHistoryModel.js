import { DataTypes } from "sequelize";
import { sequelize } from "../Database/db.js";
import { Order } from "./orderModel.js";

export const OrderStatusHistory = sequelize.define(
  "OrderStatusHistory",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    status: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    note: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: "order_status_history",
    timestamps: true,
  }
);

Order.hasMany(OrderStatusHistory, { foreignKey: "orderId" });
OrderStatusHistory.belongsTo(Order, { foreignKey: "orderId" });
