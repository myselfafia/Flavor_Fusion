import express from "express";
import { register, getProfile } from "../controllers/authController.js";
import checkToken from "../middleware/checkToken.js";
import User from "../models/User.js";

const router = express.Router();

router.post("/", register);
router.get("/profile", checkToken, getProfile);

router.get("/", checkToken, async (req, res) => {
  try {
    const users = await User.find().select("-password -__v");
    res.status(200).json(users);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
