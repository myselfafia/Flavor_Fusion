import User from "../models/User.js";
import { comparePassword, hashPassword } from "../utils/helpers.js";
import jwt from "jsonwebtoken";

const lifetime = "3600000"; // 1 hour

const cookieOptions = {
  maxAge: 3600000,
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: "/",
};

export const register = async (req, res) => {
  try {
    const { name, displayName, email, username, password } = req.body;
    const userIdentifier = email || username;
    const userName = name || displayName || username;

    if (!userIdentifier || !password) {
      return res.status(400).json({ error: "All fields are required", message: "All fields are required" });
    }

    const existingUser = await User.findOne({
      $or: [{ email: userIdentifier.toLowerCase() }, { username: userIdentifier }],
    });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists", message: "User already exists" });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = new User({
      name: userName,
      displayName: userName,
      email: email ? email.toLowerCase() : userIdentifier.toLowerCase(),
      username: username || userIdentifier,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    const token = jwt.sign(
      {
        id: savedUser._id,
        username: savedUser.username || savedUser.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: lifetime }
    );

    res.cookie("token", token, cookieOptions);

    const userObj = savedUser.toObject();
    return res.status(201).json({
      ...userObj,
      message: "New user added successfully",
      token,
      user: userObj,
    });
  } catch (err) {
    return res.status(400).json({ error: err.message, message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const identifier = req.body.username || req.body.email;
    const { password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: "Please provide credentials", message: "Please provide credentials" });
    }

    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier.toLowerCase() }],
    }).select("-__v");

    if (!user) {
      return res.status(404).json({ error: "User not found", message: "User not found" });
    }

    const isSame = await comparePassword(password, user.password);
    if (!isSame) {
      return res.status(400).json({ error: "Wrong password", message: "Wrong password" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username || user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: lifetime }
    );

    res.cookie("token", token, cookieOptions);

    const userObj = user.toObject();
    return res.status(200).json({
      ...userObj,
      token,
      user: userObj,
    });
  } catch (err) {
    return res.status(400).json({ error: err.message, message: err.message });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });
  return res.status(200).json({ message: "Logout successful" });
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const user = await User.findById(userId).select("-password -__v");
    if (!user) {
      return res.status(404).json({ error: "User not found", message: "User not found" });
    }
    const userObj = user.toObject();
    return res.status(200).json({ ...userObj, user: userObj });
  } catch (err) {
    return res.status(400).json({ error: err.message, message: err.message });
  }
};
