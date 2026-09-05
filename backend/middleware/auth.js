import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token || !req.headers.authorization?.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Authentication required." });
  }

  try {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(userId);
    if (!user) return res.status(401).json({ success: false, message: "User no longer exists." });
    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ success: false, message: "Your session is invalid or expired." });
  }
}
