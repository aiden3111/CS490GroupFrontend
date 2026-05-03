import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Landingcss.css";
import Sidebar from "../components/Sidebar";

const EditTodaysMeal = () => {
    const { clientId } = useParams();
    const navigate = useNavigate();
    const [todaysLogs, setTodaysLogs] = useState([]);

    const todayDate = new Date().toLocaleDateString('en-CA');

    const fetchTodaysLogs = async () => {
        try {
            const res = await fetch(`/api/calorie_graph/${clientId}`);
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
            const res = await fetch(`/api/nutrition_plan/log/${logId}`, {
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
            const res = await fetch(`/api/nutrition_plan/log/${logId}`, {
                method: "DELETE"
            });

            if (res.ok) {
                await fetchTodaysLogs();
            }
    };

    return (
        <div className="dashboard-container">
            <Sidebar activePage="mealtracker" />

            <div className="main-content">
                <header className="header" style={{ marginBottom: "30px" }}>
                    <h1 style={{fontSize: "32px", fontWeight: 700, color: "#fbbf24", letterSpacing: "-0.5px"}} >Edit Today's Logs</h1>
                    <p style={{ color: "#00ff44", fontSize: "15px", fontWeight: 600, marginTop: "4px" }}>Manage logs for: <strong style={{ color: "#a1a1aa" }}>{todayDate}</strong></p>
                </header>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
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
                            <div className="card" style={{ alignItems: "center", padding: "48px", gap: "12px", textAlign: "center" }}>
                                <p style={{ color: "var(--muted)", fontSize: "15px" }}>No logs recorded for today yet.</p>
                            <button className="meal-log-btn" onClick={() => navigate(`/LogTodaysMeal/${clientId}`)}>
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

    const handleSave = async () => {
        await onSave(log.meal_log_id, { calories, notes });
        setIsEditing(false);
    };
        return (
            <div className="log-card">
                <div className="log-view" onClick={() => !isEditing && setIsEditing(true)}>
                    <div className="log-accent"></div>
                    <div style={{ flex: 1 }}>
                        <p className="log-cals">{log.actual_calories} calories</p>
                        <p className="log-notes">{log.notes || "—"}</p>
                    </div>
                    {!isEditing && <span className="log-edit-hint">Click to edit</span>}
                </div>

                {isEditing && (
                    <div className="log-edit-form">
                        <div className="edit-header">
                            <span className="editing-badge">Editing Entry</span>
                            <button className="del-btn" onClick={() => onDelete(log.meal_log_id)}>
                                Delete Log
                            </button>
                        </div>
                        <div>
                            <div className="edit-label">Calories</div>
                            <input
                                className="bitfit-input"
                                type="number"
                                value={calories}
                                onChange={(e) => setCalories(e.target.value)}
                            />
                        </div>
                        <div>
                            <div className="edit-label">Notes</div>
                            <textarea
                                className="bitfit-input"
                                rows="2"
                                style={{ resize: "none" }}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                        <div className="btn-row">
                            <button className="meal-save-btn" onClick={handleSave}>Save Changes</button>
                            <button className="meal-cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

export default EditTodaysMeal;