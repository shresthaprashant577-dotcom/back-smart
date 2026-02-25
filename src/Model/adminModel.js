import bcrypt from "bcryptjs";
import { User } from "./userModel.js";
 
export const createAdminIfNotExists = async () => {
  try {
    const adminEmail = "admin@gmail.com";
 
    // Find admin
    const admin = await User.findOne({ where: { email: adminEmail } });
 
    if (admin) {
      // Update role if needed
      if (admin.role !== "ADMIN") {
        admin.role = "ADMIN";
        await admin.save();
      } else {
      }
      return;
    }
    // Create admin if not exists
    await User.create({
      firstName: "Admin",
      lastName: "User",
      email: adminEmail,
      phone: "0000000000",
      address: "Admin",
      favoriteFood: "N/A",
      howDidYouFindUs: "ADMIN_SEED",
      password: await bcrypt.hash("Admin123%", 10),
      role: "ADMIN",
    });
 
    console.log("Admin created successfully");
  } catch (err) {
    console.error("Failed to create admin:", err);
  }
};
 
