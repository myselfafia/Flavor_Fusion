import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    displayName: { type: String, trim: true },
    username: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    password: { type: String, required: true },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
