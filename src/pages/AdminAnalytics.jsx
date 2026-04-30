import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Landingcss.css";

import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from "recharts";

const css = `


:root {
  --bg:       #0d0f0e;
  --surface: #111113;
  --surface2: #1a1e1c;
  --border:   #ffffff12;
  --border2:  rgba(255,255,255,0.12);
  --green:    #00e56b;
  --green2:   #00b854;
  --red:      #f87171;
  --amber:    #fbbf24;
  --blue:     #60a5fa;
  --txt:      #f0f2f1;
  --muted:    #8a9490;
  --muted2:   #5a6460;
}

body { background: var(--bg); font-family: 'DM Sans', sans-serif; color: var(--txt); }

.an-period-row {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 20px;
}
.an-period-row h2 {
  font-family: 'DM Sans', sans-serif; font-size: 15px;
  font-weight: 700; color: var(--muted); letter-spacing: .04em;
  text-transform: uppercase;
}
.an-tabs { display: flex; gap: 4px; background: var(--surface); border-radius: 9px; padding: 3px; border: 1px solid var(--border); }
.an-tab {
  font-size: 12px; font-weight: 500; color: var(--muted);
  padding: 6px 14px; border-radius: 7px; border: none;
  background: transparent; cursor: pointer;
  font-family: 'DM Sans', sans-serif; transition: background .15s, color .15s;
}
.an-tab.active { background: var(--surface2); color: var(--txt); }
.an-tab:hover:not(.active) { color: var(--txt); }

/* stat grid */
.an-stat-grid {
  display: grid; grid-template-columns: repeat(4, minmax(0,1fr));
  gap: 12px; margin-bottom: 20px;
}
.an-stat {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 12px; padding: 16px;
}
.an-stat-hdr {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 10px;
}
.an-stat-lbl {
  font-size: 10px; font-weight: 600; text-transform: uppercase;
  letter-spacing: .1em; color: var(--muted);
}

.an-stat-val {
  font-family: 'DM Sans', sans-serif; font-size: 26px;
  font-weight: 700; color: var(--txt); letter-spacing: -1px;
}
.an-stat-trend { font-size: 11px; margin-top: 5px; display: flex; align-items: center; gap: 3px; }
.trend-up   { color: var(--green); }
.trend-down { color: var(--red); }
.trend-neu  { color: var(--amber); }

/* charts */
.an-chart-row { display: grid; grid-template-columns: 1fr; gap: 16px; margin-bottom: 16px; }
.an-chart-row.two { grid-template-columns: 2fr 1fr; }
.an-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 14px; padding: 20px;
}
.an-card-hdr {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 16px;
}
.an-card-title {
  font-size: 11px; font-weight: 600; text-transform: uppercase;
  letter-spacing: .09em; color: var(--muted);
  display: flex; align-items: center; gap: 7px;
}
.an-legend { display: flex; gap: 14px; flex-wrap: wrap; }
.an-legend-item { display: flex; align-items: center; gap: 5px; font-size: 11px; color: var(--muted); }
.an-legend-dot { width: 8px; height: 8px; border-radius: 2px; }


/* loading / error */
.an-loading {
  display: flex; align-items: center; justify-content: center;
  height: 120px; color: var(--muted); font-size: 13px;
}
.an-error {
  background: rgba(248,113,113,.1); border: 1px solid rgba(248,113,113,.25);
  color: var(--red); padding: 10px 14px; border-radius: 9px;
  font-size: 13px; margin-bottom: 16px;
}

/* tooltip */
.custom-tooltip {
  background: #1a1e1c; border: 1px solid var(--border2);
  border-radius: 9px; padding: 10px 13px; font-size: 12px;
  font-family: 'DM Mono', monospace;
}
.custom-tooltip .label { color: var(--muted); margin-bottom: 6px; font-size: 11px; }
.custom-tooltip .row   { display: flex; align-items: center; gap: 6px; color: var(--txt); }
.custom-tooltip .dot   { width: 7px; height: 7px; border-radius: 50%; }

@media (max-width: 900px) {
  .an-stat-grid { grid-template-columns: repeat(2,1fr); }
  .an-chart-row.two { grid-template-columns: 1fr; }
  .an-mini-grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 640px) {
  .an-sidebar { display: none; }
  .an-stat-grid { grid-template-columns: 1fr 1fr; }
}
`;

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="custom-tooltip">
            <div className="label">{label}</div>
            {payload.map((p, i) => (
                <div className="row" key={i}>
                    <div className="dot" style={{ background: p.color }} />
                    {p.name}: <strong>{Number(p.value).toLocaleString()}</strong>
                </div>
            ))}
        </div>
    );
};

const axisStyle = { fill: "#8a9490", fontSize: 11, fontFamily: "'DM Mono', monospace" };
const gridStyle = { stroke: "rgba(255,255,255,0.05)" };


function AdminAnalytics() {
    const { clientId } = useParams();
    const navigate = useNavigate();
    const adminId = localStorage.getItem("adminId");
    const userRole = localStorage.getItem("userRole");

    const [query, setQuery] = useState("");
    const [users, setUsers] = useState([]);
    const [totalActiveForPeriod, setTotalActiveForPeriod] = useState(0);
    
    const [period, setPeriod] = useState("day");
    const [chartData, setChartData] = useState([]);
    const [stats, setStats] = useState({
        total_users: 0,
        active_users: 0,
        deactivated_users: 0,
        new_today: 0,
        new_this_week: 0,
        new_this_month: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const loggedIn = localStorage.getItem("authenticatedClientId");
        if (loggedIn !== clientId || userRole !== "admin") {
            navigate(`/LandingPage/${loggedIn || clientId}`);
        }
    }, [clientId, navigate, userRole]);


    const fetchActivity = useCallback(async (p) => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`/api/admin/active_users?period=${p}`);
            const data = await res.json();

            if (res.ok) {
                const formatted = (data.daily_breakdown || []).map(row => ({
                    date: row.date,
                    active_users: row.active_users,
                    new_signups: row.new_signups || 0
                }));
                setChartData(formatted);

                setTotalActiveForPeriod(data.total_active_users || 0);
            }
        } catch (err) {
            setError("Failed to load activity trend.");
            setChartData([]);
        } finally {
            setLoading(false);
        }
    }, []);
    
    const fetchUsers = (q) => {
        navigate(`/AdminUsers/${clientId}?q=${encodeURIComponent(q)}`);
    };

    const fetchStats = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/stats");
            const data = await res.json();
            if (res.ok){
                setStats(data);}
        } catch (err) {
            console.error("Stats fetch error:", err);
        }
    }, []);

    const handlePeriod = (p) => {
        setPeriod(p);
        fetchActivity(p);
    };

    const [signupData, setSignupData] = useState([]);

    const fetchSignups = useCallback(async (p) => {
        try {
            const days = p === "day" ? 1 : p === "week" ? 7 : 30;
            const res = await fetch(`/api/admin/accounts/new?days=${days}`);
            const data = await res.json();

            if (res.ok) {
                const counts = {};
                data.clients.forEach(c => {
                    const date = new Date(c.signup_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric'});
                    counts[date] = (counts[date] || 0) + 1;
                });

                const formatted = Object.keys(counts).map(date => ({
                    date,
                    new_signups: counts[date]
                }));
                setSignupData(formatted);
            }
        } catch (err) {
            console.error("Signup fetch error:", err);
        }
    }, []);

    useEffect(() => {
        fetchActivity(period);
        fetchStats();
        fetchSignups(period);
    }, [period, fetchActivity, fetchStats, fetchSignups]); 

    
    
    const handleLogout = () => { localStorage.clear(); navigate("/LoginPage/"); };

    const totalForPie = stats.active_users + stats.deactivated_users;
    const pending = (stats.total_users || 0) - stats.active_users - stats.deactivated_users;
    const pieData = [
        { name: "Active", value: stats.active_users },
        { name: "Disabled", value: stats.deactivated_users },
        { name: "Pending", value: Math.max(0, pending) },
    ];

    const newCount = period === "day" ? stats.new_today
        : period === "week" ? stats.new_this_week
            : stats.new_this_month;

    const latestActive = chartData.length
        ? chartData[chartData.length - 1].active_users
        : 0;

    return (
        <>
            <style>{css}</style>
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
                        <li className="nav-item active">Admin Dashboard</li>

                        <li className="nav-item" onClick={() => navigate(`/AdminUsers/${clientId}`)}>User Management</li>
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
                        <h1 className="welcome-text">
                            Engagement Analytics
                        </h1>
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

                   
                        {error && <div className="an-error">{error}</div>}

                        <div className="an-period-row">
                            <h2>Active user reports</h2>
                            <div className="an-tabs">
                                {[
                                    { key: "day", label: "Daily" },
                                    { key: "week", label: "Weekly" },
                                    { key: "month", label: "Monthly" },
                                ].map((t) => (
                                    <button
                                        key={t.key}
                                        className={`an-tab${period === t.key ? " active" : ""}`}
                                        onClick={() => handlePeriod(t.key)}
                                    >{t.label}</button>
                                ))}
                            </div>
                        </div>

                        <div className="an-stat-grid">
                            <div className="card">
                                <div className="an-stat-hdr">
                                <span className="an-stat-lbl" style={{ color: "rgb(0, 229, 107)" }}>
                                        {period === "day" ? "Daily" : period === "week" ? "Weekly" : "Monthly"} active
                                    </span>
                                    
                                </div>
                                <div className="an-stat-val">{totalActiveForPeriod.toLocaleString()}</div>
                                <div className="an-stat-trend trend-up">active</div>

                            </div>

                            <div className="card">
                                <div className="an-stat-hdr">
                                <span className="an-stat-lbl" style={{ color: "rgb(96, 165, 250)" }}>Total accounts</span>
                
                                </div>
                                <div className="an-stat-val">{(stats.total_users || 0).toLocaleString()}</div>
                                <div className="an-stat-trend trend-up">↗ {(stats.active_users || 0).toLocaleString()} active</div>
                            </div>

                            <div className="card">
                                <div className="an-stat-hdr">
                                <span className="an-stat-lbl" style={{ color: "rgb(248, 113, 113)" }}>Disabled accounts</span>
                                    
                                </div>
                                <div className="an-stat-val">{(stats.deactivated_users || 0).toLocaleString()}</div>
                                <div className="an-stat-trend trend-down">
                                    ↙ {((stats.deactivated_users / Math.max(stats.total_users, 1)) * 100).toFixed(1)}% of total
                                </div>
                            </div>

                            <div className="card">
                                <div className="an-stat-hdr">
                                <span className="an-stat-lbl" style={{ color: "rgb(251, 190, 36)" }}>New signups</span>
                                    
                                </div>
                                <div className="an-stat-val">{(newCount || 0).toLocaleString()}</div>
                                <div className="an-stat-trend trend-neu">
                                    this {period === "day" ? "day" : period === "week" ? "week" : "month"}
                                </div>
                            </div>
                        </div>

                        <div className="an-chart-row two">
                            <div className="an-card">
                                <div className="an-card-hdr">
                                    <div className="an-card-title">
                                        Active users over time
                                    </div>
                                    <div className="an-legend">
                                        <div className="an-legend-item">
                                            <div className="an-legend-dot" style={{ background: "#00e56b" }} />
                                            Active users
                                        </div>
                                    </div>
                                </div>
                                {loading ? (
                                    <div className="an-loading">Loading data…</div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={220}>
                                        <LineChart data={chartData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" {...gridStyle} />
                                            <XAxis dataKey="date" tick={axisStyle} axisLine={false} tickLine={false} />
                                            <YAxis tick={axisStyle} axisLine={false} tickLine={false}
                                                tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Line
                                                type="monotone" dataKey="active_users" name="Active users"
                                                stroke="#00e56b" strokeWidth={2.5} dot={{ r: 3.5, fill: "#00e56b", strokeWidth: 0 }}
                                                activeDot={{ r: 5 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                )}
                            </div>

                            
                        </div>

                        <div className="an-chart-row" style={{ marginBottom: 16 }}>
                            <div className="an-card">
                                <div className="an-card-hdr">
                                    <div className="an-card-title">
                                        New signups — {period === "day" ? "last 7 days" : period === "week" ? "last 5 weeks" : "last 6 months"}
                                    </div>
                                    <div className="an-legend">
                                        <div className="an-legend-item"><div className="an-legend-dot" style={{ background: "#60a5fa" }} />New users</div>
                                    </div>
                                </div>
                                <ResponsiveContainer width="100%" height={180}>
                                <BarChart
                                    data={signupData} // Clean data, no more .map() with hardcoded numbers!
                                    margin={{ top: 4, right: 8, left: -10, bottom: 0 }}
                                    barGap={4}
                                >
                                    <CartesianGrid strokeDasharray="3 3" {...gridStyle} />
                                    <XAxis dataKey="date" tick={axisStyle} axisLine={false} tickLine={false} />
                                    <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="new_signups" name="New users" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                                </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                </main>
            </div>
        </>
    );
}

export default AdminAnalytics;