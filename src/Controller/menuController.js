import { Op } from "sequelize";
import { MenuItem } from "../Model/menuItemModel.js";
import { Category } from "../Model/categoryModel.js";

export const getMenu = async (req, res) => {
  try {
    const { category, search } = req.query;
    const where = { isAvailable: true };

    if (category) {
      where.category = category;
    }
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const items = await MenuItem.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });

    res.status(200).send({ data: items });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
};

export const createMenuItem = async (req, res) => {
  try {
    const { name, description, price, imageUrl, category, categoryId } = req.body;

    if (!name || !description || !price || !category) {
      return res.status(400).send({ message: "All fields are required" });
    }

    const item = await MenuItem.create({
      name,
      description,
      price,
      imageUrl: imageUrl || null,
      category,
      categoryId: categoryId || null,
      isAvailable: true,
    });

    res.status(201).send({ data: item, message: "Menu item created" });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
};

export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await MenuItem.findByPk(id);
    if (!item) return res.status(404).send({ message: "Menu item not found" });

    const { name, description, price, imageUrl, category, isAvailable } = req.body;
    item.name = name ?? item.name;
    item.description = description ?? item.description;
    item.price = price ?? item.price;
    item.imageUrl = imageUrl ?? item.imageUrl;
    item.category = category ?? item.category;
    if (typeof isAvailable === "boolean") item.isAvailable = isAvailable;

    await item.save();
    res.status(200).send({ data: item, message: "Menu item updated" });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
};

export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await MenuItem.findByPk(id);
    if (!item) return res.status(404).send({ message: "Menu item not found" });

    await item.destroy();
    res.status(200).send({ message: "Menu item deleted" });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({ where: { isActive: true } });
    res.status(200).send({ data: categories });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
};
