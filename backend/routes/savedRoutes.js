import express from "express";
import {
  getSaved,
  saveRecipe,
  deleteSaved,
} from "../controllers/savedController.js";
import checkToken from "../middleware/checkToken.js";

const router = express.Router();

router.get("/", checkToken, getSaved);
router.post("/", checkToken, saveRecipe);
router.delete("/:recipeId", checkToken, deleteSaved);

export default router;
