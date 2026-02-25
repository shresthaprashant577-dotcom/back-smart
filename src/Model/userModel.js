import { DataTypes } from "sequelize";
import { sequelize } from "../Database/db.js"; // your Sequelize instance
 
export const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "",
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "",
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    postalCode: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    favoriteFood: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "N/A",
    },
    howDidYouFindUs: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "N/A",
    },
    subscribeNotifications: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    preferredLanguage: {
      type: DataTypes.STRING(40),
      allowNull: false,
      defaultValue: "English",
    },
    paymentPreference: {
      type: DataTypes.STRING(40),
      allowNull: false,
      defaultValue: "Cash",
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "CUSTOMER",
    },
  },
  {
    tableName: "users",
    timestamps: true,
  }
);
