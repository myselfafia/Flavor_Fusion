import express from "express";
import { getProfile } from "../controllers/authController.js";
import checkToken from "../middleware/checkToken.js";
import User from "../models/User.js";

const router = express.Router();

router.get("/profile", checkToken, getProfile);

// Get all saved recipes for the logged-in user
router.get("/saved", checkToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const user = await User.findById(userId).select("savedRecipes");
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found." });
    }
    return res.status(200).json({
      success: true,
      data: user.savedRecipes || [],
    });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

// Save a recipe to user account
router.post("/saved", checkToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const recipe = req.body;

    if (!recipe || (!recipe.recipeName && !recipe.name && !recipe.id)) {
      return res.status(400).json({
        success: false,
        error: "Recipe data is required.",
      });
    }

    const recipeName = recipe.recipeName || recipe.name || "Untitled Dish";
    const recipeId = recipe.id || recipe._id || `recipe-${Date.now()}`;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found." });
    }

    const existingIndex = user.savedRecipes.findIndex(
      (r) => r.id === recipeId || r.recipeName === recipeName
    );

    if (existingIndex > -1) {
      // Recipe already saved
      return res.status(200).json({
        success: true,
        message: "Recipe is already saved in your collection.",
        data: user.savedRecipes,
      });
    }

    user.savedRecipes.push({
      id: recipeId,
      recipeName,
      cuisine: recipe.cuisine || "Homestyle",
      description: recipe.description || "",
      cookingTime: recipe.cookingTime || recipe.time || "25 min",
      difficulty: recipe.difficulty || recipe.level || "Easy",
      ingredients: recipe.ingredients || recipe.required || [],
      steps: Array.isArray(recipe.steps) ? recipe.steps : [],
      tips: Array.isArray(recipe.tips) ? recipe.tips : [],
      image: recipe.image || "",
      savedAt: new Date(),
    });

    await user.save();

    return res.status(201).json({
      success: true,
      message: "Recipe saved to your cookbook.",
      data: user.savedRecipes,
    });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

// Remove a saved recipe
router.delete("/saved/:id", checkToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { id } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found." });
    }

    user.savedRecipes = user.savedRecipes.filter(
      (r) => r.id !== id && r.recipeName !== id
    );

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Recipe removed from your cookbook.",
      data: user.savedRecipes,
    });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
