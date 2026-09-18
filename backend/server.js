import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDatabase } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import log from "./middleware/logger.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    credentials: true,
    origin: process.env.ALLOWED_ORIGIN || process.env.FRONTEND_URL || "http://localhost:5173",
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(log);

app.get("/api", (req, res) => res.json({ message: "API is working" }));
app.get("/api/health", (req, res) => res.json({ success: true, message: "Flavor Fusion API is running." }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

connectDatabase()
  .then(() => app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`)))
  .catch((error) => {
    console.error(`Database connection failed: ${error.message}`);
    process.exit(1);
  });

export default app;
