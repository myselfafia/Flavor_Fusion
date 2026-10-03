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
      id: recipe._id.toString(),
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
              typeof i === "string" ? i : i.name
            ) || [],
    }));

    const normalizedPosts = posts.map((post) => ({
      ...post,
      id: post._id.toString(),
      saved: true,
    }));

    return res.status(200).json({
      success: true,
      message: "Saved collection fetched successfully.",
      recipes: normalizedRecipes,
      posts: normalizedPosts,
      data: {
        recipes: normalizedRecipes,
        posts: normalizedPosts,
      },
    });
  } catch (error) {
    console.error("getSaved error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch saved collection.",
      error: "Internal Server Error",
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
        return res.status(400).json({
          success: false,
          message: "Invalid post ID format.",
          error: "Bad Request",
        });
      }
      const post = await Post.findByIdAndUpdate(
        postId,
        { $addToSet: { savedBy: userId } },
        { new: true }
      );
      if (!post) {
        return res.status(404).json({
          success: false,
          message: "Post not found.",
          error: "Not Found",
        });
      }
      return res.status(201).json({
        success: true,
        message: "Post saved successfully to your collection.",
        post: { ...post.toObject(), id: post._id.toString(), saved: true },
        data: { ...post.toObject(), id: post._id.toString(), saved: true },
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
        message: "Recipe name is required.",
        error: "Validation Error",
      });
    }

    // Check if already saved
    const existing = await SavedRecipe.findOne({
      user: userId,
      $or: [{ name: title }, { recipeName: title }],
    });

    if (existing) {
      const existingObj = existing.toObject();
      return res.status(200).json({
        success: true,
        message: "Recipe already in your saved collection.",
        recipe: { ...existingObj, id: existing._id.toString() },
        data: { ...existingObj, id: existing._id.toString() },
      });
    }

    const normalizedRequired =
      required && required.length > 0
        ? required
        : ingredients && ingredients.length > 0
          ? ingredients.map((item) =>
              typeof item === "string" ? item : item.name
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
    const savedObj = saved.toObject();

    return res.status(201).json({
      success: true,
      message: "Recipe saved successfully to your collection.",
      recipe: { ...savedObj, id: saved._id.toString() },
      data: { ...savedObj, id: saved._id.toString() },
    });
  } catch (error) {
    console.error("saveRecipe error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to save recipe.",
      error: "Internal Server Error",
    });
  }
};

export const deleteSaved = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { recipeId } = req.params;

    if (!recipeId) {
      return res.status(400).json({
        success: false,
        message: "Recipe identifier is required.",
        error: "Bad Request",
      });
    }

    const decodedId = decodeURIComponent(recipeId).trim();
    const query = { user: userId };
    if (mongoose.isValidObjectId(decodedId)) {
      query.$or = [{ _id: decodedId }, { name: decodedId }, { recipeName: decodedId }];
    } else {
      query.$or = [{ name: decodedId }, { recipeName: decodedId }];
    }

    const deleted = await SavedRecipe.findOneAndDelete(query);

    // Also check if it corresponds to a saved community post
    if (mongoose.isValidObjectId(decodedId)) {
      await Post.findByIdAndUpdate(decodedId, {
        $pull: { savedBy: userId },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Item removed from your saved collection.",
      deletedId: deleted?._id?.toString() || decodedId,
      data: { deletedId: deleted?._id?.toString() || decodedId },
    });
  } catch (error) {
    console.error("deleteSaved error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to remove saved item.",
      error: "Internal Server Error",
    });
  }
};
