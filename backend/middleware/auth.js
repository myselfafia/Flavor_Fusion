<<<<<<< HEAD
import checkToken, { optionalAuth } from "./checkToken.js";

export const requireAuth = checkToken;
export { optionalAuth };
=======
import jwt from "jsonwebtoken";
import checkToken from "./checkToken.js";

export const requireAuth = checkToken;

export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (!err && decoded) {
      req.user = decoded;
    }
    next();
  });
};

>>>>>>> ed4a2f0b729c2bcee7194781e48511565664ca6f
export default checkToken;
