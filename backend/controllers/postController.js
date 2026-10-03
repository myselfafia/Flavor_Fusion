import mongoose from "mongoose";
import Post from "../models/Post.js";
import User from "../models/User.js";

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
        ? post.savedBy?.some((id) => id?.toString() === userId?.toString())
        : false;
      const isLiked = userId
        ? post.likedBy?.some((id) => id?.toString() === userId?.toString())
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
          createdAt: c.createdAt,
        })),
      };
    });

    return res.status(200).json({
      success: true,
      message: "Posts retrieved successfully.",
      posts: formatted,
      data: formatted,
    });
  } catch (error) {
    console.error("getPosts error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch community posts.",
      error: "Internal Server Error",
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
        message: "Post must contain either text or a photo.",
        error: "Validation Error",
      });
    }

    let authorName = req.user?.name || req.user?.displayName || req.user?.username;
    if (!authorName && userId) {
      const userDoc = await User.findById(userId).select("name displayName username");
      authorName = userDoc?.name || userDoc?.displayName || userDoc?.username || "Chef";
    }
    authorName = authorName || "Chef";

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
      message: "Post published to community!",
      post: formattedPost,
      data: formattedPost,
    });
  } catch (error) {
    console.error("createPost error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Could not publish post.",
      error: "Internal Server Error",
    });
  }
};

export const likePost = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID format.",
        error: "Bad Request",
      });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
        error: "Not Found",
      });
    }

    const hasLiked = post.likedBy?.some(
      (uid) => uid.toString() === userId.toString()
    );

    if (hasLiked) {
      post.likedBy = post.likedBy.filter(
        (uid) => uid.toString() !== userId.toString()
      );
      post.likes = Math.max(0, (post.likes || 1) - 1);
    } else {
      post.likedBy.push(userId);
      post.likes = (post.likes || 0) + 1;
    }

    await post.save();

    return res.status(200).json({
      success: true,
      message: !hasLiked ? "Post liked" : "Post unliked",
      liked: !hasLiked,
      likes: post.likes,
      data: {
        liked: !hasLiked,
        likes: post.likes,
      },
    });
  } catch (error) {
    console.error("likePost error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update like status.",
      error: "Internal Server Error",
    });
  }
};

export const addComment = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { id } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment text cannot be empty.",
        error: "Validation Error",
      });
    }

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID format.",
        error: "Bad Request",
      });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
        error: "Not Found",
      });
    }

    let authorName = req.user?.name || req.user?.displayName || req.user?.username;
    if (!authorName && userId) {
      const userDoc = await User.findById(userId).select("name displayName username");
      authorName = userDoc?.name || userDoc?.displayName || userDoc?.username || "Chef";
    }
    authorName = authorName || "Chef";

    const initials = getInitials(authorName);

    const commentDoc = {
      author: userId,
      name: authorName,
      initials,
      text: text.trim(),
      createdAt: new Date(),
    };

    post.comments.push(commentDoc);
    await post.save();

    const savedComment = post.comments[post.comments.length - 1];
    const formattedComment = {
      id: savedComment._id.toString(),
      name: savedComment.name,
      initials: savedComment.initials,
      text: savedComment.text,
      time: "Just now",
      createdAt: savedComment.createdAt,
    };

    return res.status(201).json({
      success: true,
      message: "Comment added successfully.",
      comment: formattedComment,
      data: formattedComment,
    });
  } catch (error) {
    console.error("addComment error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to add comment.",
      error: "Internal Server Error",
    });
  }
};

export const toggleSavePost = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID format.",
        error: "Bad Request",
      });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
        error: "Not Found",
      });
    }

    const isSaved = post.savedBy?.some(
      (uid) => uid.toString() === userId.toString()
    );

    if (isSaved) {
      post.savedBy = post.savedBy.filter(
        (uid) => uid.toString() !== userId.toString()
      );
    } else {
      post.savedBy.push(userId);
    }

    await post.save();

    return res.status(200).json({
      success: true,
      message: !isSaved ? "Post saved to your collection." : "Post removed from collection.",
      saved: !isSaved,
      data: {
        saved: !isSaved,
      },
    });
  } catch (error) {
    console.error("toggleSavePost error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to toggle saved post.",
      error: "Internal Server Error",
    });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?._id;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID format.",
        error: "Bad Request",
      });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
        error: "Not Found",
      });
    }

    if (post.author && String(post.author) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this post.",
        error: "Forbidden",
      });
    }

    await Post.findByIdAndDelete(id);
    return res.status(200).json({
      success: true,
      message: "Post deleted successfully.",
    });
  } catch (error) {
    console.error("deletePost error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete post.",
      error: "Internal Server Error",
    });
  }
};
