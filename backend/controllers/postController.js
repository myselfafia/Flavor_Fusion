<<<<<<< HEAD
import Post from "../models/Post.js";
import User from "../models/User.js";

export const getPosts = async (_req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).lean();
    return res.status(200).json({
      success: true,
      data: posts.map((p) => ({
        id: p._id.toString(),
        _id: p._id.toString(),
        name: p.name || "Community Chef",
        initials: p.initials || "CC",
        time: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "Recently",
        text: p.text,
        tags: p.tags || [],
        image: p.image || "",
        recipeLink: p.recipeLink || "",
        likes: p.likes || 0,
        likedBy: p.likedBy || [],
        comments: p.comments || [],
        createdAt: p.createdAt,
      })),
=======
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
>>>>>>> ed4a2f0b729c2bcee7194781e48511565664ca6f
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
<<<<<<< HEAD
      error: error.message || "Failed to fetch community posts.",
=======
      error: error.message || "Failed to fetch posts",
>>>>>>> ed4a2f0b729c2bcee7194781e48511565664ca6f
    });
  }
};

export const createPost = async (req, res) => {
  try {
<<<<<<< HEAD
    const { text, image, recipeLink, tags } = req.body;

    if (!text && !image) {
      return res.status(400).json({
        success: false,
        error: "Post must contain either text or a photo.",
      });
    }

    let authorName = "You";
    let authorInitials = "YO";
    let authorId = null;

    if (req.user?.id || req.user?.userId) {
      authorId = req.user.id || req.user.userId;
      const user = await User.findById(authorId);
      if (user) {
        authorName = user.name || user.displayName || user.username || "Chef";
        const parts = authorName.trim().split(/\s+/);
        authorInitials = parts.length > 1
          ? (parts[0][0] + parts[1][0]).toUpperCase()
          : authorName.substring(0, 2).toUpperCase();
      }
    }

    const post = new Post({
      author: authorId,
      name: authorName,
      initials: authorInitials,
      text: (text || "").trim(),
      image: image || "",
      recipeLink: (recipeLink || "").trim(),
      tags: Array.isArray(tags) ? tags : recipeLink ? ["Recipe link"] : [],
      likes: 0,
      likedBy: [],
      comments: [],
    });

    const saved = await post.save();

    return res.status(201).json({
      success: true,
      message: "Post published to community!",
      data: {
        id: saved._id.toString(),
        _id: saved._id.toString(),
        name: saved.name,
        initials: saved.initials,
        time: "Just now",
        text: saved.text,
        tags: saved.tags,
        image: saved.image,
        recipeLink: saved.recipeLink,
        likes: saved.likes,
        likedBy: saved.likedBy,
        comments: saved.comments,
        createdAt: saved.createdAt,
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message || "Could not publish post.",
=======
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
>>>>>>> ed4a2f0b729c2bcee7194781e48511565664ca6f
    });
  }
};

export const likePost = async (req, res) => {
  try {
<<<<<<< HEAD
    const { id } = req.params;
    const userId = req.user?.id || req.user?.userId || req.ip;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, error: "Post not found." });
    }

    const hasLiked = post.likedBy?.includes(userId);
    if (hasLiked) {
      post.likes = Math.max(0, (post.likes || 1) - 1);
      post.likedBy = post.likedBy.filter((uid) => uid !== userId);
    } else {
      post.likes = (post.likes || 0) + 1;
      if (!post.likedBy) post.likedBy = [];
      post.likedBy.push(userId);
=======
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
>>>>>>> ed4a2f0b729c2bcee7194781e48511565664ca6f
    }

    await post.save();

    return res.status(200).json({
      success: true,
<<<<<<< HEAD
      likes: post.likes,
      hasLiked: !hasLiked,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message || "Failed to update like.",
=======
      liked: !hasLiked,
      likes: post.likes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to update like",
>>>>>>> ed4a2f0b729c2bcee7194781e48511565664ca6f
    });
  }
};

export const addComment = async (req, res) => {
  try {
<<<<<<< HEAD
=======
    const userId = req.user?.id || req.user?._id;
>>>>>>> ed4a2f0b729c2bcee7194781e48511565664ca6f
    const { id } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
<<<<<<< HEAD
      return res.status(400).json({
        success: false,
        error: "Comment text cannot be empty.",
      });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, error: "Post not found." });
    }

    let commenterName = "Community Member";
    let commenterInitials = "CM";

    if (req.user?.id || req.user?.userId) {
      const user = await User.findById(req.user.id || req.user.userId);
      if (user) {
        commenterName = user.name || user.displayName || "Chef";
        const parts = commenterName.trim().split(/\s+/);
        commenterInitials = parts.length > 1
          ? (parts[0][0] + parts[1][0]).toUpperCase()
          : commenterName.substring(0, 2).toUpperCase();
      }
    }

    const newComment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: commenterName,
      initials: commenterInitials,
      text: text.trim(),
      createdAt: new Date(),
    };

    post.comments.push(newComment);
    await post.save();

    return res.status(201).json({
      success: true,
      data: newComment,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message || "Failed to add comment.",
=======
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
>>>>>>> ed4a2f0b729c2bcee7194781e48511565664ca6f
    });
  }
};

<<<<<<< HEAD
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?.userId;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, error: "Post not found." });
    }

    if (post.author && String(post.author) !== String(userId)) {
      return res.status(403).json({
        success: false,
        error: "You are not authorized to delete this post.",
      });
    }

    await Post.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: "Post deleted successfully." });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message || "Failed to delete post.",
=======
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
>>>>>>> ed4a2f0b729c2bcee7194781e48511565664ca6f
    });
  }
};
