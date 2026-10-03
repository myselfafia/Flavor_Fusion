import express from "express";
import {
  getPosts,
  createPost,
  likePost,
  addComment,
  toggleSavePost,
  deletePost,
} from "../controllers/postController.js";
import checkToken, { optionalAuth } from "../middleware/checkToken.js";

const router = express.Router();

router.get("/", optionalAuth, getPosts);
router.post("/", checkToken, createPost);
router.post("/:id/like", checkToken, likePost);
router.post("/:id/comments", checkToken, addComment);
router.post("/:id/comment", checkToken, addComment);
router.post("/:id/save", checkToken, toggleSavePost);
router.delete("/:id", optionalAuth, deletePost);

export default router;
