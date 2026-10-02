import express from "express";
import {
  getRecents,
  addRecent,
  clearRecents,
} from "../controllers/recentController.js";
import checkToken from "../middleware/checkToken.js";

const router = express.Router();

router.get("/", checkToken, getRecents);
router.post("/", checkToken, addRecent);
router.delete("/", checkToken, clearRecents);

export default router;
