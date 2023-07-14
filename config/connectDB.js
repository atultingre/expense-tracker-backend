const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose
      .connect(process.env.DATABASE_URI)
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};

mongoose.connection.on("disconnected", () => {
  console.log("DB is disconnected");
});

mongoose.connection.on("connected", () => {
  console.log("Connected to DB");
});

module.exports = connectDB;
