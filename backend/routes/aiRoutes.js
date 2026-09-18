import express from "express";
import { getRecipeFromAi } from "../controllers/aiController.js";

const router = express.Router();

// POST /api/ai/recipe
router.post("/recipe", getRecipeFromAi);

export default router;
