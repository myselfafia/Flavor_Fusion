import express from "express";
import { login, logout, register, getProfile } from "../controllers/authController.js";
import checkToken from "../middleware/checkToken.js";

const router = express.Router();

router.post("/login", login);
router.post("/logout", checkToken, logout);
router.post("/register", register);
router.get("/me", checkToken, getProfile);
router.get("/profile", checkToken, getProfile);

export default router;
