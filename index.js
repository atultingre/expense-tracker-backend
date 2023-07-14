require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const app = express();
const connectDB = require("./config/db");

// Parse request body as JSON
app.use(express.json());

// Enable CORS
app.use(cors());

// Serve static files
app.use("/", express.static(path.join(__dirname, "public")));

// Connect to MongoDB
connectDB();

// Define API endpoints
app.use("/", require("./routes/root"));
app.use("/api/expenses", require("./routes/expenses"));
app.use("/api/", require("./routes/auth"));

// Handle 404 Not Found
app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ message: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
