import jwt from "jsonwebtoken";

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
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
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
    next();
  });
};

export default checkToken;
