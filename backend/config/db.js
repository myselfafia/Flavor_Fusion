import mongoose from "mongoose";

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

  await mongoose.connect(dbUrl);
  console.log("Connected to MongoDB successfully");
}
