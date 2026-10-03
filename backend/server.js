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
import postRoutes from "./routes/postRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import savedRoutes from "./routes/savedRoutes.js";
import recentRoutes from "./routes/recentRoutes.js";
import log from "./middleware/logger.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

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
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      // Allow any localhost, 127.0.0.1, or local network (LAN) dev server port
      if (
        /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(
          origin
        )
      ) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS origin not allowed: ${origin}`));
    },
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(log);

// Base health & info routes
app.get("/api", (_req, res) =>
  res.json({ success: true, message: "Flavor Fusion API is running." })
);
app.get("/api/health", (_req, res) =>
  res.json({ success: true, message: "Flavor Fusion API is healthy." })
);

// Route mounts
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/saved", savedRoutes);
app.use("/api/recents", recentRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

if (process.env.NODE_ENV !== "test") {
  connectDatabase()
    .then(() => {
      app.listen(PORT, () =>
        console.log(`Flavor Fusion backend server listening on port: ${PORT}`)
      );
    })
    .catch((error) => {
      console.error(`Database connection failed: ${error.message}`);
      process.exit(1);
    });
}

export default app;
