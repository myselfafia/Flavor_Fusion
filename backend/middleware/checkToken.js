import jwt from "jsonwebtoken";

export const checkToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token || token === "null" || token === "undefined") {
    return res.status(401).json({
      success: false,
      message: "Authentication required. Please log in.",
      error: "Unauthorized",
    });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("JWT_SECRET is not configured in environment variables.");
    return res.status(500).json({
      success: false,
      message: "Server authentication configuration error.",
      error: "Internal Server Error",
    });
  }

  jwt.verify(token, secret, (err, decoded) => {
    if (err || !decoded) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired access token. Please log in again.",
        error: "Unauthorized",
      });
    }

    req.user = {
      ...decoded,
      id: decoded.id || decoded.userId || decoded._id,
      _id: decoded.id || decoded.userId || decoded._id,
    };
    next();
  });
};

export const optionalAuth = (req, _res, next) => {
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token || token === "null" || token === "undefined") {
    return next();
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return next();
  }

  jwt.verify(token, secret, (err, decoded) => {
    if (!err && decoded) {
      req.user = {
        ...decoded,
        id: decoded.id || decoded.userId || decoded._id,
        _id: decoded.id || decoded.userId || decoded._id,
      };
    }
    next();
  });
};

export default checkToken;
