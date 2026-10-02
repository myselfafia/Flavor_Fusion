import mongoose from "mongoose";
<<<<<<< HEAD

const savedRecipeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    recipeName: { type: String, required: true, trim: true },
    cuisine: { type: String, default: "Homestyle" },
    description: { type: String, default: "" },
    cookingTime: { type: String, default: "25 min" },
    difficulty: { type: String, default: "Easy" },
    ingredients: { type: mongoose.Schema.Types.Mixed, default: [] },
    steps: [{ type: String }],
    tips: [{ type: String }],
    image: { type: String, default: "" },
    savedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);
=======
>>>>>>> ed4a2f0b729c2bcee7194781e48511565664ca6f

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "Chef" },
    displayName: { type: String, trim: true },
    username: { type: String, trim: true },
<<<<<<< HEAD
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: true,
      unique: true,
    },
    password: { type: String, required: true },
    savedRecipes: [savedRecipeSchema],
=======
    email: { type: String, trim: true, lowercase: true, unique: true },
    password: { type: String, required: true },
    refreshToken: { type: String, default: null },
>>>>>>> ed4a2f0b729c2bcee7194781e48511565664ca6f
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
