import express from "express";
import {
  getPosts,
  createPost,
  likePost,
  addComment,
  deletePost,
} from "../controllers/postController.js";
import { checkToken, optionalAuth } from "../middleware/checkToken.js";

const router = express.Router();

router.get("/", getPosts);
router.post("/", optionalAuth, createPost);
router.post("/:id/like", optionalAuth, likePost);
router.post("/:id/comments", optionalAuth, addComment);
router.post("/:id/comment", optionalAuth, addComment);
router.delete("/:id", checkToken, deletePost);

export default router;
