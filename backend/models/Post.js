import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
<<<<<<< HEAD
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
=======
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
      default: "Chef",
    },
    initials: {
      type: String,
      default: "CH",
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true },
>>>>>>> ed4a2f0b729c2bcee7194781e48511565664ca6f
);

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
<<<<<<< HEAD
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
=======
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    initials: {
      type: String,
      default: "FF",
      uppercase: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    recipeLink: {
      type: String,
      default: "",
      trim: true,
    },
    tags: [{ type: String }],
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    savedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [commentSchema],
  },
  { timestamps: true },
>>>>>>> ed4a2f0b729c2bcee7194781e48511565664ca6f
);

export default mongoose.model("Post", postSchema);
