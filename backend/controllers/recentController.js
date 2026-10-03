import Recent from "../models/Recent.js";

export const getRecents = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(200).json({
        success: true,
        message: "No recents for unauthenticated user.",
        recents: [],
        data: [],
      });
    }

    const recents = await Recent.find({ user: userId })
      .sort({ searchedAt: -1, createdAt: -1 })
      .limit(15)
      .lean();

    const normalized = recents.map((item) => ({
      ...item,
      id: item._id.toString(),
      name: item.name || item.recipeName,
      recipeName: item.recipeName || item.name,
      cookingTime: item.cookingTime || item.time || "25 min",
      difficulty: item.difficulty || item.level || "Easy",
    }));

    return res.status(200).json({
      success: true,
      message: "Recent searches retrieved successfully.",
      recents: normalized,
      data: normalized,
    });
  } catch (error) {
    console.error("getRecents error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch recent searches.",
      error: "Internal Server Error",
    });
  }
};

export const addRecent = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
        error: "Unauthorized",
      });
    }

    const body = req.body;
    const items = Array.isArray(body)
      ? body
      : Array.isArray(body.items)
        ? body.items
        : Array.isArray(body.recipes)
          ? body.recipes.map((r) => ({ ...r, prompt: body.prompt }))
          : [body];

    for (const item of items) {
      const recipeTitle = (item.recipeName || item.name || "").trim();
      if (!recipeTitle) continue;

      const updateData = {
        user: userId,
        recipeName: recipeTitle,
        name: recipeTitle,
        prompt: item.prompt || "",
        cuisine: item.cuisine || "",
        cookingTime: item.cookingTime || item.time || "",
        time: item.time || item.cookingTime || "",
        difficulty: item.difficulty || item.level || "",
        level: item.level || item.difficulty || "",
        description: item.description || "",
        image: item.image || "",
        ingredients: Array.isArray(item.ingredients) ? item.ingredients : [],
        steps: Array.isArray(item.steps) ? item.steps : [],
        tips: Array.isArray(item.tips) ? item.tips : [],
        searchedAt: new Date(),
      };

      await Recent.findOneAndUpdate(
        { user: userId, recipeName: recipeTitle },
        updateData,
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
    }

    // Keep only the 20 most recent
    const allUserRecents = await Recent.find({ user: userId })
      .sort({ searchedAt: -1 })
      .select("_id")
      .lean();

    if (allUserRecents.length > 20) {
      const idsToDelete = allUserRecents.slice(20).map((r) => r._id);
      await Recent.deleteMany({ _id: { $in: idsToDelete } });
    }

    return res.status(201).json({
      success: true,
      message: "Recents updated successfully.",
    });
  } catch (error) {
    console.error("addRecent error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to save recent search.",
      error: "Internal Server Error",
    });
  }
};

export const clearRecents = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
        error: "Unauthorized",
      });
    }

    await Recent.deleteMany({ user: userId });

    return res.status(200).json({
      success: true,
      message: "Recents cleared successfully.",
    });
  } catch (error) {
    console.error("clearRecents error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to clear recents.",
      error: "Internal Server Error",
    });
  }
};
