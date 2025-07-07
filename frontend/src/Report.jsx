import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Link } from "react-router-dom";

ChartJS.register(ArcElement, Tooltip, Legend);

const Report = () => {
  const [expenses, setExpenses] = useState([]);
  const [budget, setBudget] = useState(0);

  useEffect(() => {
    const exps = JSON.parse(localStorage.getItem("expenses")) || [];
    setExpenses(exps);

    const bud = localStorage.getItem("monthlyBudget");
    if (bud) setBudget(Number(bud));
  }, []);

  const totalSpent = expenses.reduce((acc, e) => acc + Number(e.amount), 0);
  const remaining = budget - totalSpent;

  const daysLeft = () => {
    const today = new Date();
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return end.getDate() - today.getDate();
  };

  const categoryTotals = {};
  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + Number(e.amount);
  });

  const pieData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        label: "Spending by Category",
        data: Object.values(categoryTotals),
        backgroundColor: [
          "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div style={{ maxWidth: "700px", margin: "2rem auto", textAlign: "center" }}>
      <h2>📊 Expense Report</h2>
      <p><strong>Budget:</strong> ₹{budget}</p>
      <p><strong>Total Spent:</strong> ₹{totalSpent}</p>
      <p><strong>Remaining:</strong> ₹{remaining} {remaining < 0 && <span style={{ color: "red" }}>(Overspent)</span>}</p>
      <p><strong>Days Left in Month:</strong> {daysLeft()}</p>

      <div style={{ maxWidth: "400px", margin: "2rem auto" }}>
        <Pie data={pieData} />
      </div>

      <h3>📌 Expense List</h3>
      <ul style={{ textAlign: "left" }}>
        {expenses.map((e, idx) => (
          <li key={idx}>
            {e.title} - ₹{e.amount} [{e.category}] on {new Date(e.date).toLocaleDateString()}
          </li>
        ))}
      </ul>

      <Link to="/">
        <button style={{ marginTop: "1rem" }}>← Back</button>
      </Link>
    </div>
  );
};

export default Report;
