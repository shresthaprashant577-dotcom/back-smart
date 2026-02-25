import { User } from "../Model/userModel.js";
import bcrypt from "bcryptjs";
import { Op } from "sequelize";
import { Order } from "../Model/orderModel.js";

const STAFF_ROLES = ["ACCOUNTANT", "WAITER"];
 
// Get all users
export const getAll = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).send({
      data: users,
      message: "Users retrieved successfully",
    });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
};

// Get customers only
export const getCustomers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { role: "CUSTOMER" },
      include: [{ model: Order }],
      order: [["createdAt", "DESC"]],
    });
    const data = users.map((u) => {
      const orders = u.Orders || [];
      const totalOrders = orders.length;
      const totalSpent = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
      const lastOrder = orders[0]?.createdAt || null;
      return {
        ...u.toJSON(),
        totalOrders,
        totalSpent,
        lastOrder,
      };
    });
    res.status(200).send({ data, message: "Customers retrieved successfully" });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
};

// Get staff only
export const getStaff = async (req, res) => {
  try {
    const users = await User.findAll({ where: { role: { [Op.in]: STAFF_ROLES } } });
    res.status(200).send({
      data: users,
      message: "Staff retrieved successfully",
    });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
};

// Create staff (admin only)
export const createStaff = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      password,
      role,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !address ||
      !password ||
      !role
    ) {
      return res.status(400).send({ message: "All fields are required" });
    }

    if (!STAFF_ROLES.includes(role)) {
      return res.status(400).send({ message: "Invalid staff role" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).send({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      address,
      favoriteFood: "N/A",
      howDidYouFindUs: "ADMIN_CREATED",
      password: hashedPassword,
      role,
    });

    res.status(201).send({
      data: user,
      message: "Staff user created successfully",
    });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
};

// Register / Save user
export const save = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      password,
      role,
      favoriteFood,
      howDidYouFindUs,
    } = req.body;
 
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !address ||
      !password ||
      !favoriteFood ||
      !howDidYouFindUs
    ) {
      return res.status(400).send({ message: "All fields are required" });
    }
 
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).send({ message: "Email already registered" });
    }
 
    const hashedPassword = await bcrypt.hash(password, 10);
 
    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      address,
      favoriteFood,
      howDidYouFindUs,
      password: hashedPassword,
      role: role || "CUSTOMER",
    });
 
    res.status(201).send({
      data: user,
      message: "User registered successfully",
    });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
};
 
// Get user by ID
export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ where: { id } });
 
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
 
    res.status(200).send({ data: user, message: "User fetched successfully" });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
};
 
// Update user by ID
export const updateById = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      password,
      favoriteFood,
      howDidYouFindUs,
      city,
      postalCode,
      subscribeNotifications,
      preferredLanguage,
      paymentPreference,
    } = req.body;
 
    const user = await User.findOne({ where: { id } });
    if (!user) return res.status(404).send({ message: "User not found" });
 
    user.firstName = firstName ?? user.firstName;
    user.lastName = lastName ?? user.lastName;
    user.email = email ?? user.email;
    user.phone = phone ?? user.phone;
    user.address = address ?? user.address;
    user.favoriteFood = favoriteFood ?? user.favoriteFood;
    user.howDidYouFindUs = howDidYouFindUs ?? user.howDidYouFindUs;
    user.city = city ?? user.city;
    user.postalCode = postalCode ?? user.postalCode;
    if (subscribeNotifications !== undefined) {
      user.subscribeNotifications = subscribeNotifications;
    }
    user.preferredLanguage = preferredLanguage ?? user.preferredLanguage;
    user.paymentPreference = paymentPreference ?? user.paymentPreference;
    if (password) user.password = await bcrypt.hash(password, 10);
 
    await user.save();
 
    res.status(200).send({ data: user, message: "User updated successfully" });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
};
 
// Delete user by ID
export const deleteById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ where: { id } });
 
    if (!user) return res.status(404).send({ message: "User not found" });
 
    await user.destroy();
 
    res.status(200).send({ message: "User deleted successfully" });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
};
 
// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).send({ message: "Email and password required" });
 
    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(401).send({ message: "Invalid email or password" });
 
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch)
      return res.status(401).send({ message: "Invalid email or password" });
 
    // Normally here you would create a JWT token
    res.status(200).send({
      message: "Login successful",
      data: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email },
    });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
};
