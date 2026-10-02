import express from "express";
import {
  getPosts,
  createPost,
  likePost,
  addComment,
<<<<<<< HEAD
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
=======
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
>>>>>>> ed4a2f0b729c2bcee7194781e48511565664ca6f

export default router;
