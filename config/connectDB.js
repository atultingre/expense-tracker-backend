const mongoose = require("mongoose");
const DATABASE_URI = process.env.DATABASE_URI;

const connectDB = async () => {
  try {
    await mongoose
      .connect(process.env.DATABASE_URI)
      // .then(() => console.log("Connected to MongoDB"));
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};

module.exports = connectDB;
