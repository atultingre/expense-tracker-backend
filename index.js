require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const app = express();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Parse request body as JSON
app.use(express.json());

// app.use(cors())

app.use(
  cors({
    origin: ["https://spendanalyzer.netlify.app", "http://localhost:3000", "*"],
    methods: "GET,POST,PUT,DELETE,HEAD,DELETE",
    credentials: true,
  })
);

const Expense = mongoose.model("Expense", {
  title: String,
  amount: Number,
  date: Date,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const User = mongoose.model("User", {
  username: String,
  password: String,
});


app.use("/", express.static(path.join(__dirname, "public")));
// Enable preflight requests
app.options("/api/register", cors());


// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://atultingre:atultingre@cluster0.qxl77bm.mongodb.net/expensetracker?retryWrites=true&w=majority");
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};


// routes
app.use("/", require("./routes/root"));



// Middleware to verify the JWT token and extract the user ID
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Forbidden" });
    }

    req.user = user;
    next();
  });
};

// Define API endpoints
// Register user
app.post(`/api/register`, async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if the username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      username,
      password: hashedPassword,
    });

    // Save the user to the database
    await newUser.save();
    // Generate a JWT token
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET);

    res.header("Access-Control-Allow-Origin", "*").json({ token });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Failed to register user" });
  }
});

// Login user
app.post(`/api/login`, async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Compare the provided password with the stored password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    res.header("Access-Control-Allow-Origin", "*").json({ token });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Failed to login" });
  }
});

// GET THE EXPENSES
app.get(`/api/expenses`, authenticateToken, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user.userId });
    res.header("Access-Control-Allow-Origin", "*").json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
});

// POST THE EXPENSES
app.post(`/api/expenses`, authenticateToken, async (req, res) => {
  try {
    const expense = new Expense({
      ...req.body,
      userId: req.user.userId,
    });
    await expense.save();
    res.header("Access-Control-Allow-Origin", "*").json(expense);
  } catch (error) {
    console.error("Error saving expense:", error);
    res.status(500).json({ error: "Failed to save expense" });
  }
});

// UPDATE THE EXPENSES
app.put(`/api/expenses/:id`, async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.header("Access-Control-Allow-Origin", "*").json(expense);
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).json({ error: "Failed to update expense" });
  }
});

// DELETE THE EXPENSES
app.delete(`/api/expenses/:id`, async (req, res) => {
  try {
    const { id } = req.params;
    await Expense.findByIdAndDelete(id);
    res.header("Access-Control-Allow-Origin", "*").sendStatus(204);
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({ error: "Failed to delete expense" });
  }
});

// Add this route handler before starting the server

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
  connectDB();
});
