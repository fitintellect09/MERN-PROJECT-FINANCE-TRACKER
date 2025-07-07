const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const {
  addExpense,
  getExpenses,
  setBudget,
  getBudget,
  resetFinanceData, // ✅ Add this
} = require("../controllers/financeController");

router.post("/add", verifyToken, addExpense);
router.get("/all", verifyToken, getExpenses);
router.post("/budget", verifyToken, setBudget);
router.get("/budget", verifyToken, getBudget);
router.delete("/reset", verifyToken, resetFinanceData); // ✅ NEW RESET ROUTE

module.exports = router;
