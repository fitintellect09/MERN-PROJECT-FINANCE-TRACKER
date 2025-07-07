import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Signin = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("https://mern-project-finance-tracker-backend.onrender.com/api/auth/signin", form);
      setMessage("Logged in successfully");
      localStorage.setItem("token", res.data.token);
      const tokenData = JSON.parse(atob(res.data.token.split('.')[1]));
      localStorage.setItem("userId", tokenData.id);
      window.location.href = "/";
    } catch (err) {
      setMessage(err.response?.data?.msg || "Signin failed");
    }
  };

  return (
    <div>
      <h2>Signin</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          required
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <div>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            required
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>
        <button type="submit">Login</button>
      </form>
      <p>{message}</p>
      <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
    </div>
  );
};

export default Signin;
