import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const apiClient = () =>
  axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

const GREEN = "#15803d";
const btnStyle = {
  padding: "6px 14px",
  background: GREEN,
  color: "#fff",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
};

export default function UserDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("stores");
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState({ name: "", address: "" });
  const [ratings, setRatings] = useState({});
  const [msg, setMsg] = useState("");
  const [pwForm, setPwForm] = useState({ oldPassword: "", newPassword: "" });
  const [pwMsg, setPwMsg] = useState("");

  const api = apiClient();

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    const res = await api.get("/user/stores", { params: search });
    setStores(res.data);
    const init = {};
    res.data.forEach((s) => {
      init[s.id] = s.my_rating ?? "";
    });
    setRatings(init);
  };

  const submitRating = async (store) => {
    const rating = parseInt(ratings[store.id]);
    if (!rating || rating < 1 || rating > 5)
      return setMsg("Select a rating between 1 and 5");
    try {
      if (store.my_rating) {
        await api.put(`/user/ratings/${store.id}`, { rating });
      } else {
        await api.post("/user/ratings", { store_id: store.id, rating });
      }
      setMsg("Rating saved!");
      fetchStores();
    } catch (err) {
      setMsg(err.response?.data?.message || "Error saving rating");
    }
  };

  const updatePassword = async (e) => {
    e.preventDefault();
    try {
      await api.put("/auth/password", pwForm);
      setPwMsg("Password updated successfully!");
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
        background: "#f0fdf4",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: GREEN,
          color: "#fff",
          padding: "12px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ margin: 0 }}>🛍️ User Dashboard</h2>
        <span>
          {localStorage.getItem("name")} &nbsp;
          <button
            onClick={logout}
            style={{
              background: "#fff",
              color: GREEN,
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
          background: "#dcfce7",
        }}
      >
        {[
          ["stores", "Browse Stores"],
          ["password", "Change Password"],
        ].map(([t, label]) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              setMsg("");
              setPwMsg("");
            }}
            style={{
              padding: "6px 14px",
              background: tab === t ? GREEN : "#fff",
              color: tab === t ? "#fff" : GREEN,
              border: `1px solid ${GREEN}`,
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ padding: 24 }}>
        {/* ── STORES ── */}
        {tab === "stores" && (
          <>
            <div
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 16,
                flexWrap: "wrap",
              }}
            >
              <input
                placeholder="Search by name"
                value={search.name}
                onChange={(e) => setSearch({ ...search, name: e.target.value })}
                style={{
                  padding: 7,
                  border: "1px solid #cbd5e1",
                  borderRadius: 4,
                }}
              />
              <input
                placeholder="Search by address"
                value={search.address}
                onChange={(e) =>
                  setSearch({ ...search, address: e.target.value })
                }
                style={{
                  padding: 7,
                  border: "1px solid #cbd5e1",
                  borderRadius: 4,
                }}
              />
              <button onClick={fetchStores} style={btnStyle}>
                Search
              </button>
            </div>
            {msg && <p style={{ color: "#16a34a", marginBottom: 12 }}>{msg}</p>}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 16,
              }}
            >
              {stores.map((store) => (
                <div
                  key={store.id}
                  style={{
                    background: "#fff",
                    padding: 18,
                    borderRadius: 8,
                    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                    borderTop: `3px solid ${GREEN}`,
                  }}
                >
                  <h3 style={{ margin: "0 0 6px", color: GREEN }}>
                    {store.name}
                  </h3>
                  <p
                    style={{ margin: "4px 0", color: "#64748b", fontSize: 14 }}
                  >
                    {store.address}
                  </p>
                  <p style={{ margin: "6px 0" }}>
                    ⭐ Avg: <b>{store.avg_rating ?? "No ratings yet"}</b>
                  </p>
                  {store.my_rating ? (
                    <p style={{ margin: "4px 0", color: GREEN, fontSize: 14 }}>
                      Your rating:{" "}
                      <b>
                        {"⭐".repeat(store.my_rating)} ({store.my_rating})
                      </b>
                    </p>
                  ) : (
                    <p
                      style={{
                        margin: "4px 0",
                        color: "#94a3b8",
                        fontSize: 13,
                      }}
                    >
                      You haven't rated this store
                    </p>
                  )}
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      marginTop: 12,
                      alignItems: "center",
                    }}
                  >
                    <select
                      value={ratings[store.id] || ""}
                      onChange={(e) =>
                        setRatings({ ...ratings, [store.id]: e.target.value })
                      }
                      style={{ padding: 6, borderRadius: 4 }}
                    >
                      <option value="">Select</option>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n} ⭐
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => submitRating(store)}
                      style={btnStyle}
                    >
                      {store.my_rating ? "Update" : "Submit"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
                        : "#16a34a",
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
