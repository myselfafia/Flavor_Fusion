import mongoose from "mongoose";

let isConnecting = false;

export async function connectDatabase() {
  const dbUrl = process.env.DATABASE_URL || process.env.MONGODB_URI;
  if (!dbUrl) {
    throw new Error("DATABASE_URL or MONGODB_URI is missing in backend/.env.");
  }

  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (isConnecting) {
    return;
  }

  isConnecting = true;

  try {
    mongoose.connection.on("connected", () => {
      console.log("MongoDB connected successfully");
    });

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err.message);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected.");
    });

    await mongoose.connect(dbUrl, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log("Connected to database");
  } finally {
    isConnecting = false;
  }
}
