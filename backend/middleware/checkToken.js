import jwt from "jsonwebtoken";

<<<<<<< HEAD
const isProduction = process.env.NODE_ENV === "production";

export const checkToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token = req.cookies?.token;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token || token === "null" || token === "undefined") {
    return res.status(401).json({
      success: false,
      error: "Authentication required. Please log in.",
=======
const checkToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies?.token) {
    // Legacy fallback
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Access token is missing",
>>>>>>> ed4a2f0b729c2bcee7194781e48511565664ca6f
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
<<<<<<< HEAD
      res.clearCookie("token", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
      });
      return res.status(401).json({
        success: false,
        error: "Session expired or invalid. Please log in again.",
      });
    }
    req.user = decoded;
    next();
  });
};

export const optionalAuth = (req, _res, next) => {
  const authHeader = req.headers.authorization;
  let token = req.cookies?.token;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token || token === "null" || token === "undefined") {
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (!err && decoded) {
      req.user = decoded;
    }
=======
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid or expired access token",
      });
    }
    req.user = decoded;
>>>>>>> ed4a2f0b729c2bcee7194781e48511565664ca6f
    next();
  });
};

export default checkToken;
