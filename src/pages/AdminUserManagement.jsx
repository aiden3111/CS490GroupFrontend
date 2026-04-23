import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Landingcss.css";

const AdminUserManagement = () => {
    const { clientId } = useParams();
    const navigate = useNavigate();
    const userRole = localStorage.getItem("userRole");

    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const loggedInId = localStorage.getItem("authenticatedClientId");
        if (loggedInId !== clientId) {
            navigate(`/UserProfile/${loggedInId}`);
            return;
        }
        if (userRole !== "admin") {
            navigate(`/LandingPage/${clientId}`);
            return;
        }
        fetchUsers("");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clientId, navigate]);

    const fetchUsers = async (q) => {
        setLoading(true);
        setMessage("");
        try {
            const url = q ? `/api/api/admin/accounts?q=${encodeURIComponent(q)}` : `/api/api/admin/accounts`;
            const res = await fetch(url);
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Failed to load users");
            setUsers(data.clients || []);
        } catch (e) {
            setMessage(e.message || "Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return users;
        return users.filter((u) => {
            const hay = `${u.client_id} ${u.first_name} ${u.last_name} ${u.email} ${u.role || ""}`.toLowerCase();
            return hay.includes(q);
        });
    }, [query, users]);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/LoginPage/");
    };

    const handleDelete = async (id) => {
        const ok = window.confirm(`Delete account ${id}? This cannot be undone.`);
        if (!ok) return;

        setLoading(true);
        setMessage("");
        try {
            const res = await fetch(`/api/api/admin/accounts/${encodeURIComponent(id)}`, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Delete failed");
            setMessage("Account deleted.");
            setUsers((prev) => prev.filter((u) => u.client_id !== id));
        } catch (e) {
            setMessage(e.message || "Delete failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-container">
            <nav className="sidebar">
                <div className="brand-logo">BitFit</div>
                <span className="nav-section-label">Main</span>
                <ul className="nav-list">
                    <li className="nav-item" onClick={() => navigate(`/LandingPage/${clientId}`)}>Dashboard</li>
                    <li className="nav-item" onClick={() => navigate(`/MyCoach/${clientId}`)}>My Coach</li>
                    <li className="nav-item" onClick={() => navigate(`/WorkoutLogPage/${clientId}`)}>Workout Logs</li>
                    <li className="nav-item" onClick={() => navigate(`/MealTrackPage/${clientId}`)}>Meal Tracker</li>
                    <li className="nav-item" onClick={() => navigate(`/MoodTrackPage/${clientId}`)}>Mood Tracker</li>
                    <li className="nav-item" onClick={() => navigate(`/MessagingPage/${clientId}`)}>Messages</li>
                    <span className="nav-section-label">Admin</span>
                    <li className="nav-item active">User Management</li>
                    <li className="nav-item" onClick={() => navigate(`/AdminReports/${clientId}`)}>Coach Reports</li>
                    <span className="nav-section-label">Account</span>
                    <li className="nav-item" onClick={() => navigate(`/UserProfile/${clientId}`)}>My Profile</li>
                </ul>
                <div className="sidebar-bottom">
                    <button className="logout-btn" onClickCapture={handleLogout}>Logout</button>
                </div>
            </nav>

            <main className="main-content">
                <header className="dashboard-header">
                    <h1 className="welcome-text">Admin: User Management</h1>
                    <div className="search-container">
                        <span className="search-icon">⌕</span>
                        <input
                            type="text"
                            className="form-control search-input"
                            placeholder="Search by id, name, email, role…"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") fetchUsers(query.trim());
                            }}
                        />
                        <button className="search-btn" disabled={loading} onClick={() => fetchUsers(query.trim())}>
                            {loading ? "Loading..." : "Search"}
                        </button>
                    </div>
                </header>

                {message && (
                    <div style={{ backgroundColor: "#509e54", color: "white", padding: "10px", borderRadius: "8px", margin: "10px 0" }}>
                        {message}
                    </div>
                )}

                <div className="card" style={{ marginTop: 16 }}>
                    <h3>Accounts</h3>
                    <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                        {filtered.length === 0 ? (
                            <p style={{ color: "var(--muted)", fontSize: 13 }}>No results.</p>
                        ) : (
                            filtered.map((u) => (
                                <div
                                    key={u.client_id}
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        gap: 12,
                                        padding: 12,
                                        border: "1px solid rgba(255,255,255,0.12)",
                                        borderRadius: 10,
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: 700 }}>{u.first_name} {u.last_name}</div>
                                        <div style={{ fontSize: 13, color: "var(--muted)" }}>{u.client_id} • {u.email} {u.role ? `• ${u.role}` : ""}</div>
                                    </div>
                                    <div style={{ display: "flex", gap: 8 }}>
                                        <button className="btn-secondary" onClick={() => navigate(`/UserProfile/${u.client_id}`)}>View</button>
                                        <button
                                            className="btn-outline-warning"
                                            style={{ borderColor: "#ef4444", color: "#ef4444" }}
                                            disabled={loading}
                                            onClick={() => handleDelete(u.client_id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminUserManagement;

