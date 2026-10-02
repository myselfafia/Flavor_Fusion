import mongoose from "mongoose";
import Post from "../models/Post.js";

const formatTimeAgo = (date) => {
  if (!date) return "Recently";
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

const getInitials = (name) => {
  if (!name || typeof name !== "string") return "FF";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const getPosts = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    const posts = await Post.find().sort({ createdAt: -1 }).lean();

    const formatted = posts.map((post) => {
      const isSaved = userId
        ? post.savedBy?.some((id) => id.toString() === userId.toString())
        : false;
      const isLiked = userId
        ? post.likedBy?.some((id) => id.toString() === userId.toString())
        : false;

      return {
        ...post,
        id: post._id.toString(),
        time: formatTimeAgo(post.createdAt),
        saved: Boolean(isSaved),
        liked: Boolean(isLiked),
        likes: post.likes ?? (post.likedBy?.length || 0),
        comments: (post.comments || []).map((c) => ({
          id: c._id ? c._id.toString() : Date.now(),
          name: c.name || "Chef",
          initials: c.initials || "CH",
          text: c.text,
          time: formatTimeAgo(c.createdAt),
        })),
      };
    });

    return res.status(200).json({
      success: true,
      posts: formatted,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch posts",
    });
  }
};

export const createPost = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { text, image, recipeLink, tags } = req.body;

    if (!text?.trim() && !image) {
      return res.status(400).json({
        success: false,
        error: "Post content or photo is required",
      });
    }

    const authorName =
      req.user?.name || req.user?.displayName || req.user?.username || "Chef";
    const initials = getInitials(authorName);

    const postTags = Array.isArray(tags)
      ? tags
      : recipeLink
        ? ["Recipe link"]
        : [];

    const newPost = new Post({
      author: userId,
      name: authorName,
      initials,
      text: text?.trim() || "Shared a new culinary creation.",
      image: image || "",
      recipeLink: recipeLink ? recipeLink.trim() : "",
      tags: postTags,
      likes: 0,
      likedBy: [],
      savedBy: [],
      comments: [],
    });

    const savedPost = await newPost.save();

    const formattedPost = {
      ...savedPost.toObject(),
      id: savedPost._id.toString(),
      time: "Just now",
      saved: false,
      liked: false,
      comments: [],
    };

    return res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: formattedPost,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to create post",
    });
  }
};

export const likePost = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, error: "Invalid post ID" });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, error: "Post not found" });
    }

    const hasLiked = post.likedBy?.some(
      (uid) => uid.toString() === userId.toString(),
    );

    if (hasLiked) {
      post.likedBy = post.likedBy.filter(
        (uid) => uid.toString() !== userId.toString(),
      );
      post.likes = Math.max(0, (post.likes || 1) - 1);
    } else {
      post.likedBy.push(userId);
      post.likes = (post.likes || 0) + 1;
    }

    await post.save();

    return res.status(200).json({
      success: true,
      liked: !hasLiked,
      likes: post.likes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to update like",
    });
  }
};

export const addComment = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { id } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res
        .status(400)
        .json({ success: false, error: "Comment text is required" });
    }

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, error: "Invalid post ID" });
    }

    const authorName =
      req.user?.name || req.user?.displayName || req.user?.username || "Chef";
    const initials = getInitials(authorName);

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, error: "Post not found" });
    }

    post.comments.push({
      author: userId,
      name: authorName,
      initials,
      text: text.trim(),
      createdAt: new Date(),
    });

    await post.save();
    const newComment = post.comments[post.comments.length - 1];

    return res.status(201).json({
      success: true,
      comment: {
        id: newComment._id.toString(),
        name: newComment.name,
        initials: newComment.initials,
        text: newComment.text,
        time: "Just now",
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to add comment",
    });
  }
};

export const toggleSavePost = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, error: "Invalid post ID" });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, error: "Post not found" });
    }

    const isSaved = post.savedBy?.some(
      (uid) => uid.toString() === userId.toString(),
    );

    if (isSaved) {
      post.savedBy = post.savedBy.filter(
        (uid) => uid.toString() !== userId.toString(),
      );
    } else {
      post.savedBy.push(userId);
    }

    await post.save();

    return res.status(200).json({
      success: true,
      saved: !isSaved,
      message: !isSaved ? "Post saved" : "Post removed from saved",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to toggle saved post",
    });
  }
};
