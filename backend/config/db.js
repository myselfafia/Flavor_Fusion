import mongoose from "mongoose";
<<<<<<< HEAD
=======

let isConnecting = false;
>>>>>>> ed4a2f0b729c2bcee7194781e48511565664ca6f

export async function connectDatabase() {
  const dbUrl =
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    process.env.DATABASE_URL;

  if (!dbUrl) {
    throw new Error(
      "Database connection string missing. Please set MONGO_URI in your environment variables."
    );
  }

<<<<<<< HEAD
  await mongoose.connect(dbUrl);
  console.log("Connected to MongoDB successfully");
=======
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
>>>>>>> ed4a2f0b729c2bcee7194781e48511565664ca6f
}
