import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: () =>
        `comment-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    },
    name: { type: String, default: "Community Member" },
    initials: { type: String, default: "CM" },
    text: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    name: { type: String, default: "Community Chef" },
    initials: { type: String, default: "CC" },
    text: { type: String, required: true, trim: true },
    tags: [{ type: String, trim: true }],
    image: { type: String, default: "" },
    recipeLink: { type: String, default: "" },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: String }],
    comments: [commentSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);
