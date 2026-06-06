import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const validate = (form) => {
  if (form.name.length < 20 || form.name.length > 60)
    return "Name must be 20–60 characters";
  if (form.address.length > 400) return "Address max 400 characters";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Invalid email";
  if (!/^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,16}$/.test(form.password))
    return "Password: 8–16 chars, 1 uppercase, 1 special character (!@#$%^&*)";
  return "";
};

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate(form);
    if (err) return setError(err);
    setError("");
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, form);
      setSuccess("Registered! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

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
          width: 380,
          padding: 32,
          background: "#fff",
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Create Account</h2>
        <form onSubmit={handleSubmit}>
          {[
            ["name", "text", "Name (20–60 chars)"],
            ["email", "email", "Email"],
            ["address", "text", "Address (max 400 chars)"],
            ["password", "password", "Password (8–16, 1 uppercase, 1 special)"],
          ].map(([field, type, label]) => (
            <div key={field} style={{ marginBottom: 14 }}>
              <label>{label}</label>
              <br />
              <input
                type={type}
                value={form[field]}
                onChange={set(field)}
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
          ))}
          {error && <p style={{ color: "#dc2626", fontSize: 14 }}>{error}</p>}
          {success && (
            <p style={{ color: "#16a34a", fontSize: 14 }}>{success}</p>
          )}
          <button
            type="submit"
            style={{
              width: "100%",
              padding: 10,
              background: "#16a34a",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 15,
            }}
          >
            Register
          </button>
        </form>
        <p style={{ textAlign: "center", marginTop: 16, fontSize: 14 }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
