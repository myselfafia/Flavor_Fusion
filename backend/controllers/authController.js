import User from "../models/User.js";
import { comparePassword, hashPassword } from "../utils/helpers.js";
import jwt from "jsonwebtoken";

<<<<<<< HEAD
const isProduction = process.env.NODE_ENV === "production";

// 7-day token lifetime
const ACCESS_TOKEN_EXPIRES_IN = "7d";
const REFRESH_TOKEN_EXPIRES_IN = "30d";

const cookieOptions = {
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
=======
const ACCESS_TOKEN_LIFETIME = "15m";
const REFRESH_TOKEN_LIFETIME = "7d";

const refreshCookieOptions = {
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
>>>>>>> ed4a2f0b729c2bcee7194781e48511565664ca6f
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
};

<<<<<<< HEAD
const sanitizeUser = (userDoc) => {
  if (!userDoc) return null;
  const obj = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
  delete obj.password;
  delete obj.__v;
  return obj;
=======
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
>>>>>>> ed4a2f0b729c2bcee7194781e48511565664ca6f
};

const generateTokens = (user) => {
  const payload = {
    id: user._id,
<<<<<<< HEAD
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
=======
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
>>>>>>> ed4a2f0b729c2bcee7194781e48511565664ca6f
};

export const register = async (req, res) => {
  try {
    const { name, displayName, email, username, password } = req.body;
    const rawIdentifier = email || username;
    const rawName = name || displayName || username || "Chef";

<<<<<<< HEAD
    if (!rawIdentifier || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required.",
        message: "Email and password are required.",
=======
    if (!userIdentifier || !password) {
      return res.status(400).json({
        error: "All fields are required",
        message: "Email and password are required",
>>>>>>> ed4a2f0b729c2bcee7194781e48511565664ca6f
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
<<<<<<< HEAD
        success: false,
        error: "An account with this email already exists.",
        message: "An account with this email already exists.",
=======
        error: "User already exists",
        message: "User with this email already exists",
>>>>>>> ed4a2f0b729c2bcee7194781e48511565664ca6f
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

    const { accessToken, refreshToken } = generateTokens(newUser);
    newUser.refreshToken = refreshToken;
    const savedUser = await newUser.save();
<<<<<<< HEAD
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
=======

    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

    const safeUser = sanitizeUser(savedUser);
    return res.status(201).json({
      message: "New user registered successfully",
      accessToken,
      user: safeUser,
      // Provide backwards compatibility if code accesses fields directly
      ...safeUser,
>>>>>>> ed4a2f0b729c2bcee7194781e48511565664ca6f
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
<<<<<<< HEAD
        success: false,
        error: "Please provide both email and password.",
        message: "Please provide both email and password.",
=======
        error: "Please provide credentials",
        message: "Email and password are required",
>>>>>>> ed4a2f0b729c2bcee7194781e48511565664ca6f
      });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    const user = await User.findOne({
<<<<<<< HEAD
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
=======
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
>>>>>>> ed4a2f0b729c2bcee7194781e48511565664ca6f

    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

<<<<<<< HEAD
    const sanitized = sanitizeUser(user);
    return res.status(200).json({
      success: true,
      message: "Logged in successfully.",
      token,
      refreshToken,
      user: sanitized,
      ...sanitized,
=======
    const safeUser = sanitizeUser(user);
    return res.status(200).json({
      message: "Login successful",
      accessToken,
      user: safeUser,
      ...safeUser,
>>>>>>> ed4a2f0b729c2bcee7194781e48511565664ca6f
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message || "Failed to log in.",
      message: err.message || "Failed to log in.",
    });
  }
};

<<<<<<< HEAD
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
=======
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
>>>>>>> ed4a2f0b729c2bcee7194781e48511565664ca6f
};

export const getProfile = async (req, res) => {
  try {
<<<<<<< HEAD
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
=======
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
>>>>>>> ed4a2f0b729c2bcee7194781e48511565664ca6f
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
