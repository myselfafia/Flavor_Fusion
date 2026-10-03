import express from "express";
import { getProfile } from "../controllers/authController.js";
import {
  getSaved,
  saveRecipe,
  deleteSaved,
} from "../controllers/savedController.js";
import checkToken from "../middleware/checkToken.js";

const router = express.Router();

router.get("/profile", checkToken, getProfile);
router.get("/me", checkToken, getProfile);

// Saved recipes compatibility routes
router.get("/saved", checkToken, getSaved);
router.post("/saved", checkToken, saveRecipe);
router.delete("/saved/:recipeId", checkToken, deleteSaved);

export default router;
