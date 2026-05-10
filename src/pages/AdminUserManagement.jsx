import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Landingcss.css";
import Sidebar from "../components/Sidebar";
const PAGE_SIZE_OPTIONS = [10, 25, 50];

const AdminUserManagement = () => {
    const { clientId } = useParams();
    const navigate = useNavigate();
    const userRole = localStorage.getItem("userRole");

    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

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
            const url = q ? `/api/admin/accounts?q=${encodeURIComponent(q)}` : `/api/admin/accounts`;
            const res = await fetch(url);
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Failed to load users");
            setUsers(data.clients || []);
            setCurrentPage(1);
        } catch (e) {
            setMessage(e.message || "Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const [statusFilter, setStatusFilter] = useState("all"); 


    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return users.filter((u) => {
            const hay = `${u.client_id} ${u.first_name} ${u.last_name} ${u.email} ${u.role || ""}` .toLowerCase();
            const matchesQuery = !q || hay.includes(q);

            const normalizedStatus = (!u.status || u.status.toLowerCase() === "active") ? "active" : u.status.toLowerCase();

            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "active" && currentStatus === "active") ||
                (statusFilter === "disabled" && (currentStatus === "disabled" || currentStatus === "suspended"));

            return matchesQuery && matchesStatus;
        });
    }, [query, users, statusFilter]);

    useEffect(() => {
        setCurrentPage(1);
    }, [query]);
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const paginatedUsers = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    
    const handleDelete = async (id) => {
        const ok = window.confirm(`Delete account ${id}? This cannot be undone.`);
        if (!ok) return;

        setLoading(true);
        setMessage("");
        try {
            const res = await fetch(`/api/admin/accounts/${encodeURIComponent(id)}`, { method: "DELETE" });
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


    const handleToggleStatus = async (user) => {
        const isCurrentlyActive = user.status === "active";
        const action = isCurrentlyActive ? "disable" : "reactivate";
        const endpoint = isCurrentlyActive ? "/api/admin/disable_user" : "/api/admin/reactivate_user";

        const ok = window.confirm(`Are you sure you want to ${action} account ${user.client_id}?`);
        if (!ok) return;

        setLoading(true);
        setMessage("");

        try {
            const payload = {
                admin_id: clientId, 
            };

            if (user.role === "coach") {
                payload.coach_id = user.client_id;
            } else {
                payload.client_id = user.client_id;
            }

            const res = await fetch(endpoint, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || `${action} failed`);

            setMessage(`User ${isCurrentlyActive ? "disabled" : "reactivated"} successfully.`);

            setUsers((prev) =>
                prev.map((u) =>
                    u.client_id === user.client_id
                        ? { ...u, status: isCurrentlyActive ? (user.role === "coach" ? "suspended" : "disabled") : "active" }
                        : u
                )
            );
        } catch (e) {
            setMessage(e.message);
        } finally {
            setLoading(false);
        }
    };

    const getPageNumbers = () => {
        if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
        const pages = [];
        if (currentPage <= 4) {
            pages.push(1, 2, 3, 4, 5, "...", totalPages);
        } else if (currentPage >= totalPages - 3) {
            pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        } else {
            pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
        }
        return pages;
    };

    return (
        <div className="dashboard-container">
            <Sidebar activePage="usermanagement" />

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
                    {/* Card header: title + results count + page size selector */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                        <h3 style={{ margin: 0 }}>
                            Accounts
                            <span style={{ marginLeft: 8, fontSize: 13, fontWeight: 400, color: "var(--muted)" }}>
                                ({filtered.length} {filtered.length === 1 ? "result" : "results"})
                            </span>
                        </h3>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--muted)" }}>
                            <label htmlFor="page-size-select">Rows per page:</label>
                            <select
                                id="page-size-select"
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                style={{
                                    background: "rgba(255,255,255,0.08)",
                                    border: "1px solid rgba(255,255,255,0.15)",
                                    borderRadius: 6,
                                    color: "inherit",
                                    padding: "3px 8px",
                                    cursor: "pointer",
                                    fontSize: 13,
                                }}
                            >
                                {PAGE_SIZE_OPTIONS.map((n) => (
                                    <option key={n} value={n}>{n}</option>
                                ))}
                            </select>

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                style={{
                                    background: "rgba(255,255,255,0.08)",
                                    border: "1px solid rgba(255,255,255,0.15)",
                                    borderRadius: "8px",
                                    color: "white",
                                    padding: "8px 12px",
                                    cursor: "pointer",
                                    outline: 'none'
                                }}
                            >
                                <option value="all" style={{ background: '#18181b' }}>All Statuses</option>
                                <option value="active" style={{ background: '#18181b' }}>Active Only</option>
                                <option value="disabled" style={{ background: '#18181b' }}>Disabled/Suspended Only</option>
                            </select>

                            
                        </div>
                    </div>

                    {/* User list */}
                    <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                        {paginatedUsers.length === 0 ? (
                            <p style={{ color: "var(--muted)", fontSize: 13 }}>No results.</p>
                        ) : (
                            paginatedUsers.map((u) => {
                                const isActive = u.status === "active";                                return (
                                    <div
                                        key={u.client_id}
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            gap: 12,
                                            padding: 12,
                                            border: "1px solid rgba(255,255,255,0.12)",
                                            borderRadius: 10,
                                            backgroundColor: isActive ? "transparent" : "rgba(239, 68, 68, 0.05)" // Light red tint for disabled
                                        }}
                                    >
                                        <div>
                                            <div style={{ fontWeight: 700, color: "#ffff"}}>
                                                {u.first_name} {u.last_name}
                                                {!isActive && <span style={{ marginLeft: 8, fontSize: 11, color: "#ef4444", textTransform: "uppercase" }}>[ {u.status} ]</span>}
                                            </div>
                                            <div style={{ fontSize: 13, color: "var(--muted)" }}>
                                                {u.client_id} • {u.email} {u.role ? `• ${u.role}` : ""}
                                            </div>
                                        </div>
                                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                            <button
                                                className={isActive ? "btn-outline-warning" : "btn-outline-success"}
                                                style={{
                                                    borderColor: isActive ? "#fbbf24" : "#509e54",
                                                    color: isActive ? "#fbbf24" : "#509e54",
                                                    minWidth: "100px"
                                                }}
                                                disabled={loading}
                                                onClick={() => handleToggleStatus(u)}
                                            >
                                                {isActive ? "Disable" : "Reactivate"}
                                            </button>

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
                                );
                            })
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginTop: 16,
                            flexWrap: "wrap",
                            gap: 8,
                        }}>
                            <span style={{ fontSize: 13, color: "var(--muted)" }}>
                                Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}
                            </span>

                            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    style={paginationBtnStyle(false, currentPage === 1)}
                                >
                                    ‹
                                </button>

                                {getPageNumbers().map((page, idx) =>
                                    page === "..." ? (
                                        <span key={`ellipsis-${idx}`} style={{ padding: "0 4px", color: "var(--muted)", fontSize: 13 }}>…</span>
                                    ) : (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            style={paginationBtnStyle(page === currentPage, false)}
                                        >
                                            {page}
                                        </button>
                                    )
                                )}

                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    style={paginationBtnStyle(false, currentPage === totalPages)}
                                >
                                    ›
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

const paginationBtnStyle = (isActive, isDisabled) => ({
    minWidth: 32,
    height: 32,
    padding: "0 8px",
    borderRadius: 6,
    border: isActive ? "1px solid #509e54" : "1px solid rgba(255,255,255,0.15)",
    background: isActive ? "#509e54" : "rgba(255,255,255,0.06)",
    color: "#fff",
    cursor: isDisabled ? "not-allowed" : "pointer",
    fontSize: 14,
    fontWeight: isActive ? 600 : 400,
    transition: "background 0.15s, border-color 0.15s",
});

export default AdminUserManagement;