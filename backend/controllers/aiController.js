import { generateRecipe } from "../services/geminiService.js";

export const getRecipeFromAi = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        error: "Please enter your ingredients or a cooking question.",
      });
    }

    const trimmedPrompt = prompt.trim();
    if (trimmedPrompt.length > 1000) {
      return res.status(400).json({
        success: false,
        error: "Your prompt is too long. Please limit it to 1000 characters.",
      });
    }

    const result = await generateRecipe(trimmedPrompt);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    const statusCode = error.status || 500;
    return res.status(statusCode).json({
      success: false,
      error:
        error.message ||
        "Something went wrong while communicating with the AI service.",
    });
  }
};
