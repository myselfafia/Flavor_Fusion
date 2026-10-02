import express from "express";
import {
  login,
  logout,
  register,
  refresh,
  getProfile,
  refreshToken,
} from "../controllers/authController.js";
import checkToken from "../middleware/checkToken.js";

const router = express.Router();

<<<<<<< HEAD
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refreshToken);
=======
router.post("/login", login);
router.post("/register", register);
router.post("/refresh", refresh);
router.post("/logout", logout);
>>>>>>> ed4a2f0b729c2bcee7194781e48511565664ca6f
router.get("/me", checkToken, getProfile);
router.get("/profile", checkToken, getProfile);

export default router;
