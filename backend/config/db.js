import mongoose from "mongoose";

let isConnecting = false;

export async function connectDatabase() {
  const dbUrl =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    process.env.DATABASE_URL;

  if (!dbUrl) {
    throw new Error(
      "Database connection string missing. Please set MONGODB_URI or MONGO_URI in your environment variables."
    );
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
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
      console.warn("MongoDB disconnected. Reconnection will be attempted if needed.");
    });

    await mongoose.connect(dbUrl, {
      serverSelectionTimeoutMS: 8000,
    });

    return mongoose.connection;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
    throw error;
  } finally {
    isConnecting = false;
  }
}
