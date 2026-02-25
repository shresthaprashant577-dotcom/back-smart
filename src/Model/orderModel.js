import { DataTypes } from "sequelize";
import { sequelize } from "../Database/db.js";
import { User } from "./userModel.js";

export const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    orderType: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: "ORDER_RECEIVED",
    },
    paymentStatus: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "UNPAID",
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    qrToken: {
      type: DataTypes.STRING(40),
      allowNull: false,
      unique: true,
    },
    qrExpiryTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    otpCode: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    isQrUsed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    comingNotificationSent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    expectedArrivalMinutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    tableNo: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    deliveryAddress: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    specialInstructions: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: "orders",
    timestamps: true,
  }
);

User.hasMany(Order, { foreignKey: "userId" });
Order.belongsTo(User, { foreignKey: "userId" });
