import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Landingcss.css";

const EditTodaysMeal = () => {
    const { clientId } = useParams();
    const navigate = useNavigate();
    const [todaysLogs, setTodaysLogs] = useState([]);

    const todayDate = new Date().toISOString().split('T')[0];

    const fetchTodaysLogs = async () => {
        try {
            const res = await fetch(`http://127.0.0.1:5000/api/calorie_graph/${clientId}`);
            const data = await res.json();
            const filtered = data.filter(log => log.log_date === todayDate);

            setTodaysLogs(filtered);
        } catch (err) {
            console.error("Fetch error:", err);
        }
    };
    useEffect(() => {
            fetchTodaysLogs();
        }, [clientId, todayDate]);

    const handleUpdate = async (logId, updatedData) => {
        try {
            const res = await fetch(`http://127.0.0.1:5000/api/nutrition_plan/log/${logId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedData)
            });
            if (res.ok) {
                await fetchTodaysLogs();
            } else {
                const err = await res.json();
                alert(err.error || "Update failed.");
            }
        } catch (err) {
            alert("Connection error to backend.");
        }
    };

    const handleDelete = async (logId) => {
            const res = await fetch(`http://127.0.0.1:5000/api/nutrition_plan/log/${logId}`, {
                method: "DELETE"
            });

            if (res.ok) {
                await fetchTodaysLogs();
            }
    };

    return (
        <div className="dashboard-container">
            <nav className="sidebar">
                <div className="brand-logo">BitFit</div>
                <ul className="nav-list">
                    <li className="nav-item" onClick={() => navigate(`/LandingPage/${clientId}`)}>Dashboard</li>
                    <li className="nav-item" onClick={() => navigate(`/MealTrackPage/${clientId}`)}>Meal Tracker</li>
                    <ul className="sub-sub-nav">
                        <li className="nav-item" onClick={() => navigate(`/LogTodaysMeal/${clientId}`)}>Log Today's Meals</li>
                        <li className="nav-item active">Edit Today's Meals</li>
                    </ul>
                    <div className="sidebar-bottom">
                    <button className="nav-item" onClick={() => navigate(`/MealTrackPage/${clientId}`)}>← Back to Tracker</button>
                </div>
                </ul>
                
            </nav>

            <div className="main-content">
                <header className="header" style={{ marginBottom: "30px" }}>
                    <h1 style={{ color: "#fbbf24", margin: 0 }}>Edit Todays Logs</h1>
                    <p style={{ color: "#a1a1aa" }}>Manage logs for: <strong>{todayDate}</strong></p>
                </header>

                <div className="edit-list">
                    {todaysLogs.length > 0 ? (
                        todaysLogs.map((log) => (
                            <EditableLogCard
                                key={log.meal_log_id}
                                log={log}
                                onSave={handleUpdate}
                                onDelete={handleDelete}
                            />
                        ))
                    ) : (
                        <div className="section-card" style={{ textAlign: 'center', padding: '40px' }}>
                            <p className="italic" style={{ color: '#71717a' }}>No logs recorded for today yet.</p>
                            <button className="btn-primary" onClick={() => navigate(`/LogTodaysMeal/${clientId}`)}>
                                Go to Logging
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const EditableLogCard = ({ log, onSave, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [calories, setCalories] = useState(log.actual_calories);
    const [notes, setNotes] = useState(log.notes);

    if (!isEditing) {
        return (
            <div className="section-card mb-4"
                style={{ borderLeft: '4px solid #509e54', background: '#111', cursor: 'pointer' }}
                onClick={() => setIsEditing(true)}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h4 style={{ margin: 0, color: '#fff' }}>{log.actual_calories} calories</h4>
                        <p style={{ color: '#a1a1aa', margin: '5px 0 0', fontSize: '14px' }}>{log.notes}</p>
                    </div>
                    <span style={{ color: '#509e54', fontSize: '12px' }}>Click to Edit</span>
                </div>
            </div>
        );
    }

    return (
        <div className="section-card mb-4" style={{ borderLeft: '4px solid #fbbf24', background: '#18181b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>Editing Entry</span>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(log.meal_log_id);
                    }}
                    style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    Delete Log
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input
                    type="number"
                    className="bitfit-input"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                />
                <textarea
                    className="bitfit-input"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-primary" style={{ flex: 1 }} onClick={() => onSave(log.meal_log_id, { calories, notes }) && setIsEditing(false)}>
                        Save Changes
                    </button>
                    <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setIsEditing(false)}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditTodaysMeal;