import Notification from "../models/Notification.js";

export async function notifyUser(userId, { title, message, type = "system", link }) {
  if (!userId) return null;
  try {
    return await Notification.create({ user: userId, title, message, type, link });
  } catch (e) {
    console.error("notifyUser failed:", e.message);
    return null;
  }
}
