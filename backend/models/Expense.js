const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  title: String,
  amount: Number,
  category: String,
  userId: String,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Expense", expenseSchema);