import jwt from "jsonwebtoken";

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
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid or expired access token",
      });
    }
    req.user = decoded;
    next();
  });
};

export default checkToken;
