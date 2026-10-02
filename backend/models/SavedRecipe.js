import mongoose from "mongoose";

const savedRecipeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    recipeId: {
      type: String,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    recipeName: {
      type: String,
      trim: true,
    },
    cuisine: {
      type: String,
      default: "General",
      trim: true,
    },
    time: {
      type: String,
      default: "30 min",
    },
    cookingTime: {
      type: String,
    },
    level: {
      type: String,
      default: "Easy",
    },
    difficulty: {
      type: String,
    },
    description: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    required: [{ type: String }],
    ingredients: [
      {
        name: { type: String },
        quantity: { type: String },
      },
    ],
    steps: [{ type: String }],
    tips: [{ type: String }],
  },
  { timestamps: true },
);

// Compound index to avoid duplicate saves per user
savedRecipeSchema.index({ user: 1, name: 1 });

export default mongoose.model("SavedRecipe", savedRecipeSchema);
