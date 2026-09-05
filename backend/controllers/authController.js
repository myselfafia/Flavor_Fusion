import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import User from "../models/User.js";

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, createdAt: user.createdAt };
}

function createToken(user) {
  return jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function sendValidationError(req, res) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return false;
  res.status(400).json({ success: false, message: errors.array()[0].msg });
  return true;
}

export async function register(req, res, next) {
  try {
    if (sendValidationError(req, res)) return;
    const { name, email, password } = req.body;
    const normalizedEmail = email.toLowerCase();
    if (await User.exists({ email: normalizedEmail })) {
      return res.status(409).json({ success: false, message: "An account with that email already exists." });
    }
    const user = await User.create({ name, email: normalizedEmail, password: await bcrypt.hash(password, 12) });
    return res.status(201).json({ success: true, token: createToken(user), user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    if (sendValidationError(req, res)) return;
    const user = await User.findOne({ email: req.body.email.toLowerCase() }).select("+password");
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
      return res.status(401).json({ success: false, message: "Email or password is incorrect." });
    }
    return res.json({ success: true, token: createToken(user), user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
}

export function me(req, res) {
  res.json({ success: true, user: publicUser(req.user) });
}
