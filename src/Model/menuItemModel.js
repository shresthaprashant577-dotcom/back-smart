import { DataTypes } from "sequelize";
import { sequelize } from "../Database/db.js";
import { Category } from "./categoryModel.js";

export const MenuItem = sequelize.define(
  "MenuItem",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    isAvailable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "menu_items",
    timestamps: true,
  }
);

Category.hasMany(MenuItem, { foreignKey: "categoryId" });
MenuItem.belongsTo(Category, { foreignKey: "categoryId" });
