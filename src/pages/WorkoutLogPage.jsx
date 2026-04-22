import { useNavigate, useParams } from "react-router-dom";
import "./Landingcss.css";
import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const WorkoutLogPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [stepData, setStepData] = useState([]);


  // History state
  const [workoutHistory, setWorkoutHistory] = useState({});
  const [expandedDates, setExpandedDates] = useState({});

  // Add workout form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    log_date: "",
    exercise_id: "",
    sets: "",
    reps: "",
    weight: "",
    cardio_type: "",
    cardio_duration: "",
    notes: "",
  });

  // Edit workout state
  const [editingLogId, setEditingLogId] = useState(null);
  const [editForm, setEditForm] = useState({
    sets: "",
    reps: "",
    weight: "",
    cardio_type: "",
    cardio_duration: "",
    notes: "",
  });

  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const showMessage = (text, isError = false) => {
    setMessage(isError ? `Error: ${text}` : text);
    setTimeout(() => setMessage(""), 4000);
  };

  useEffect(() => {
    const loggedInId = localStorage.getItem("authenticatedClientId");
    if (loggedInId !== clientId) {
      navigate(`/UserProfile/${loggedInId}`);
      return;
    }
    fetchHistory();
    fetchExercises();
  }, [clientId, navigate]);

  useEffect(() => {
    const fetchStepData = async () => {
      const response = await fetch(`http://127.0.0.1:5000/api/steps_graph/${clientId}`);
      const data = await response.json();
      setStepData(data);
    };
    fetchStepData();
  }, [clientId]);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/workoutLogPage/history/${clientId}`);
      const data = await res.json();
      setWorkoutHistory(data.workout_history || {});
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  const fetchExercises = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/exercises`);
      const data = await res.json();
      setExercises(data || []);
    } catch (err) {
      console.error("Error fetching exercises:", err);
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim().length === 0) {
      alert("Please enter a valid search term.");
      return;
    }
    navigate(`/WorkoutSearchPage/${clientId}?search=${searchTerm}`);
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleLogout = () => {
    localStorage.removeItem("authenticatedClientId");
    navigate("/LoginPage/");
  };

  const toggleDate = (date) => {
    setExpandedDates((prev) => ({ ...prev, [date]: !prev[date] }));
  };

  // --- Add Workout ---
  const handleAddChange = (e) => {
    setAddForm({ ...addForm, [e.target.name]: e.target.value });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/workoutLogPage/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: clientId, ...addForm }),
      });
      const data = await res.json();
      if (data.error) {
        setMessage(`Error: ${data.error}`);
      } else {
        setMessage("Workout logged successfully!");
        setAddForm({ log_date: "", exercise_id: "", sets: "", reps: "", weight: "", cardio_type: "", cardio_duration: "", notes: "" });
        setShowAddForm(false);
        fetchHistory();
      }
    } catch (err) {
      setMessage("Failed to log workout.");
    }
    setLoading(false);
    setTimeout(() => setMessage(""), 3000);
  };

  // --- Edit Workout ---
  const handleEditClick = (log) => {
    setEditingLogId(log.log_id);
    setEditForm({
      sets: log.sets_completed || "",
      reps: log.reps_completed || "",
      weight: log.weight || "",
      cardio_type: log.cardio_type || "",
      cardio_duration: log.cardio_duration || "",
      notes: log.notes || "",
    });
  };

  // --- Delete Workout ---
  const handleDeleteLog = async (log) => {
    if (!window.confirm("Are you sure you want to delete this workout log? This action cannot be undone.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/api/workoutLogPage/${log.log_id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || data.error) {
        showMessage(data.error || "Delete failed.", true);
      } else {
        showMessage("Workout plan deleted.");
        await fetchHistory();
      }
    } catch {
      showMessage("Failed to delete plan.", true);
    }
    setLoading(false);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/workoutLogPage/${editingLogId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (data.error) {
        setMessage(`Error: ${data.error}`);
      } else {
        setMessage("Workout updated successfully!");
        setEditingLogId(null);
        fetchHistory();
      }
    } catch (err) {
      setMessage("Failed to update workout.");
    }
    setLoading(false);
    setTimeout(() => setMessage(""), 3000);
  };

  const getExerciseName = (id) => {
    const ex = exercises.find((e) => e.exercise_id === id);
    return ex ? ex.exercise_name : `Exercise #${id}`;
  };

  return (
    <div className="dashboard-container">
      <nav className="sidebar">
        <div className="brand-logo">BitFit</div>
        <span className="nav-section-label">Main</span>
        <ul className="nav-list">
          <li className="nav-item" onClick={() => navigate(`/LandingPage/${clientId}`)}>Dashboard</li>
          <li className="nav-item" onClick={() => navigate(`/MyCoach/${clientId}`)}>My Coach</li>
          <li className="nav-item active">Workout Logs</li>
          <ul className="sub-nav">
            <li className="nav-item" onClick={() => navigate(`/WorkoutPlan/${clientId}`)}>Workout Plan</li>
            <li className="nav-item" onClick={() => navigate(`/StepsTracker/${clientId}`)}>Step Tracker</li>
            <li className="nav-item" onClick={() => navigate(`/CustomExercise/${clientId}`)}>Custom Exercise</li>
          </ul>
          <li className="nav-item" onClick={() => navigate(`/MealTrackPage/${clientId}`)}>Meal Tracker</li>
          <span className="nav-section-label">Insights</span>
          <li className="nav-item" onClick={() => navigate(`/MoodTrackPage/${clientId}`)}>Mood Tracker</li>
          <li className="nav-item" onClick={() => navigate(`/MessagingPage/${clientId}`)}>Messages</li>
          <li className="nav-item">Subscriptions</li>
          <li className="nav-item">Analytics</li>
          <span className="nav-section-label">Account</span>
          <li className="nav-item" onClick={() => navigate(`/UserProfile/${clientId}`)}>My Profile</li>
        </ul>
        <div className="sidebar-bottom">
          <button className="logout-btn" onClickCapture={handleLogout}>
            <span></span>
            Logout
          </button>
        </div>
      </nav>

      <div className="main-content">
        <div className="header">
          <h1>Workout Logs</h1>
        </div>

        {/* Search plan.workout_plan_id*/}
        <div className="search-container">
          
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleEnter}
          />
          <button onClick={handleSearch}>Search</button>
        </div>

        {message && (
          <div
            style={{
              backgroundColor: message.startsWith("Error:") ? "#8b3a3a" : "#509e54",
              color: "white",
              padding: "10px",
              borderRadius: "8px",
              margin: "10px 0",
            }}
          >
            {message}
          </div>
        )}

        {/* Steps Graph */}
        <div className="callgraph" style={{ marginBottom: "40px" }}>
          <div className="calorie-graph" style={{ width: "100%", height: 300, marginTop: "20px" }}>
            <h3>Steps Trends</h3>
            {stepData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stepData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="log_date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="steps" stroke="#509e54" fill="#78b47b" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p>No step data found.</p>
            )}
          </div>
        </div>

        {/* Add Workout Button */}
        <div style={{ marginTop: "24px" }}>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              backgroundColor: "#509e54",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "10px 20px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "15px",
            }}
          >
            {showAddForm ? "Cancel" : "+ Log New Workout"}
          </button>
        </div>

        {/* Add Workout Form */}
        {showAddForm && (
          <div style={{ backgroundColor: "#1e3a1e", borderRadius: "12px", padding: "20px", marginTop: "16px" }}>
            <h3 style={{ color: "#78b47b", marginBottom: "16px" }}>Log a Workout</h3>
            <form onSubmit={handleAddSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ color: "#ccc", display: "block", marginBottom: "4px" }}>Date *</label>
                  <input
                    type="date"
                    name="log_date"
                    value={addForm.log_date}
                    onChange={handleAddChange}
                    required
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ color: "#ccc", display: "block", marginBottom: "4px" }}>Exercise *</label>
                  <select
                    name="exercise_id"
                    value={addForm.exercise_id}
                    onChange={handleAddChange}
                    required
                    style={inputStyle}
                  >
                    <option value="">Select an exercise</option>
                    {exercises.map((ex) => (
                      <option key={ex.exercise_id} value={ex.exercise_id}>
                        {ex.exercise_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ color: "#ccc", display: "block", marginBottom: "4px" }}>Sets</label>
                  <input type="number" name="sets" value={addForm.sets} onChange={handleAddChange} placeholder="e.g. 3" style={inputStyle} />
                </div>
                <div>
                  <label style={{ color: "#ccc", display: "block", marginBottom: "4px" }}>Reps</label>
                  <input type="number" name="reps" value={addForm.reps} onChange={handleAddChange} placeholder="e.g. 10" style={inputStyle} />
                </div>
                <div>
                  <label style={{ color: "#ccc", display: "block", marginBottom: "4px" }}>Weight (lbs)</label>
                  <input type="number" name="weight" value={addForm.weight} onChange={handleAddChange} placeholder="e.g. 135" style={inputStyle} />
                </div>
                <div>
                  <label style={{ color: "#ccc", display: "block", marginBottom: "4px" }}>Cardio Type</label>
                  <input type="text" name="cardio_type" value={addForm.cardio_type} onChange={handleAddChange} placeholder="e.g. Incline Walk" style={inputStyle} />
                </div>
                <div>
                  <label style={{ color: "#ccc", display: "block", marginBottom: "4px" }}>Cardio Duration (min)</label>
                  <input type="number" name="cardio_duration" value={addForm.cardio_duration} onChange={handleAddChange} placeholder="e.g. 20" style={inputStyle} />
                </div>
                <div>
                  <label style={{ color: "#ccc", display: "block", marginBottom: "4px" }}>Notes</label>
                  <input type="text" name="notes" value={addForm.notes} onChange={handleAddChange} placeholder="Any notes..." style={inputStyle} />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{ marginTop: "16px", backgroundColor: "#509e54", color: "white", border: "none", borderRadius: "8px", padding: "10px 24px", cursor: "pointer", fontWeight: "bold" }}
              >
                {loading ? "Saving..." : "Log Workout"}
              </button>
            </form>
          </div>
        )}

        {/* Workout History */}
        <div style={{ marginTop: "32px" }}>
          <h2 style={{ color: "#78b47b", marginBottom: "16px" }}>Workout History</h2>
          {Object.keys(workoutHistory).length === 0 ? (
            <p style={{ color: "#aaa" }}>No workout history found.</p>
          ) : (
            Object.keys(workoutHistory).map((date) => (
              <div key={date} style={{ marginBottom: "12px", borderRadius: "10px", overflow: "hidden", border: "1px solid #2e5c2e" }}>
                {/* Date Header */}
                <div
                  onClick={() => toggleDate(date)}
                  style={{
                    backgroundColor: "#1e3a1e",
                    padding: "14px 20px",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ color: "#78b47b", fontWeight: "bold", fontSize: "16px" }}>{date}</span>
                  <span style={{ color: "#aaa", fontSize: "13px" }}>
                    {workoutHistory[date].length} exercise{workoutHistory[date].length !== 1 ? "s" : ""} &nbsp;
                    {expandedDates[date] ? "▲" : "▼"}
                  </span>
                </div>

                {/* Exercises under this date */}
                {expandedDates[date] && (
                  <div style={{ backgroundColor: "#152815" }}>
                    {workoutHistory[date].map((log) => (
                      <div key={log.log_id} style={{ padding: "14px 20px", borderTop: "1px solid #2e5c2e" }}>
                        {editingLogId === log.log_id ? (
                          // Edit Form
                          <form onSubmit={handleEditSubmit}>
                            <p style={{ color: "#78b47b", fontWeight: "bold", marginBottom: "10px" }}>
                              Editing: {getExerciseName(log.exercise_id)}
                            </p>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                              <div>
                                <label style={{ color: "#ccc", fontSize: "13px" }}>Sets</label>
                                <input type="number" name="sets" value={editForm.sets} onChange={handleEditChange} style={inputStyle} />
                              </div>
                              <div>
                                <label style={{ color: "#ccc", fontSize: "13px" }}>Reps</label>
                                <input type="number" name="reps" value={editForm.reps} onChange={handleEditChange} style={inputStyle} />
                              </div>
                              <div>
                                <label style={{ color: "#ccc", fontSize: "13px" }}>Weight (lbs)</label>
                                <input type="number" name="weight" value={editForm.weight} onChange={handleEditChange} style={inputStyle} />
                              </div>
                              <div>
                                <label style={{ color: "#ccc", fontSize: "13px" }}>Cardio Type</label>
                                <input type="text" name="cardio_type" value={editForm.cardio_type} onChange={handleEditChange} style={inputStyle} />
                              </div>
                              <div>
                                <label style={{ color: "#ccc", fontSize: "13px" }}>Cardio Duration (min)</label>
                                <input type="number" name="cardio_duration" value={editForm.cardio_duration} onChange={handleEditChange} style={inputStyle} />
                              </div>
                              <div>
                                <label style={{ color: "#ccc", fontSize: "13px" }}>Notes</label>
                                <input type="text" name="notes" value={editForm.notes} onChange={handleEditChange} style={inputStyle} />
                              </div>
                            </div>
                            <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
                              <button type="submit" disabled={loading} style={saveButtonStyle}>
                                {loading ? "Saving..." : "Save"}
                              </button>
                              <button type="button" onClick={() => setEditingLogId(null)} style={cancelButtonStyle}>
                                Cancel
                              </button>
                            </div>
                          </form>
                        ) : (
                          // Display Row
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <p style={{ color: "white", fontWeight: "bold", margin: 0 }}>
                                {getExerciseName(log.exercise_id)}
                              </p>
                              <p style={{ color: "#aaa", fontSize: "13px", margin: "4px 0 0 0" }}>
                                {log.sets_completed && `${log.sets_completed} sets`}
                                {log.reps_completed && ` × ${log.reps_completed} reps`}
                                {log.weight && ` @ ${log.weight} lbs`}
                                {log.cardio_type && ` | ${log.cardio_type}`}
                                {log.cardio_duration && ` ${log.cardio_duration} min`}
                                {log.notes && ` — ${log.notes}`}
                              </p>
                            </div>
                            <button onClick={() => handleEditClick(log)} style={editButtonStyle}>
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteLog(log)}
                              style={{ ...editButtonStyle, borderColor: "#c44", color: "#e88", margin: "0px 4px 0px 4px" }}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const inputStyle = {
  backgroundColor: "#0f200f",
  border: "1px solid #2e5c2e",
  borderRadius: "6px",
  color: "white",
  padding: "8px 10px",
  width: "100%",
};

const editButtonStyle = {
  backgroundColor: "transparent",
  border: "1px solid #509e54",
  color: "#509e54",
  borderRadius: "6px",
  padding: "6px 14px",
  cursor: "pointer",
  fontSize: "13px",
};

const saveButtonStyle = {
  backgroundColor: "#509e54",
  color: "white",
  border: "none",
  borderRadius: "6px",
  padding: "8px 18px",
  cursor: "pointer",
  fontWeight: "bold",
};

const cancelButtonStyle = {
  backgroundColor: "transparent",
  border: "1px solid #aaa",
  color: "#aaa",
  borderRadius: "6px",
  padding: "8px 18px",
  cursor: "pointer",
};

export default WorkoutLogPage;
