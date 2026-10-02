import mongoose from "mongoose";
import SavedRecipe from "../models/SavedRecipe.js";
import Post from "../models/Post.js";

export const getSaved = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const recipes = await SavedRecipe.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

    const posts = await Post.find({ savedBy: userId })
      .sort({ createdAt: -1 })
      .lean();

    const normalizedRecipes = recipes.map((recipe) => ({
      ...recipe,
      name: recipe.name || recipe.recipeName,
      recipeName: recipe.recipeName || recipe.name,
      time: recipe.time || recipe.cookingTime || "30 min",
      cookingTime: recipe.cookingTime || recipe.time || "30 min",
      level: recipe.level || recipe.difficulty || "Easy",
      difficulty: recipe.difficulty || recipe.level || "Easy",
      cuisine: recipe.cuisine || "General",
      required:
        recipe.required?.length > 0
          ? recipe.required
          : recipe.ingredients?.map((i) =>
              typeof i === "string" ? i : i.name,
            ) || [],
    }));

    const normalizedPosts = posts.map((post) => ({
      ...post,
      saved: true,
    }));

    return res.status(200).json({
      success: true,
      recipes: normalizedRecipes,
      posts: normalizedPosts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch saved collection",
    });
  }
};

export const saveRecipe = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    // Support saving a community post as well
    if (req.body.type === "post" || req.body.postId) {
      const postId = req.body.postId || req.body.id;
      if (!mongoose.isValidObjectId(postId)) {
        return res
          .status(400)
          .json({ success: false, error: "Invalid post ID" });
      }
      const post = await Post.findByIdAndUpdate(
        postId,
        { $addToSet: { savedBy: userId } },
        { new: true },
      );
      if (!post) {
        return res
          .status(404)
          .json({ success: false, error: "Post not found" });
      }
      return res.status(201).json({
        success: true,
        message: "Post saved successfully",
        post: { ...post.toObject(), saved: true },
      });
    }

    const {
      name,
      recipeName,
      cuisine,
      time,
      cookingTime,
      level,
      difficulty,
      description,
      image,
      required,
      ingredients,
      steps,
      tips,
    } = req.body;

    const title = (recipeName || name || "").trim();
    if (!title) {
      return res.status(400).json({
        success: false,
        error: "Recipe name is required",
      });
    }

    // Check if already saved
    const existing = await SavedRecipe.findOne({
      user: userId,
      $or: [{ name: title }, { recipeName: title }],
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        message: "Recipe already in your saved collection",
        recipe: existing,
      });
    }

    const normalizedRequired =
      required && required.length > 0
        ? required
        : ingredients && ingredients.length > 0
          ? ingredients.map((item) =>
              typeof item === "string" ? item : item.name,
            )
          : [];

    const newSaved = new SavedRecipe({
      user: userId,
      name: title,
      recipeName: title,
      cuisine: cuisine || "General",
      time: cookingTime || time || "30 min",
      cookingTime: cookingTime || time || "30 min",
      level: difficulty || level || "Easy",
      difficulty: difficulty || level || "Easy",
      description: description || "",
      image: image || "",
      required: normalizedRequired,
      ingredients: Array.isArray(ingredients) ? ingredients : [],
      steps: Array.isArray(steps) ? steps : [],
      tips: Array.isArray(tips) ? tips : [],
    });

    const saved = await newSaved.save();

    return res.status(201).json({
      success: true,
      message: "Recipe saved successfully",
      recipe: saved,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to save recipe",
    });
  }
};

export const deleteSaved = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { recipeId } = req.params;

    if (!recipeId) {
      return res
        .status(400)
        .json({ success: false, error: "Recipe identifier is required" });
    }

    const query = { user: userId };
    if (mongoose.isValidObjectId(recipeId)) {
      query.$or = [{ _id: recipeId }, { name: recipeId }, { recipeName: recipeId }];
    } else {
      query.$or = [{ name: recipeId }, { recipeName: recipeId }];
    }

    const deleted = await SavedRecipe.findOneAndDelete(query);

    // Also check if it corresponds to an unsaved community post
    if (mongoose.isValidObjectId(recipeId)) {
      await Post.findByIdAndUpdate(recipeId, {
        $pull: { savedBy: userId },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Item removed from your saved collection",
      deletedId: deleted?._id || recipeId,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to remove saved item",
    });
  }
};
