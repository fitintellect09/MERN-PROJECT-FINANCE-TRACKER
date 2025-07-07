import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const FrontPage = () => {
  const [budget, setBudget] = useState("");
  const [hasBudget, setHasBudget] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ title: "", amount: "", category: "Food" });
  const [categories, setCategories] = useState(["Food", "Shopping", "Travel", "Rent"]);
  const [newCategory, setNewCategory] = useState("");

  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchBudgetAndExpenses = async () => {
      try {
        const userRes = await axios.get("http://localhost:5000/api/finance/budget", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userBudget = userRes.data.budget;
        if (userBudget > 0) {
          setBudget(userBudget);
          setHasBudget(true);
        }

        const expenseRes = await axios.get(`http://localhost:5000/api/finance/all?userId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setExpenses(expenseRes.data);
      } catch (err) {
        console.error("Error loading data:", err);
      }
    };

    fetchBudgetAndExpenses();
  }, [token, userId]);

  const handleBudgetSubmit = async (e) => {
    e.preventDefault();
    try {
      const cleanBudget = parseInt(budget.toString().replace(/^0+/, ""), 10);
      const res = await axios.post(
        "http://localhost:5000/api/finance/budget",
        { budget: cleanBudget },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBudget(cleanBudget);
      setHasBudget(true);
    } catch (err) {
      console.error("Failed to save budget:", err);
    }
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    try {
      const expenseWithDate = {
        ...form,
        userId,
        date: new Date().toISOString(),
      };
      const res = await axios.post("http://localhost:5000/api/finance/add", expenseWithDate, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenses([...expenses, res.data]);
      setForm({ title: "", amount: "", category: categories[0] });
    } catch (err) {
      console.error("Failed to add expense:", err);
    }
  };

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory("");
    }
  };

  const handleReset = async () => {
  const confirm = window.confirm("Are you sure you want to reset everything?");
  if (confirm) {
    try {
      await axios.delete("http://localhost:5000/api/finance/reset", {
        headers: { Authorization: `Bearer ${token}` },
      });

      localStorage.clear(); // 🔥 Remove all local storage (including token)
      navigate("/signin");  // ✅ Redirect to signin page
    } catch (err) {
      console.error("Failed to reset:", err);
      alert("Reset failed. Please try again.");
    }
  }
};


  const handleSignOut = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      localStorage.clear();
      navigate("/signin");
    }
  };

  const totalSpent = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const remaining = budget - totalSpent;

  const daysLeft = () => {
    const today = new Date();
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return endOfMonth.getDate() - today.getDate();
  };

  const dataByCategory = categories.map((cat) => {
    const total = expenses.filter((e) => e.category === cat).reduce((sum, e) => sum + Number(e.amount), 0);
    return { name: cat, value: total };
  }).filter(d => d.value > 0);

  return (
    <div className="frontpage-container">
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
        <button onClick={handleReset}>Reset</button>
        <button onClick={handleSignOut}>Sign Out</button>
      </div>

      {!hasBudget ? (
        <div>
          <h2>Welcome to Your Finance Tracker</h2>
          <p style={{ color: "red", fontWeight: "bold" }}>
            ⚠️ You haven't set your budget plan for this month. Set it now to begin tracking.
          </p>
          <form onSubmit={handleBudgetSubmit}>
            <label>Enter your monthly budget: </label>
            <input
              type="number"
              value={budget}
              min="1"
              onChange={(e) => setBudget(e.target.value.replace(/^0+/, ""))}
              required
            />
            <button type="submit">Save Budget</button>
          </form>
        </div>
      ) : (
        <div>
          <h2>Welcome to Your Finance Tracker</h2>
          <p><strong>Total Spent:</strong> ₹{totalSpent}</p>
          <p>
            <strong>Remaining:</strong> ₹{remaining}{" "}
            {remaining < 0 && <span style={{ color: "red" }}>(Overspent)</span>}
          </p>
          <p><strong>Days left this month:</strong> {daysLeft()}</p>

          <form onSubmit={handleExpenseSubmit} style={{ marginTop: "1rem" }}>
            <input
              name="title"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <input
              name="amount"
              placeholder="Amount"
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
            <button type="submit">Add Expense</button>
          </form>

          <div style={{ marginTop: "1rem" }}>
            <input
              placeholder="Add new category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <button onClick={handleAddCategory}>+ Add Category</button>
          </div>

          <ul style={{ marginTop: "1rem" }}>
            {expenses.map((e, idx) => (
              <li key={idx}>
                {e.title} - ₹{e.amount} [{e.category}] on {new Date(e.date).toLocaleDateString()}
              </li>
            ))}
          </ul>

          <div style={{ marginTop: "2rem" }}>
            <h3>Spending Report</h3>
            <PieChart width={400} height={300}>
              <Pie
                data={dataByCategory}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
              >
                {dataByCategory.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>
        </div>
      )}
    </div>
  );
};

export default FrontPage;
