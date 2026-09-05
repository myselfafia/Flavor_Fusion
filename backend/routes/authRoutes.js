import { Router } from "express";
import { body } from "express-validator";
import { login, me, register } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const email = body("email").isEmail().withMessage("Enter a valid email address.").normalizeEmail();

router.post("/register", [body("name").trim().isLength({ min: 2, max: 80 }).withMessage("Name must be 2 to 80 characters."), email, body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters.")], register);
router.post("/login", [email, body("password").notEmpty().withMessage("Password is required.")], login);
router.get("/me", requireAuth, me);

export default router;
