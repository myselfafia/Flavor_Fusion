import User from "../models/User.js";
import { comparePassword, hashPassword } from "../utils/helpers.js";
import jwt from "jsonwebtoken";

const isProduction = process.env.NODE_ENV === "production";

// 7-day token lifetime
const ACCESS_TOKEN_EXPIRES_IN = "7d";
const REFRESH_TOKEN_EXPIRES_IN = "30d";

const cookieOptions = {
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
};

const sanitizeUser = (userDoc) => {
  if (!userDoc) return null;
  const obj = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
  delete obj.password;
  delete obj.__v;
  return obj;
};

const generateTokens = (user) => {
  const payload = {
    id: user._id,
    userId: user._id,
    email: user.email,
    username: user.username || user.email,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });

  const refreshSecret =
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  const refreshToken = jwt.sign(payload, refreshSecret, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });

  return { token, refreshToken };
};

export const register = async (req, res) => {
  try {
    const { name, displayName, email, username, password } = req.body;
    const rawIdentifier = email || username;
    const rawName = name || displayName || username || "Chef";

    if (!rawIdentifier || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required.",
        message: "Email and password are required.",
      });
    }

    const trimmedEmail = rawIdentifier.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        error: "Please enter a valid email address.",
        message: "Please enter a valid email address.",
      });
    }

    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters long.",
        message: "Password must be at least 6 characters long.",
      });
    }

    const existingUser = await User.findOne({ email: trimmedEmail });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "An account with this email already exists.",
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = new User({
      name: rawName.trim(),
      displayName: rawName.trim(),
      email: trimmedEmail,
      username: username ? username.trim() : trimmedEmail.split("@")[0],
      password: hashedPassword,
    });

    const savedUser = await newUser.save();
    const { token, refreshToken } = generateTokens(savedUser);

    res.cookie("token", token, cookieOptions);

    const sanitized = sanitizeUser(savedUser);
    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      refreshToken,
      user: sanitized,
      ...sanitized,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message || "Failed to create account.",
      message: err.message || "Failed to create account.",
    });
  }
};

export const login = async (req, res) => {
  try {
    const identifier = req.body.email || req.body.username;
    const { password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide both email and password.",
        message: "Please provide both email and password.",
      });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    const user = await User.findOne({
      $or: [{ email: cleanIdentifier }, { username: identifier.trim() }],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password.",
        message: "Invalid email or password.",
      });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password.",
        message: "Invalid email or password.",
      });
    }

    const { token, refreshToken } = generateTokens(user);

    res.cookie("token", token, cookieOptions);

    const sanitized = sanitizeUser(user);
    return res.status(200).json({
      success: true,
      message: "Logged in successfully.",
      token,
      refreshToken,
      user: sanitized,
      ...sanitized,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message || "Failed to log in.",
      message: err.message || "Failed to log in.",
    });
  }
};

export const logout = (_req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  });
  return res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Not authenticated.",
        message: "Not authenticated.",
      });
    }

    const user = await User.findById(userId).select("-password -__v");
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found.",
        message: "User not found.",
      });
    }

    const sanitized = sanitizeUser(user);
    return res.status(200).json({
      success: true,
      user: sanitized,
      ...sanitized,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message || "Could not fetch profile.",
      message: err.message || "Could not fetch profile.",
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const token = req.body.refreshToken || req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Refresh token is missing.",
      });
    }

    const refreshSecret =
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

    jwt.verify(token, refreshSecret, async (err, decoded) => {
      if (err || !decoded) {
        return res.status(401).json({
          success: false,
          error: "Invalid or expired refresh token.",
        });
      }

      const user = await User.findById(decoded.id || decoded.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User no longer exists.",
        });
      }

      const tokens = generateTokens(user);
      res.cookie("token", tokens.token, cookieOptions);

      return res.status(200).json({
        success: true,
        token: tokens.token,
        refreshToken: tokens.refreshToken,
      });
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message || "Token refresh failed.",
    });
  }
};
