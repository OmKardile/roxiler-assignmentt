import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const apiClient = () =>
  axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

const BLUE = "#1d4ed8";
const inputStyle = {
  width: "100%",
  padding: 8,
  marginTop: 4,
  boxSizing: "border-box",
  border: "1px solid #cbd5e1",
  borderRadius: 4,
};
const btnStyle = (bg = BLUE) => ({
  padding: "7px 14px",
  background: bg,
  color: "#fff",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
});
const thStyle = {
  padding: "8px 10px",
  border: "1px solid #ddd",
  background: "#bfdbfe",
  cursor: "pointer",
};
const tdStyle = { padding: "7px 10px", border: "1px solid #ddd" };

const TABS = ["stats", "users", "stores", "addUser", "addStore"];
const TAB_LABELS = {
  stats: "Stats",
  users: "Users",
  stores: "Stores",
  addUser: "Add User",
  addStore: "Add Store",
};

const validateUser = (f) => {
  if (f.name.length < 20 || f.name.length > 60)
    return "Name must be 20–60 characters";
  if (f.address.length > 400) return "Address max 400 characters";
  if (!/^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,16}$/.test(f.password))
    return "Password: 8–16 chars, 1 uppercase, 1 special";
  return "";
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("stats");
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedUser, setSelUser] = useState(null);
  const [msg, setMsg] = useState("");

  const [uFilter, setUFilter] = useState({
    name: "",
    email: "",
    address: "",
    role: "",
  });
  const [uSort, setUSort] = useState({ sortBy: "name", order: "asc" });
  const [sFilter, setSFilter] = useState({ name: "", email: "", address: "" });
  const [sSort, setSSort] = useState({ sortBy: "name", order: "asc" });

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    role: "user",
  });
  const [newStore, setNewStore] = useState({
    name: "",
    email: "",
    address: "",
    owner_id: "",
  });
  const [formErr, setFormErr] = useState("");

  const api = apiClient();

  useEffect(() => {
    if (tab === "stats") fetchStats();
    if (tab === "users") fetchUsers();
    if (tab === "stores") fetchStores();
  }, [tab]);

  useEffect(() => {
    if (tab === "users") fetchUsers();
  }, [uSort]);
  useEffect(() => {
    if (tab === "stores") fetchStores();
  }, [sSort]);

  const fetchStats = async () => {
    const r = await api.get("/admin/stats");
    setStats(r.data);
  };
  const fetchUsers = async () => {
    const r = await api.get("/admin/users", {
      params: { ...uFilter, ...uSort },
    });
    setUsers(r.data);
  };
  const fetchStores = async () => {
    const r = await api.get("/admin/stores", {
      params: { ...sFilter, ...sSort },
    });
    setStores(r.data);
  };
  const viewUser = async (id) => {
    const r = await api.get(`/admin/users/${id}`);
    setSelUser(r.data);
    setTab("userDetail");
  };

  const toggleUSort = (col) =>
    setUSort((p) => ({
      sortBy: col,
      order: p.sortBy === col && p.order === "asc" ? "desc" : "asc",
    }));
  const toggleSSort = (col) =>
    setSSort((p) => ({
      sortBy: col,
      order: p.sortBy === col && p.order === "asc" ? "desc" : "asc",
    }));
  const sortArrow = (sort, col) =>
    sort.sortBy === col ? (sort.order === "asc" ? " ↑" : " ↓") : "";

  const handleAddUser = async (e) => {
    e.preventDefault();
    const err = validateUser(newUser);
    if (err) return setFormErr(err);
    setFormErr("");
    try {
      await api.post("/admin/users", newUser);
      setMsg("User added successfully!");
      setNewUser({
        name: "",
        email: "",
        password: "",
        address: "",
        role: "user",
      });
    } catch (err) {
      setFormErr(err.response?.data?.message || "Error");
    }
  };

  const handleAddStore = async (e) => {
    e.preventDefault();
    setFormErr("");
    try {
      await api.post("/admin/stores", newStore);
      setMsg("Store added successfully!");
      setNewStore({ name: "", email: "", address: "", owner_id: "" });
    } catch (err) {
      setFormErr(err.response?.data?.message || "Error");
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
        background: "#eff6ff",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: BLUE,
          color: "#fff",
          padding: "12px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ margin: 0 }}>🛡️ Admin Dashboard</h2>
        <span>
          {localStorage.getItem("name")} &nbsp;
          <button
            onClick={logout}
            style={{
              background: "#fff",
              color: BLUE,
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
          background: "#dbeafe",
          flexWrap: "wrap",
        }}
      >
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              setMsg("");
              setFormErr("");
            }}
            style={{
              padding: "6px 14px",
              background: tab === t ? BLUE : "#fff",
              color: tab === t ? "#fff" : BLUE,
              border: `1px solid ${BLUE}`,
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      <div style={{ padding: 24 }}>
        {msg && (
          <div
            style={{
              marginBottom: 12,
              padding: 10,
              background: "#dcfce7",
              borderRadius: 4,
              color: "#166534",
            }}
          >
            {msg}
          </div>
        )}

        {/* ── STATS ── */}
        {tab === "stats" && (
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {[
              ["Total Users", stats.totalUsers, "👤"],
              ["Total Stores", stats.totalStores, "🏪"],
              ["Total Ratings", stats.totalRatings, "⭐"],
            ].map(([label, val, icon]) => (
              <div
                key={label}
                style={{
                  flex: 1,
                  minWidth: 180,
                  background: "#fff",
                  padding: 28,
                  borderRadius: 8,
                  textAlign: "center",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                }}
              >
                <div style={{ fontSize: 32 }}>{icon}</div>
                <div style={{ fontSize: 36, fontWeight: 700, color: BLUE }}>
                  {val ?? "—"}
                </div>
                <div style={{ color: "#64748b" }}>{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── USERS ── */}
        {tab === "users" && (
          <>
            <h3>All Users</h3>
            <div
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 12,
                flexWrap: "wrap",
              }}
            >
              {["name", "email", "address"].map((f) => (
                <input
                  key={f}
                  placeholder={f}
                  value={uFilter[f]}
                  onChange={(e) =>
                    setUFilter({ ...uFilter, [f]: e.target.value })
                  }
                  style={{
                    padding: 6,
                    border: "1px solid #cbd5e1",
                    borderRadius: 4,
                  }}
                />
              ))}
              <select
                value={uFilter.role}
                onChange={(e) =>
                  setUFilter({ ...uFilter, role: e.target.value })
                }
                style={{ padding: 6 }}
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
                <option value="store_owner">Store Owner</option>
              </select>
              <button onClick={fetchUsers} style={btnStyle()}>
                Filter
              </button>
            </div>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                background: "#fff",
              }}
            >
              <thead>
                <tr>
                  {["name", "email", "address", "role"].map((col) => (
                    <th
                      key={col}
                      style={thStyle}
                      onClick={() => toggleUSort(col)}
                    >
                      {col.charAt(0).toUpperCase() + col.slice(1)}
                      {sortArrow(uSort, col)}
                    </th>
                  ))}
                  <th style={thStyle}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ background: "#fff" }}>
                    <td style={tdStyle}>{u.name}</td>
                    <td style={tdStyle}>{u.email}</td>
                    <td style={tdStyle}>{u.address}</td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: 10,
                          background:
                            u.role === "admin"
                              ? "#bfdbfe"
                              : u.role === "store_owner"
                                ? "#ede9fe"
                                : "#dcfce7",
                          fontSize: 13,
                        }}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => viewUser(u.id)}
                        style={{
                          ...btnStyle(),
                          padding: "4px 10px",
                          fontSize: 13,
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* ── USER DETAIL ── */}
        {tab === "userDetail" && selectedUser && (
          <div
            style={{
              maxWidth: 460,
              background: "#fff",
              padding: 24,
              borderRadius: 8,
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            }}
          >
            <button
              onClick={() => setTab("users")}
              style={{ marginBottom: 14, cursor: "pointer" }}
            >
              ← Back to Users
            </button>
            <h3 style={{ marginTop: 0 }}>User Detail</h3>
            {[
              ["Name", selectedUser.name],
              ["Email", selectedUser.email],
              ["Address", selectedUser.address],
              ["Role", selectedUser.role],
            ].map(([k, v]) => (
              <p key={k} style={{ margin: "6px 0" }}>
                <b>{k}:</b> {v}
              </p>
            ))}
            {selectedUser.stores?.length > 0 && (
              <>
                <hr />
                <h4>Owned Stores</h4>
                {selectedUser.stores.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      background: "#eff6ff",
                      padding: 10,
                      borderRadius: 6,
                      marginBottom: 8,
                    }}
                  >
                    <b>{s.name}</b> — Avg Rating:{" "}
                    {s.avg_rating ?? "No ratings yet"}
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* ── STORES ── */}
        {tab === "stores" && (
          <>
            <h3>All Stores</h3>
            <div
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 12,
                flexWrap: "wrap",
              }}
            >
              {["name", "email", "address"].map((f) => (
                <input
                  key={f}
                  placeholder={f}
                  value={sFilter[f]}
                  onChange={(e) =>
                    setSFilter({ ...sFilter, [f]: e.target.value })
                  }
                  style={{
                    padding: 6,
                    border: "1px solid #cbd5e1",
                    borderRadius: 4,
                  }}
                />
              ))}
              <button onClick={fetchStores} style={btnStyle()}>
                Filter
              </button>
            </div>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                background: "#fff",
              }}
            >
              <thead>
                <tr>
                  {["name", "email", "address"].map((col) => (
                    <th
                      key={col}
                      style={thStyle}
                      onClick={() => toggleSSort(col)}
                    >
                      {col.charAt(0).toUpperCase() + col.slice(1)}
                      {sortArrow(sSort, col)}
                    </th>
                  ))}
                  <th style={thStyle}>Avg Rating</th>
                </tr>
              </thead>
              <tbody>
                {stores.map((s) => (
                  <tr key={s.id}>
                    <td style={tdStyle}>{s.name}</td>
                    <td style={tdStyle}>{s.email}</td>
                    <td style={tdStyle}>{s.address}</td>
                    <td style={tdStyle}>
                      {s.avg_rating ? `⭐ ${s.avg_rating}` : "No ratings"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* ── ADD USER ── */}
        {tab === "addUser" && (
          <div style={{ maxWidth: 440 }}>
            <h3>Add New User</h3>
            <form onSubmit={handleAddUser}>
              {[
                ["name", "text", "Name (20–60 chars)"],
                ["email", "email", "Email"],
                ["password", "password", "Password"],
                ["address", "text", "Address"],
              ].map(([f, t, label]) => (
                <div key={f} style={{ marginBottom: 12 }}>
                  <label>{label}</label>
                  <input
                    type={t}
                    value={newUser[f]}
                    onChange={(e) =>
                      setNewUser({ ...newUser, [f]: e.target.value })
                    }
                    required
                    style={inputStyle}
                  />
                </div>
              ))}
              <div style={{ marginBottom: 12 }}>
                <label>Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                  style={inputStyle}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="store_owner">Store Owner</option>
                </select>
              </div>
              {formErr && (
                <p style={{ color: "#dc2626", fontSize: 14 }}>{formErr}</p>
              )}
              <button type="submit" style={btnStyle()}>
                Add User
              </button>
              {newUser.role === "store_owner" && (
                <p style={{ fontSize: 13, color: "#64748b", marginTop: 8 }}>
                  💡 After adding, go to <b>Add Store</b> tab and link this
                  owner's ID.
                </p>
              )}
            </form>
          </div>
        )}

        {/* ── ADD STORE ── */}
        {tab === "addStore" && (
          <div style={{ maxWidth: 440 }}>
            <h3>Add New Store</h3>
            <form onSubmit={handleAddStore}>
              {[
                ["name", "text", "Store Name (20–60 chars)"],
                ["email", "email", "Store Email"],
                ["address", "text", "Address"],
              ].map(([f, t, label]) => (
                <div key={f} style={{ marginBottom: 12 }}>
                  <label>{label}</label>
                  <input
                    type={t}
                    value={newStore[f]}
                    onChange={(e) =>
                      setNewStore({ ...newStore, [f]: e.target.value })
                    }
                    required
                    style={inputStyle}
                  />
                </div>
              ))}
              <div style={{ marginBottom: 12 }}>
                <label>
                  Owner User ID{" "}
                  <span style={{ color: "#94a3b8" }}>
                    (optional — check Users list for ID)
                  </span>
                </label>
                <input
                  type="number"
                  value={newStore.owner_id}
                  onChange={(e) =>
                    setNewStore({ ...newStore, owner_id: e.target.value })
                  }
                  style={inputStyle}
                />
              </div>
              {formErr && (
                <p style={{ color: "#dc2626", fontSize: 14 }}>{formErr}</p>
              )}
              <button type="submit" style={btnStyle()}>
                Add Store
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
