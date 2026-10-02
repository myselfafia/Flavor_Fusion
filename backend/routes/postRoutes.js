import express from "express";
import {
  getPosts,
  createPost,
  likePost,
  addComment,
  toggleSavePost,
} from "../controllers/postController.js";
import checkToken from "../middleware/checkToken.js";
import { optionalAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", optionalAuth, getPosts);
router.post("/", checkToken, createPost);
router.post("/:id/like", checkToken, likePost);
router.post("/:id/comments", checkToken, addComment);
router.post("/:id/comment", checkToken, addComment);
router.post("/:id/save", checkToken, toggleSavePost);

export default router;
