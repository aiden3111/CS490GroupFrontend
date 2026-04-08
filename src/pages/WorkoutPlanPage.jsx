import { useNavigate, useParams } from "react-router-dom";
import "./Landingcss.css";
import React, { useState, useEffect } from "react";

const WorkoutPlanPage = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const { clientId } = useParams();
    const navigate = useNavigate();

    // History state
    const [workoutPlans, setWorkoutPlans] = useState({});

    // Add workout form state
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [createForm, setCreateForm] = useState({
        created_by: "",
        frequency: "",
        client_id: "",
        difficulty: "",
        is_draft: "",
        nutition_plan_id: "",
    });
    const [addForm, setAddForm] = useState({
        workout_plan_id: "",
        order_in_day: "",
        sets: "",
        day_of_week: "",
        reptitions: "",
        exercise_id: "",
    });

    // Edit workout Plan state
    const [editingPlanId, setEditingPlanId] = useState(null);
    const [editForm, setEditForm] = useState({
        frequency: "",
        difficulty: "",
        is_draft: "",
        nutrition_plan_id: ""
    });
    const [editExerciseForm, setEditExerciseForm] = useState({
        exercise_id: "",
        day_of_week: "",
        order_in_day: "",
        sets: "",
        repetitions: ""
    });

    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const loggedInId = localStorage.getItem("authenticatedClientId");
        if (loggedInId !== clientId) {
            navigate(`/UserProfile/${loggedInId}`);
            return;
        }
        fetchWorkoutPlans();
        fetchExercises();
    }, [clientId, navigate]);

    const fetchWorkoutPlans = async () => {
        try {
            const res = await fetch(`api/api/workoutPlansPage/client/${clientId}`);
            const data = await res.json();
            setWorkoutPlans(data.workout_history || {});
        } catch (err) {
            console.error("Error fetching history:", err);
        }
    };

    const fetchExercises = async () => {
        try {
            const res = await fetch(`api/api/exercises`);
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

    // --- Add Workout ---
    const handleAddChange = (e) => {
        setAddForm({ ...addForm, [e.target.name]: e.target.value });
    };

    const handleAddSubmit = async (e, isDraft) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`api/api/workoutPlanPage/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    client_id: clientId,
                    ...createForm,
                    is_draft: isDraft
                }),
            });
            const data = await res.json();
            if (data.error) {
                setMessage(`Error: ${data.error}`);
            } else {
                setMessage("Workoutplan successfully created!");
                setCreateForm({
                    created_by: "",
                    frequency: "",
                    client_id: "",
                    difficulty: "",
                    is_draft: "",
                    nutition_plan_id: "",
                });
                setAddForm({
                    workout_plan_id: "",
                    order_in_day: "",
                    sets: "",
                    day_of_week: "",
                    reptitions: "",
                    exercise_id: "",
                });
                setShowCreateForm(false);
                fetchWorkoutPlans();
            }
        } catch (err) {
            setMessage("Failed to create workout plan.");
        }
        setLoading(false);
        setTimeout(() => setMessage(""), 3000);
    };

    // --- Edit Workout ---
    const handleEditClick = (plan) => {
        setEditingPlanId(plan.workout_plan_id);
        setEditForm({
            frequency: plan.frequency || "",
            difficulty: plan.difficulty || "",
            is_draft: plan.is_draft || "",
            nutrition_plan_id: plan.nutition_plan_id || "",
        });
    };

    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const handleEditSubmit = async (e, isDraft) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`api/api/workoutLogPage/${editingPlanId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    client_id: clientId,
                    ...createForm,
                    is_draft: isDraft,
                }),
            });
            const data = await res.json();
            if (data.error) {
                setMessage(`Error: ${data.error}`);
            } else {
                setMessage("Workout updated successfully!");
                setEditingPlanId(null);
                fetchWorkoutPlans();
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
                    <li className="nav-item" onClick={() => navigate(`/MoodTrackPage/${clientId}`)}>Mood Tracker</li>
                    <li className="nav-item">Messages</li>
                    <li className="nav-item">Subscriptions</li>
                    <li className="nav-item">Analytics</li>
                    <li className="nav-item" onClick={() => navigate(`/UserProfile/${clientId}`)}>My Profile</li>
                </ul>
                <div className="sidebar-bottom">
                    <button className="nav-item" onClickCapture={handleLogout}>Logout</button>
                </div>
            </nav>

            <div className="main-content">
                <div className="header">
                    <h1>Workout Plan</h1>
                </div>

                {/* Search */}
                <div className="search-container">
                    <p>Search here</p>
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

                {/* Status message */}
                {message && (
                    <div style={{ backgroundColor: "#509e54", color: "white", padding: "10px", borderRadius: "8px", margin: "10px 0" }}>
                        {message}
                    </div>
                )}

                {/* WorkoutCalendar */}


                {/* Create Workout Plan Button */}
                <div style={{ marginTop: "24px" }}>
                    <button
                        onClick={() => setShowCreateForm(!showCreateForm)}
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
                        {showCreateForm ? "Cancel" : "+ Create new Workout Plan"}
                    </button>
                </div>

                {/* Create Workout Plan Form */}
                {showCreateForm && (
                    <div style={{ backgroundColor: "#1e3a1e", borderRadius: "12px", padding: "20px", marginTop: "16px" }}>
                        <h3 style={{ color: "#78b47b", marginBottom: "16px" }}>Create a Workout Plan</h3>
                        <form onSubmit={handleAddSubmit}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                <div>
                                    <label style={{ color: "#ccc", display: "block", marginBottom: "4px" }}>Title *</label>
                                    <input
                                        type="text"
                                        name="created_by"
                                        value={createForm.created_by}
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
                                    <label style={{ color: "#ccc", display: "block", marginBottom: "4px" }}>Frequency</label>
                                    <input type="number" name="Frequency" value={addForm.sets} onChange={handleAddChange} placeholder="e.g. 3" style={inputStyle} />
                                </div>
                                <div>
                                    <label style={{ color: "#ccc", display: "block", marginBottom: "4px" }}>Difficulty</label>
                                    <input type="text" name="difficulty" value={addForm.reps} onChange={handleAddChange} placeholder="e.g. 10" style={inputStyle} />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                onClick={(e) => handleAddSubmit(e, false)}
                                style={{ marginTop: "16px", backgroundColor: "#509e54", color: "white", border: "none", borderRadius: "8px", padding: "10px 24px", cursor: "pointer", fontWeight: "bold" }}
                            >
                                {loading ? "Saving..." : "Log Workout"}
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                onClick={(e) => handleAddSubmit(e, true)}
                                style={{ marginTop: "16px", backgroundColor: "#509e54", color: "white", border: "none", borderRadius: "8px", padding: "10px 24px", cursor: "pointer", fontWeight: "bold" }}
                            >
                                {loading ? "Saving..." : "Save as Draft"}
                            </button>
                        </form>
                    </div>
                )}

                {/* Workout Plans */}
                <div style={{ marginTop: "32px" }}>
                    <h2 style={{ color: "#78b47b", marginBottom: "16px" }}>Workout Plans</h2>
                    {Object.keys(workoutPlans).length === 0 ? (
                        <p style={{ color: "#aaa" }}>No workout plans found. Create one!</p>
                    ) : (
                        <div style={{ marginBottom: "12px", borderRadius: "10px", overflow: "hidden", border: "1px solid #2e5c2e" }}>
                            {/* Exercises under this date */}
                            <div style={{ backgroundColor: "#152815" }}>
                                {workoutPlans.map((plan) => (
                                    <div key={plan.workout_plan_id} style={{ padding: "14px 20px", borderTop: "1px solid #2e5c2e" }}>
                                        {editingPlanId === plan.workout_plan_id ? (
                                            // Edit Form
                                            <form onSubmit={handleEditSubmit}>
                                                <p style={{ color: "#78b47b", fontWeight: "bold", marginBottom: "10px" }}>
                                                    Editing: {plan.created_by}
                                                </p>
                                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                                    <div>
                                                        <label style={{ color: "#ccc", fontSize: "13px" }}>Sets</label>
                                                        <input type="number" name="frequency" value={editForm.frequency} onChange={handleEditChange} style={inputStyle} />
                                                    </div>
                                                    <div>
                                                        <label style={{ color: "#ccc", fontSize: "13px" }}>Reps</label>
                                                        <input type="difficulty" name="difficulty" value={editForm.reps} onChange={handleEditChange} style={inputStyle} />
                                                    </div>
                                                </div>
                                                <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
                                                    <button type="submit" disabled={loading} style={saveButtonStyle}>
                                                        {loading ? "Saving..." : "Save"}
                                                    </button>
                                                    <button type="button" onClick={() => setEditingPlanId(null)} style={cancelButtonStyle}>
                                                        Cancel
                                                    </button>
                                                </div>
                                            </form>
                                        ) : (
                                            // Display Row
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <div>
                                                    <p style={{ color: "white", fontWeight: "bold", margin: 0 }}>
                                                        {getExerciseName(plan.created_by)}
                                                    </p>
                                                    <p style={{ color: "#aaa", fontSize: "13px", margin: "4px 0 0 0" }}>
                                                        {plan.frequency && `Frequency: ${plan.frequency}`}
                                                        {plan.difficulty && `Difficulty: × ${plan.difficulty}`}
                                                    </p>
                                                </div>
                                                <button onClick={() => handleEditClick(plan)} style={editButtonStyle}>
                                                    Edit
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                        </div>
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

export default WorkoutPlanPage;