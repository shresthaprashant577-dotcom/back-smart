import { User } from "../Model/userModel.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../security/jwt-utils.js";
 
/**
 * REGISTER (Normal users only)
 */
export const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      password,
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
 
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(409).send({ message: "Email already in use" });
    }
 
    const hashedPassword = await bcrypt.hash(password, 10);
 
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      phone,
      address,
      favoriteFood,
      howDidYouFindUs,
      password: hashedPassword,
      role: "CUSTOMER",
    });
 
    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });
 
    const { password: pw, ...userData } = newUser.toJSON();
 
    res.status(201).send({
      message: "User registered successfully",
      user: userData,
      role: newUser.role,
      token,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
 
/**
 * LOGIN (Admin & User)
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
 
    if (!email || !password) {
      return res.status(400).send({
        message: "Email and password are required",
      });
    }
 
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
 
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send({ message: "Password is incorrect" });
    }
 
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });
 
    const { password: pw, ...userData } = user.toJSON();
 
    res.status(200).send({
      message: "Login successful",
      user: userData,
      role: user.role,
      token,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
 
