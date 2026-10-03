import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { comparePassword, hashPassword } from "../utils/helpers.js";

const isProduction = process.env.NODE_ENV === "production";

const ACCESS_TOKEN_LIFETIME = "15m";
const REFRESH_TOKEN_LIFETIME = "7d";

const getRefreshSecret = () => {
  return (
    process.env.JWT_REFRESH_SECRET ||
    (process.env.JWT_SECRET
      ? `${process.env.JWT_SECRET}_refresh`
      : "flavor_fusion_refresh_secret")
  );
};

const refreshCookieOptions = {
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
};

const clearRefreshCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
};

export const sanitizeUser = (user) => {
  if (!user) return null;
  const userObj =
    typeof user.toObject === "function" ? user.toObject() : { ...user };
  delete userObj.password;
  delete userObj.refreshToken;
  delete userObj.__v;
  return userObj;
};

const generateTokens = (user) => {
  const payload = {
    id: user._id.toString(),
    userId: user._id.toString(),
    email: user.email,
    name: user.name || user.displayName || user.username || "Chef",
  };

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is missing.");
  }

  const accessToken = jwt.sign(payload, secret, {
    expiresIn: ACCESS_TOKEN_LIFETIME,
  });

  const refreshToken = jwt.sign(
    { id: user._id.toString() },
    getRefreshSecret(),
    {
      expiresIn: REFRESH_TOKEN_LIFETIME,
    },
  );

  return { accessToken, refreshToken };
};

export const register = async (req, res) => {
  try {
    const { name, displayName, email, username, password } = req.body;
    const rawIdentifier = email || username;
    const rawName = name || displayName || username || "Chef";

    if (!rawIdentifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
        error: "Missing Credentials",
      });
    }

    const trimmedEmail = String(rawIdentifier).trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
        error: "Invalid Email",
      });
    }

    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
        error: "Weak Password",
      });
    }

    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
        error: "User Exists",
      });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = new User({
      name: String(rawName).trim(),
      displayName: String(rawName).trim(),
      email: trimmedEmail,
      username: username ? String(username).trim() : trimmedEmail.split("@")[0],
      password: hashedPassword,
    });

    const { accessToken, refreshToken } = generateTokens(newUser);
    newUser.refreshToken = refreshToken;
    const savedUser = await newUser.save();

    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

    const safeUser = sanitizeUser(savedUser);
    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      accessToken,
      token: accessToken,
      user: safeUser,
      data: {
        accessToken,
        user: safeUser,
      },
      ...safeUser,
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to create account.",
      error: "Internal Server Error",
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
        message: "Email and password are required.",
        error: "Missing Credentials",
      });
    }

    const cleanIdentifier = String(identifier).trim().toLowerCase();
    const user = await User.findOne({
      $or: [
        { email: cleanIdentifier },
        { username: String(identifier).trim() },
      ],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
        error: "Invalid Credentials",
      });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
        error: "Invalid Credentials",
      });
    }

    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

    const safeUser = sanitizeUser(user);
    return res.status(200).json({
      success: true,
      message: "Logged in successfully.",
      accessToken,
      token: accessToken,
      user: safeUser,
      data: {
        accessToken,
        user: safeUser,
      },
      ...safeUser,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to log in.",
      error: "Internal Server Error",
    });
  }
};

export const refresh = async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies?.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
      return res.status(401).json({
        success: false,
        message: "No refresh token provided.",
        error: "Unauthorized",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(incomingRefreshToken, getRefreshSecret());
    } catch (err) {
      console.warn("Refresh token verify failed:", err.message);
      res.clearCookie("refreshToken", clearRefreshCookieOptions);
      return res.status(401).json({
        success: false,
        message: "Refresh token is invalid or expired. Please log in again.",
        error: "Unauthorized",
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      res.clearCookie("refreshToken", clearRefreshCookieOptions);
      return res.status(401).json({
        success: false,
        message: "User session not found.",
        error: "Unauthorized",
      });
    }

    // Refresh token rotation check
    if (user.refreshToken !== incomingRefreshToken) {
      console.warn(
        `Refresh token reuse or mismatch detected for user ${user._id}. Revoking tokens.`,
      );
      user.refreshToken = null;
      await user.save();
      res.clearCookie("refreshToken", clearRefreshCookieOptions);
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token. Please log in again.",
        error: "Unauthorized",
      });
    }

    // Issue rotated tokens
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      generateTokens(user);
    user.refreshToken = newRefreshToken;
    await user.save();

    res.cookie("refreshToken", newRefreshToken, refreshCookieOptions);

    const safeUser = sanitizeUser(user);
    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully.",
      accessToken: newAccessToken,
      token: newAccessToken,
      user: safeUser,
      data: {
        accessToken: newAccessToken,
        user: safeUser,
      },
      ...safeUser,
    });
  } catch (err) {
    console.error("Refresh endpoint error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to refresh token.",
      error: "Internal Server Error",
    });
  }
};

export const logout = async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies?.refreshToken || req.body?.refreshToken;

    if (incomingRefreshToken) {
      try {
        const decoded = jwt.verify(incomingRefreshToken, getRefreshSecret());
        if (decoded?.id) {
          await User.findByIdAndUpdate(decoded.id, { refreshToken: null });
        }
      } catch (err) {
        console.warn("Notice: Logout token decode failed:", err.message);
      }
    }

    res.clearCookie("refreshToken", clearRefreshCookieOptions);
    res.clearCookie("token", clearRefreshCookieOptions);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to log out.",
      error: "Internal Server Error",
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated.",
        error: "Unauthorized",
      });
    }

    const user = await User.findById(userId).select(
      "-password -refreshToken -__v",
    );
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
        error: "Not Found",
      });
    }

    const safeUser = sanitizeUser(user);
    return res.status(200).json({
      success: true,
      message: "User profile fetched successfully.",
      user: safeUser,
      data: safeUser,
      ...safeUser,
    });
  } catch (err) {
    console.error("Get profile error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Could not fetch user profile.",
      error: "Internal Server Error",
    });
  }
};

export const refreshToken = refresh;
