import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDatabase } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import log from "./middleware/logger.js";

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  process.env.ALLOWED_ORIGIN,
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
].filter(Boolean);

app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, mobile, server-side)
      if (!origin) return callback(null, true);

      // Allow any localhost or 127.0.0.1 port (e.g. 5173, 5174, etc.)
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(null, true);
    },
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(log);

app.get("/api", (req, res) => res.json({ message: "API is working" }));
app.get("/api/health", (req, res) => res.json({ success: true, message: "Flavor Fusion API is running." }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ai", aiRoutes);

connectDatabase()
  .then(() => app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`)))
  .catch((error) => {
    console.error(`Database connection failed: ${error.message}`);
    process.exit(1);
  });

export default app;
