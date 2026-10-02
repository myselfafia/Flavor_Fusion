import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    displayName: { type: String, trim: true },
    username: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true, unique: true },
    password: { type: String, required: true },
    refreshToken: { type: String, default: null },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
