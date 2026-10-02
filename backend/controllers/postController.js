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
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch community posts.",
    });
  }
};

export const createPost = async (req, res) => {
  try {
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
    });
  }
};

export const likePost = async (req, res) => {
  try {
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
    }

    await post.save();

    return res.status(200).json({
      success: true,
      likes: post.likes,
      hasLiked: !hasLiked,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message || "Failed to update like.",
    });
  }
};

export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
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
    });
  }
};

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
    });
  }
};
