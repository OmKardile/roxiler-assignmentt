import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        { email, password },
      );
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("name", res.data.name);
      const dest = {
        admin: "/admin",
        user: "/user",
        store_owner: "/store-owner",
      };
      navigate(dest[res.data.role] || "/login");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f1f5f9",
      }}
    >
      <div
        style={{
          width: 360,
          padding: 32,
          background: "#fff",
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ marginTop: 0, textAlign: "center" }}>Store Rating App</h2>
        <p style={{ textAlign: "center", color: "#64748b", marginTop: -8 }}>
          Sign in to continue
        </p>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label>Email</label>
            <br />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: 8,
                marginTop: 4,
                boxSizing: "border-box",
                border: "1px solid #cbd5e1",
                borderRadius: 4,
              }}
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label>Password</label>
            <br />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: 8,
                marginTop: 4,
                boxSizing: "border-box",
                border: "1px solid #cbd5e1",
                borderRadius: 4,
              }}
            />
          </div>
          {error && <p style={{ color: "#dc2626", fontSize: 14 }}>{error}</p>}
          <button
            type="submit"
            style={{
              width: "100%",
              padding: 10,
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 15,
            }}
          >
            Login
          </button>
        </form>
        <p style={{ textAlign: "center", marginTop: 16, fontSize: 14 }}>
          New user? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}
