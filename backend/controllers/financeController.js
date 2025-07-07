const Expense = require("../models/Expense");
const User = require("../models/user");

exports.addExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const newExpense = new Expense({ ...req.body, userId });
    const saved = await newExpense.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Add expense error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await Expense.find({ userId });
    res.status(200).json(data);
  } catch (err) {
    console.error("Get expenses error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.setBudget = async (req, res) => {
  try {
    const userId = req.user.id;
    const { budget } = req.body;
    await User.findByIdAndUpdate(userId, { budget });
    res.json({ msg: "Budget updated" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getBudget = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ budget: user.budget });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};
exports.resetFinanceData = async (req, res) => {
  try {
    const userId = req.user.id;

    // Delete all expenses of the user
    await Expense.deleteMany({ userId });

    // Remove budget from user record
    await User.findByIdAndUpdate(userId, { $unset: { budget: 1 } });

    res.json({ msg: "User budget and expenses have been reset." });
  } catch (err) {
    console.error("Reset error:", err);
    res.status(500).json({ msg: "Failed to reset data." });
  }
};
