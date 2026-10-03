import express from "express";
import {
  login,
  logout,
  register,
  refresh,
  getProfile,
} from "../controllers/authController.js";
import checkToken from "../middleware/checkToken.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", checkToken, getProfile);
router.get("/profile", checkToken, getProfile);

export default router;
