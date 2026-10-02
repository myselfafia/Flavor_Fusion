import User from "../models/User.js";
import { comparePassword, hashPassword } from "../utils/helpers.js";
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_LIFETIME = "15m";
const REFRESH_TOKEN_LIFETIME = "7d";

const refreshCookieOptions = {
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: "/",
};

const clearRefreshCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: "/",
};

const getRefreshSecret = () => {
  return (
    process.env.JWT_REFRESH_SECRET ||
    (process.env.JWT_SECRET
      ? process.env.JWT_SECRET + "_refresh"
      : "flavor_fusion_refresh_secret")
  );
};

const sanitizeUser = (user) => {
  const userObj =
    typeof user.toObject === "function" ? user.toObject() : { ...user };
  delete userObj.password;
  delete userObj.refreshToken;
  delete userObj.__v;
  return userObj;
};

const generateTokens = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    name: user.name || user.displayName || user.username,
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_LIFETIME,
  });

  const refreshToken = jwt.sign({ id: user._id }, getRefreshSecret(), {
    expiresIn: REFRESH_TOKEN_LIFETIME,
  });

  return { accessToken, refreshToken };
};

export const register = async (req, res) => {
  try {
    const { name, displayName, email, username, password } = req.body;
    const userIdentifier = email || username;
    const userName = name || displayName || username;

    if (!userIdentifier || !password) {
      return res.status(400).json({
        error: "All fields are required",
        message: "Email and password are required",
      });
    }

    const existingUser = await User.findOne({
      $or: [
        { email: userIdentifier.toLowerCase() },
        { username: userIdentifier },
      ],
    });

    if (existingUser) {
      return res.status(400).json({
        error: "User already exists",
        message: "User with this email already exists",
      });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = new User({
      name: userName,
      displayName: userName,
      email: email ? email.toLowerCase() : userIdentifier.toLowerCase(),
      username: username || userIdentifier,
      password: hashedPassword,
    });

    const { accessToken, refreshToken } = generateTokens(newUser);
    newUser.refreshToken = refreshToken;
    const savedUser = await newUser.save();

    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

    const safeUser = sanitizeUser(savedUser);
    return res.status(201).json({
      message: "New user registered successfully",
      accessToken,
      user: safeUser,
      // Provide backwards compatibility if code accesses fields directly
      ...safeUser,
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
      return res.status(400).json({
        error: "Please provide credentials",
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier.toLowerCase() }],
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
        message: "No account found with this email",
      });
    }

    const isSame = await comparePassword(password, user.password);
    if (!isSame) {
      return res.status(400).json({
        error: "Wrong password",
        message: "Incorrect password",
      });
    }

    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

    const safeUser = sanitizeUser(user);
    return res.status(200).json({
      message: "Login successful",
      accessToken,
      user: safeUser,
      ...safeUser,
    });
  } catch (err) {
    return res.status(400).json({ error: err.message, message: err.message });
  }
};

export const refresh = async (req, res) => {
  try {
    const incomingRefreshToken = req.cookies?.refreshToken;

    if (!incomingRefreshToken) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "No refresh token provided",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(incomingRefreshToken, getRefreshSecret());
    } catch {
      res.clearCookie("refreshToken", clearRefreshCookieOptions);
      return res.status(401).json({
        error: "Unauthorized",
        message: "Refresh token is invalid or expired",
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      res.clearCookie("refreshToken", clearRefreshCookieOptions);
      return res.status(401).json({
        error: "Unauthorized",
        message: "User not found",
      });
    }

    // Refresh token rotation check
    if (user.refreshToken !== incomingRefreshToken) {
      // Possible token compromise: revoke user's stored refresh token
      user.refreshToken = null;
      await user.save();
      res.clearCookie("refreshToken", clearRefreshCookieOptions);
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid refresh token. Please log in again.",
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
      accessToken: newAccessToken,
      user: safeUser,
      ...safeUser,
    });
  } catch (err) {
    return res.status(400).json({ error: err.message, message: err.message });
  }
};

export const logout = async (req, res) => {
  try {
    const incomingRefreshToken = req.cookies?.refreshToken;
    if (incomingRefreshToken) {
      try {
        const decoded = jwt.verify(incomingRefreshToken, getRefreshSecret());
        if (decoded?.id) {
          await User.findByIdAndUpdate(decoded.id, { refreshToken: null });
        }
      } catch {
        // Ignore token verification errors during logout
      }
    }

    res.clearCookie("refreshToken", clearRefreshCookieOptions);
    res.clearCookie("token", clearRefreshCookieOptions);

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (err) {
    return res.status(500).json({ error: err.message, message: err.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const user = await User.findById(userId).select("-password -refreshToken -__v");
    if (!user) {
      return res.status(404).json({
        error: "User not found",
        message: "User not found",
      });
    }
    const safeUser = sanitizeUser(user);
    return res.status(200).json({
      user: safeUser,
      ...safeUser,
    });
  } catch (err) {
    return res.status(400).json({ error: err.message, message: err.message });
  }
};
