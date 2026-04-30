import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Landingcss.css";
const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "declined", label: "Declined" },
  { value: "", label: "All" },
];
const AdminCoachApplications = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole");
  const adminId = localStorage.getItem("adminId");
  const [status, setStatus] = useState("pending");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [apps, setApps] = useState([]);
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
    fetchApps("pending");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, navigate]);
  const fetchApps = async (statusFilter) => {
    setLoading(true);
    setMessage("");
    try {
      const url = statusFilter
        ? `/api/coach_applications?status=${encodeURIComponent(statusFilter)}`
        : `/api/coach_applications`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load applications");
      setApps(data.applications || []);
    } catch (e) {
      setMessage(e.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return apps;
    return apps.filter((a) => {
      const hay =
        `${a.application_id} ${a.client_id} ${a.first_name} ${a.last_name} ${a.email} ${a.specialty} ${a.certifications} ${a.bio} ${a.status}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query, apps]);
  const handleLogout = () => {
    localStorage.clear();
    navigate("/LoginPage/");
  };
  const review = async (applicationId, action) => {
    if (!adminId) {
      setMessage("Missing adminId. Please log out and log back in as an admin.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`/api/coach_applications/review`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          application_id: Number(applicationId),
          action,
          reviewed_by: Number(adminId),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Update failed");
      setMessage(`Application #${applicationId} ${action === "approve" ? "approved" : "declined"}.`);
      setApps((prev) =>
        prev.map((a) =>
          a.application_id === applicationId
            ? { ...a, status: action === "approve" ? "approved" : "declined", reviewed_by: Number(adminId) }
            : a,
        ),
      );
      // refresh to ensure state is consistent with DB
      fetchApps(status);
    } catch (e) {
      setMessage(e.message || "Update failed");
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
          <li className="nav-item" onClick={() => navigate(`/AdminUsers/${clientId}`)}>User Management</li>
          <li className="nav-item" onClick={() => navigate(`/AdminReports/${clientId}`)}>Coach Reports</li>
          <li className="nav-item active">Coach Applications</li>
          <span className="nav-section-label">Account</span>
          <li className="nav-item" onClick={() => navigate(`/UserProfile/${clientId}`)}>My Profile</li>
        </ul>
        <div className="sidebar-bottom">
          <button className="logout-btn" onClickCapture={handleLogout}>Logout</button>
        </div>
      </nav>
      <main className="main-content">
        <header className="dashboard-header">
          <h1 className="welcome-text">Admin: Coach Applications</h1>
          <div className="search-container" style={{ minWidth: 540 }}>
            <span className="search-icon">⌕</span>
            <input
              type="text"
              className="form-control search-input"
              placeholder="Filter by id, client, specialty, text…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select
              className="form-control search-input"
              style={{ maxWidth: 180 }}
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                fetchApps(e.target.value);
              }}
            >
              {statusOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <button className="search-btn" disabled={loading} onClick={() => fetchApps(status)}>
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </header>
        {message && (
          <div style={{ backgroundColor: "#509e54", color: "white", padding: "10px", borderRadius: "8px", margin: "10px 0" }}>
            {message}
          </div>
        )}
        <div className="card" style={{ marginTop: 16 }}>
          <h3>Applications</h3>
          <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
            {visible.length === 0 ? (
              <p style={{ color: "var(--muted)", fontSize: 13 }}>No applications found.</p>
            ) : (
              visible.map((a) => (
                <div
                  key={a.application_id}
                  style={{
                    padding: 12,
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 10,
                    display: "grid",
                    gap: 10,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ fontWeight: 800 }}>
                      Application #{a.application_id}{" "}
                      <span style={{ fontWeight: 600, color: "var(--muted)" }}>
                        ({a.status})
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        className="btn-secondary"
                        disabled={loading || a.status !== "pending"}
                        onClick={() => review(a.application_id, "approve")}
                      >
                        Accept
                      </button>
                      <button
                        className="btn-outline-warning"
                        disabled={loading || a.status !== "pending"}
                        onClick={() => review(a.application_id, "decline")}
                      >
                        Deny
                      </button>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--muted)" }}>
                    <div>
                      <strong>Client:</strong> {a.first_name} {a.last_name} ({a.client_id}) • {a.email}
                    </div>
                    <div>
                      <strong>Specialty:</strong> {a.specialty} • <strong>Pricing:</strong> {a.pricing != null ? `$${a.pricing}` : "—"}
                    </div>
                  </div>
                  {a.certifications && (
                    <div style={{ fontSize: 13 }}>
                      <strong>Certifications:</strong> {a.certifications}
                    </div>
                  )}
                  {a.bio && (
                    <div style={{ fontSize: 13 }}>
                      <strong>Bio:</strong> {a.bio}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
export default AdminCoachApplications;