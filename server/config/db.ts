import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("MongoDB connection established");
    });
    await mongoose.connect(process.env.MONGO_URI as string);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Exit process with failure
  }
};

export const closeDB = async () => {
  try {
    await mongoose.connection.close();
    console.log("💾 MongoDB connection closed cleanly.");
  } catch (error) {
    console.error("Error closing MongoDB connection:", error);
  }
};