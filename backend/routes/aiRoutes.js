import express from "express";
import { getRecipeFromAi } from "../controllers/aiController.js";

const router = express.Router();

// POST /api/ai/recipe and POST /api/ai/generate-recipe
router.post("/recipe", getRecipeFromAi);
router.post("/generate-recipe", getRecipeFromAi);

export default router;
