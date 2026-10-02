import mongoose from "mongoose";

const recentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    prompt: {
      type: String,
      default: "",
      trim: true,
    },
    recipeName: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    cuisine: {
      type: String,
      default: "",
    },
    cookingTime: {
      type: String,
      default: "",
    },
    time: {
      type: String,
    },
    difficulty: {
      type: String,
      default: "",
    },
    level: {
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
    ingredients: [
      {
        name: { type: String },
        quantity: { type: String },
      },
    ],
    steps: [{ type: String }],
    tips: [{ type: String }],
    searchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

recentSchema.index({ user: 1, searchedAt: -1 });

export default mongoose.model("Recent", recentSchema);
