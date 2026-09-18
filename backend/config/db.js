import mongoose from "mongoose";

export async function connectDatabase() {
  const dbUrl = process.env.DATABASE_URL || process.env.MONGODB_URI;
  if (!dbUrl) {
    throw new Error("DATABASE_URL or MONGODB_URI is missing in backend/.env.");
  }

  await mongoose.connect(dbUrl);
  console.log("Connected to database");
}
