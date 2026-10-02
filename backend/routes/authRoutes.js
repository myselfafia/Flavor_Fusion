import express from "express";
import {
  login,
  logout,
  register,
  getProfile,
  refreshToken,
} from "../controllers/authController.js";
import checkToken from "../middleware/checkToken.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refreshToken);
router.get("/me", checkToken, getProfile);
router.get("/profile", checkToken, getProfile);

export default router;
