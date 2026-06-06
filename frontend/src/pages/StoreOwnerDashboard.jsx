import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const apiClient = () =>
  axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

const PURPLE = "#7c3aed";
const btnStyle = {
  padding: "6px 14px",
  background: PURPLE,
  color: "#fff",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
};

export default function StoreOwnerDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("store");
  const [pwForm, setPwForm] = useState({ oldPassword: "", newPassword: "" });
  const [pwMsg, setPwMsg] = useState("");
  const [err, setErr] = useState("");

  const api = apiClient();

  useEffect(() => {
    api
      .get("/store-owner/dashboard")
      .then((r) => setData(r.data))
      .catch(() => setErr("Could not load store data."));
  }, []);

  const updatePassword = async (e) => {
    e.preventDefault();
    try {
      await api.put("/auth/password", pwForm);
      setPwMsg("Password updated!");
      setPwForm({ oldPassword: "", newPassword: "" });
    } catch (err) {
      setPwMsg(err.response?.data?.message || "Error");
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div
      style={{
        fontFamily: "sans-serif",
        minHeight: "100vh",
        background: "#faf5ff",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: PURPLE,
          color: "#fff",
          padding: "12px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ margin: 0 }}>🏪 Store Owner Dashboard</h2>
        <span>
          {localStorage.getItem("name")} &nbsp;
          <button
            onClick={logout}
            style={{
              background: "#fff",
              color: PURPLE,
              border: "none",
              padding: "4px 12px",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </span>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 8,
          padding: "10px 24px",
          background: "#ede9fe",
        }}
      >
        {[
          ["store", "My Store"],
          ["password", "Change Password"],
        ].map(([t, label]) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              setPwMsg("");
            }}
            style={{
              padding: "6px 14px",
              background: tab === t ? PURPLE : "#fff",
              color: tab === t ? "#fff" : PURPLE,
              border: `1px solid ${PURPLE}`,
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ padding: 24 }}>
        {err && <p style={{ color: "#dc2626" }}>{err}</p>}

        {/* ── STORE DASHBOARD ── */}
        {tab === "store" && data && (
          <>
            <div
              style={{
                background: "#fff",
                padding: 20,
                borderRadius: 8,
                maxWidth: 420,
                marginBottom: 24,
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                borderTop: `3px solid ${PURPLE}`,
              }}
            >
              <h3 style={{ margin: "0 0 8px", color: PURPLE }}>
                {data.store.name}
              </h3>
              <p style={{ margin: "4px 0", color: "#64748b" }}>
                {data.store.address}
              </p>
              <p style={{ fontSize: 22, margin: "12px 0 4px" }}>
                ⭐ <b>{data.avg_rating ?? "—"}</b>{" "}
                <span style={{ fontSize: 14, color: "#94a3b8" }}>
                  avg rating
                </span>
              </p>
              <p style={{ margin: 0, color: "#64748b" }}>
                Total ratings received: <b>{data.ratings.length}</b>
              </p>
            </div>

            <h3>Ratings Received</h3>
            {data.ratings.length === 0 ? (
              <p style={{ color: "#94a3b8" }}>
                No ratings yet. Once users rate your store, they'll appear here.
              </p>
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  background: "#fff",
                  maxWidth: 700,
                }}
              >
                <thead>
                  <tr>
                    {["User Name", "Email", "Rating", "Date"].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "8px 10px",
                          border: "1px solid #ddd",
                          background: "#ede9fe",
                          textAlign: "left",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.ratings.map((r, i) => (
                    <tr key={i}>
                      <td
                        style={{
                          padding: "7px 10px",
                          border: "1px solid #ddd",
                        }}
                      >
                        {r.name}
                      </td>
                      <td
                        style={{
                          padding: "7px 10px",
                          border: "1px solid #ddd",
                        }}
                      >
                        {r.email}
                      </td>
                      <td
                        style={{
                          padding: "7px 10px",
                          border: "1px solid #ddd",
                        }}
                      >
                        {"⭐".repeat(r.rating)} ({r.rating})
                      </td>
                      <td
                        style={{
                          padding: "7px 10px",
                          border: "1px solid #ddd",
                        }}
                      >
                        {new Date(r.created_at).toLocaleDateString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}

        {/* ── CHANGE PASSWORD ── */}
        {tab === "password" && (
          <div style={{ maxWidth: 400 }}>
            <h3>Change Password</h3>
            <form onSubmit={updatePassword}>
              {[
                ["oldPassword", "Current Password"],
                ["newPassword", "New Password"],
              ].map(([f, label]) => (
                <div key={f} style={{ marginBottom: 12 }}>
                  <label>{label}</label>
                  <br />
                  <input
                    type="password"
                    value={pwForm[f]}
                    onChange={(e) =>
                      setPwForm({ ...pwForm, [f]: e.target.value })
                    }
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
              {pwMsg && (
                <p
                  style={{
                    color:
                      pwMsg.includes("Error") || pwMsg.includes("incorrect")
                        ? "#dc2626"
                        : "#7c3aed",
                  }}
                >
                  {pwMsg}
                </p>
              )}
              <button type="submit" style={btnStyle}>
                Update Password
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
