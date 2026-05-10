import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Landingcss.css";
import Sidebar from "../components/Sidebar";

const statusOptions = [
    { value: "", label: "All" },
    { value: "open", label: "Open" },
    { value: "reviewed", label: "Reviewed" },
    { value: "resolved", label: "Resolved" },
    { value: "dismissed", label: "Dismissed" },
];

const AdminReports = () => {
    const { clientId } = useParams();
    const navigate = useNavigate();
    const userRole = localStorage.getItem("userRole");
    const adminId = localStorage.getItem("adminId");

    const [status, setStatus] = useState("open");
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [reports, setReports] = useState([]);
    //Testing Frontend Commit

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
        fetchReports(status);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clientId, navigate]);

    const fetchReports = async (statusFilter) => {
        setLoading(true);
        setMessage("");
        try {
            const url = statusFilter ? `/api/admin/reports?status=${encodeURIComponent(statusFilter)}` : `/api/admin/reports`;
            const res = await fetch(url);
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Failed to load reports");
            setReports(data.reports || []);
        } catch (e) {
            setMessage(e.message || "Failed to load reports");
        } finally {
            setLoading(false);
        }
    };

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return reports;
        return reports.filter((r) => {
            const hay = `${r.report_id} ${r.reporter_id} ${r.reporter_name} ${r.reported_user_id} ${r.reported_user_name} ${r.reason} ${r.details} ${r.status}`.toLowerCase();
            return hay.includes(q);
        });
    }, [query, reports]);


    const review = async (reportId, newStatus) => {
        if (!adminId) {
            setMessage("Missing adminId. Please log out and log back in as an admin.");
            return;
        }
        setLoading(true);
        setMessage("");
        try {
            const res = await fetch(`/api/admin/reports/${reportId}/review`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ admin_id: Number(adminId), status: newStatus }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Update failed");
            setMessage(`Report #${reportId} updated to ${newStatus}.`);
            setReports((prev) => prev.map((r) => (r.report_id === reportId ? { ...r, status: newStatus, reviewed_by: Number(adminId) } : r)));
        } catch (e) {
            setMessage(e.message || "Update failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-container">
            <Sidebar activePage="coachreports" />

            <main className="main-content">
                <header className="dashboard-header">
                    <h1 className="welcome-text">Admin: Coach Reports</h1>
                    <div className="search-container">
                        <span className="search-icon">⌕</span>
                        <input
                            type="text"
                            className="form-control search-input"
                            placeholder="Filter by id, user, reason…"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <select
                            className="form-control search-input"
                            style={{ maxWidth: 220 }}
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            {statusOptions.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                        <button className="search-btn" disabled={loading} onClick={() => fetchReports(status)}>
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
                    <h3>Reports</h3>
                    <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                        {visible.length === 0 ? (
                            <p style={{ color: "var(--muted)", fontSize: 13 }}>No reports found.</p>
                        ) : (
                            visible.map((r) => (
                                <div
                                    key={r.report_id}
                                    style={{
                                        padding: 12,
                                        border: "1px solid rgba(255,255,255,0.12)",
                                        borderRadius: 10,
                                        display: "grid",
                                        gap: 8,
                                        backgroundColor: "#18181b", 
                                        color: "#f4f4f5",
                                    }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                                        <div style={{ fontWeight: 800 }}>
                                            Report #{r.report_id} <span style={{ fontWeight: 600, color: "var(--muted)" }}>({r.status})</span>
                                        </div>
                                        <div style={{ display: "flex", gap: 8 }}>
                                            <button className="btn-secondary" disabled={loading} onClick={() => review(r.report_id, "reviewed")}>Mark reviewed</button>
                                            <button className="btn-secondary" disabled={loading} onClick={() => review(r.report_id, "resolved")}>Resolve</button>
                                            <button className="btn-outline-warning" disabled={loading} onClick={() => review(r.report_id, "dismissed")}>Dismiss</button>
                                        </div>
                                    </div>

                                    <div style={{ fontSize: 13, color: "var(--muted)" }}>
                                        <div><strong>Reporter:</strong> {r.reporter_name} ({r.reporter_id})</div>
                                        <div><strong>Reported:</strong> {r.reported_user_name} ({r.reported_user_id})</div>
                                        <div><strong>Reason:</strong> {r.reason}</div>
                                    </div>
                                    {r.details && (
                                        <div style={{ fontSize: 13 }}>
                                            <strong>Details:</strong> {r.details}
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

export default AdminReports;

