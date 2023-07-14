const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authenticateToken");
const Expense = require("../models/Expense");

router.get("/", authenticateToken, async (req, res) => {
  // GET /api/expenses route handler code
  try {
    const expenses = await Expense.find({ userId: req.user.userId });
    res.header("Access-Control-Allow-Origin", "*").json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
});

router.post("/", authenticateToken, async (req, res) => {
  // POST /api/expenses route handler code
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

router.put("/:id", async (req, res) => {
  // PUT /api/expenses/:id route handler code
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

router.delete("/:id", async (req, res) => {
  // DELETE /api/expenses/:id route handler code
  try {
    const { id } = req.params;
    await Expense.findByIdAndDelete(id);
    res.header("Access-Control-Allow-Origin", "*").sendStatus(204);
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({ error: "Failed to delete expense" });
  }
});

module.exports = router;
