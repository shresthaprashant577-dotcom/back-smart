import { Notification } from "../Model/notificationModel.js";
import { emitNotification } from "../socket.js";

export const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).send({ message: "Unauthorized" });
    const notifications = await Notification.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });
    res.status(200).send({ data: notifications });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) return res.status(401).send({ message: "Unauthorized" });

    const notification = await Notification.findOne({ where: { id, userId } });
    if (!notification) return res.status(404).send({ message: "Not found" });

    notification.read = true;
    await notification.save();
    res.status(200).send({ data: notification });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
};

export const createNotification = async (req, res) => {
  try {
    const { userId, title, message, type, link } = req.body;
    if (!userId || !title || !message) {
      return res.status(400).send({ message: "Missing fields" });
    }
    const notification = await Notification.create({
      userId,
      title,
      message,
      type: type || "Announcements",
      link: link || null,
    });
    emitNotification(userId, notification.toJSON());
    res.status(201).send({ data: notification });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
};
