import { useNavigate, useParams } from "react-router-dom";
import "./Landingcss.css";
import React, { useState, useEffect, useCallback } from "react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const WorkoutPlanPage = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const { clientId } = useParams();
    const userRole = localStorage.getItem("userRole");
    const navigate = useNavigate();

    const [workoutPlans, setWorkoutPlans] = useState([]);
    const [expandedPlanId, setExpandedPlanId] = useState(null);
    const [planDetail, setPlanDetail] = useState(null);
    const [planDetailLoading, setPlanDetailLoading] = useState(false);

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [createForm, setCreateForm] = useState({
        frequency: "",
        difficulty: "Intermediate",
    });

    const [addExerciseForm, setAddExerciseForm] = useState({
        exercise_id: "",
        day_of_week: "Mon",
        order_in_day: "",
        sets: "",
        repetitions: "",
    });

    const [editingPlanId, setEditingPlanId] = useState(null);
    const [editForm, setEditForm] = useState({
        frequency: "",
        difficulty: "",
        is_draft: "0",
    });

    const [editingEntryId, setEditingEntryId] = useState(null);
    const [editExerciseForm, setEditExerciseForm] = useState({
        exercise_id: "",
        day_of_week: "",
        order_in_day: "",
        sets: "",
        repetitions: "",
    });

    const [exercises, setExercises] = useState([]);
    const [assignedCoachId, setAssignedCoachId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const showMessage = (text, isError = false) => {
        setMessage(isError ? `Error: ${text}` : text);
        setTimeout(() => setMessage(""), 4000);
    };

    const fetchWorkoutPlans = useCallback(async () => {
        try {
            const res = await fetch(`https://cs-490-group-backend.vercel.app/api/workoutPlansPage/client/${clientId}`);
            const data = await res.json();
            if (data.error) {
                console.error(data.error);
                setWorkoutPlans([]);
                return;
            }
            setWorkoutPlans(Array.isArray(data.workout_plans) ? data.workout_plans : []);
        } catch (err) {
            console.error("Error fetching Workout Plans:", err);
            setWorkoutPlans([]);
        }
    }, [clientId]);

    const fetchExercises = useCallback(async () => {
        try {
            const res = await fetch(`/api/exercises/`);
            const data = await res.json();
            setExercises(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching exercises:", err);
            setExercises([]);
        }
    }, []);

    const fetchAssignedCoach = useCallback(async () => {
        try {
            const res = await fetch(`https://cs-490-group-backend.vercel.app/api/my_coach/${clientId}`);
            if (!res.ok) {
                setAssignedCoachId(null);
                return;
            }
            const data = await res.json();
            setAssignedCoachId(data.coach_id || null);
        } catch {
            setAssignedCoachId(null);
        }
    }, [clientId]);

    const loadPlanDetail = async (workoutPlanId) => {
        setPlanDetailLoading(true);
        try {
            const res = await fetch(`https://cs-490-group-backend.vercel.app/api/workoutPlansPage/${workoutPlanId}`);
            const data = await res.json();
            if (data.error) {
                showMessage(data.error, true);
                setPlanDetail(null);
            } else {
                setPlanDetail(data);
            }
        } catch (err) {
            console.error(err);
            showMessage("Failed to load plan details.", true);
            setPlanDetail(null);
        } finally {
            setPlanDetailLoading(false);
        }
    };

    useEffect(() => {
        const loggedInId = localStorage.getItem("authenticatedClientId");
        if (loggedInId !== clientId) {
            navigate(`/UserProfile/${loggedInId}`);
            return;
        }
        fetchWorkoutPlans();
        fetchExercises();
        fetchAssignedCoach();
    }, [clientId, navigate, fetchWorkoutPlans, fetchExercises, fetchAssignedCoach]);

    useEffect(() => {
        if (expandedPlanId) {
            loadPlanDetail(expandedPlanId);
        } else {
            setPlanDetail(null);
        }
    }, [expandedPlanId]);

    const handleSearch = () => {
        if (searchTerm.trim().length === 0) {
            alert("Please enter a valid search term.");
            return;
        }
        navigate(`/WorkoutSearchPage/${clientId}?search=${encodeURIComponent(searchTerm)}`);
    };

    const handleEnter = (e) => {
        if (e.key === "Enter") handleSearch();
    };

    const handleLogout = () => {
        localStorage.removeItem("authenticatedClientId");
        navigate("/LoginPage/");
    };

    const handleCreateField = (e) => {
        setCreateForm({ ...createForm, [e.target.name]: e.target.value });
    };

    const handleCreateSubmit = async (e, isDraft) => {
        e.preventDefault();
        const { frequency, difficulty } = createForm;
        if (!frequency?.trim() || !difficulty?.trim()) {
            showMessage("Frequency and difficulty are required.", true);
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`https://cs-490-group-backend.vercel.app/api/workoutPlansPage/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    created_by: assignedCoachId,
                    client_id: clientId,
                    frequency: frequency.trim(),
                    difficulty: difficulty.trim(),
                    is_draft: isDraft ? 1 : 0,
                }),
            });
            const data = await res.json();
            if (!res.ok || data.error) {
                showMessage(data.error || "Could not create plan.", true);
            } else {
                showMessage("Workout plan created. Add exercises below.");
                setCreateForm({ frequency: "", difficulty: "Intermediate" });
                setShowCreateForm(false);
                await fetchWorkoutPlans();
                if (data.workout_plan_id) {
                    setExpandedPlanId(data.workout_plan_id);
                }
            }
        } catch {
            showMessage("Failed to create workout plan.", true);
        }
        setLoading(false);
    };

    const handleEditClick = (plan) => {
        setEditingPlanId(plan.workout_plan_id);
        setEditForm({
            frequency: plan.frequency || "",
            difficulty: plan.difficulty || "",
            is_draft: String(plan.is_draft ?? 0),
        });
    };

    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`https://cs-490-group-backend.vercel.app/api/workoutPlansPage/${editingPlanId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    frequency: editForm.frequency,
                    difficulty: editForm.difficulty,
                    is_draft: parseInt(editForm.is_draft, 10) ? 1 : 0,
                }),
            });
            const data = await res.json();
            if (!res.ok || data.error) {
                showMessage(data.error || "Update failed.", true);
            } else {
                showMessage("Workout plan updated.");
                setEditingPlanId(null);
                await fetchWorkoutPlans();
                if (expandedPlanId === editingPlanId) {
                    await loadPlanDetail(editingPlanId);
                }
            }
        } catch {
            showMessage("Failed to update workout plan.", true);
        }
        setLoading(false);
    };

    const handleDeletePlan = async (workoutPlanId) => {
        if (!window.confirm("Delete this workout plan and all of its exercises?")) return;
        setLoading(true);
        try {
            const res = await fetch(`https://cs-490-group-backend.vercel.app/api/workoutPlansPage/${workoutPlanId}`, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok || data.error) {
                showMessage(data.error || "Delete failed.", true);
            } else {
                showMessage("Workout plan deleted.");
                if (expandedPlanId === workoutPlanId) {
                    setExpandedPlanId(null);
                }
                await fetchWorkoutPlans();
            }
        } catch {
            showMessage("Failed to delete plan.", true);
        }
        setLoading(false);
    };

    const handleAddExerciseField = (e) => {
        setAddExerciseForm({ ...addExerciseForm, [e.target.name]: e.target.value });
    };

    const handleAddExerciseSubmit = async (e, workoutPlanId) => {
        e.preventDefault();
        const { exercise_id, day_of_week, order_in_day, sets, repetitions } = addExerciseForm;
        if (!exercise_id) {
            showMessage("Choose an exercise.", true);
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`https://cs-490-group-backend.vercel.app/api/workoutPlanExercisesPage/${workoutPlanId}/exercises`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    exercise_id: parseInt(exercise_id, 10),
                    day_of_week,
                    order_in_day: parseInt(order_in_day, 10),
                    sets: parseInt(sets, 10),
                    repetitions: parseInt(repetitions, 10),
                }),
            });
            const data = await res.json();
            if (!res.ok || data.error) {
                showMessage(data.error || "Could not add exercise.", true);
            } else {
                showMessage("Exercise added to plan.");
                setAddExerciseForm({
                    exercise_id: "",
                    day_of_week: "Mon",
                    order_in_day: "1",
                    sets: "3",
                    repetitions: "10",
                });
                await loadPlanDetail(workoutPlanId);
                await fetchWorkoutPlans();
            }
        } catch {
            showMessage("Failed to add exercise.", true);
        }
        setLoading(false);
    };

    const startEditEntry = (entry) => {
        setEditingEntryId(entry.id);
        setEditExerciseForm({
            exercise_id: String(entry.exercise_id),
            day_of_week: entry.day_of_week,
            order_in_day: String(entry.order_in_day),
            sets: String(entry.sets),
            repetitions: String(entry.repetitions),
        });
    };

    const handleEditExerciseField = (e) => {
        setEditExerciseForm({ ...editExerciseForm, [e.target.name]: e.target.value });
    };

    const handleEditExerciseSubmit = async (e, workoutPlanId) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`https://cs-490-group-backend.vercel.app/api/workoutPlanExercisesPage/entry/${editingEntryId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    exercise_id: parseInt(editExerciseForm.exercise_id, 10),
                    day_of_week: editExerciseForm.day_of_week,
                    order_in_day: parseInt(editExerciseForm.order_in_day, 10),
                    sets: parseInt(editExerciseForm.sets, 10),
                    repetitions: parseInt(editExerciseForm.repetitions, 10),
                }),
            });
            const data = await res.json();
            if (!res.ok || data.error) {
                showMessage(data.error || "Update failed.", true);
            } else {
                showMessage("Exercise updated.");
                setEditingEntryId(null);
                await loadPlanDetail(workoutPlanId);
            }
        } catch {
            showMessage("Failed to update exercise.", true);
        }
        setLoading(false);
    };

    const handleDeleteEntry = async (entryId, workoutPlanId) => {
        if (!window.confirm("Remove this exercise from the plan?")) return;
        setLoading(true);
        try {
            const res = await fetch(`https://cs-490-group-backend.vercel.app/api/workoutPlanExercisesPage/entry/${entryId}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (!res.ok || data.error) {
                showMessage(data.error || "Remove failed.", true);
            } else {
                showMessage("Exercise removed.");
                if (editingEntryId === entryId) setEditingEntryId(null);
                await loadPlanDetail(workoutPlanId);
            }
        } catch {
            showMessage("Failed to remove exercise.", true);
        }
        setLoading(false);
    };

    const toggleExpand = (planId) => {
        setExpandedPlanId((prev) => (prev === planId ? null : planId));
        setEditingEntryId(null);
    };

    const WeeklyCalendar = ({ exercisesByDay }) => {
        return (
            <div style={{ marginBottom: "20px" }}>
                <p style={{ color: "#aaa", fontSize: "13px", margin: "0 0 10px 0" }}>Weekly overview</p>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(7, 1fr)",
                        gap: "6px",
                    }}
                >
                    {DAYS.map((day) => {
                        const entries = exercisesByDay[day] || [];
                        const hasEx = entries.length > 0;
                        return (
                            <div
                                key={day}
                                style={{
                                    backgroundColor: "#0f200f",
                                    border: `1px solid ${hasEx ? "#509e54" : "#1e3a1e"}`,
                                    borderRadius: "8px",
                                    padding: "8px 6px",
                                    minHeight: "90px",
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: "11px",
                                        fontWeight: "bold",
                                        color: hasEx ? "#78b47b" : "#555",
                                        marginBottom: "6px",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.04em",
                                    }}
                                >
                                    {day}
                                </div>
                                {hasEx ? (
                                    entries.map((entry) => (
                                        <div
                                            key={entry.id}
                                            title={`${entry.exercise_name} — ${entry.sets}×${entry.repetitions}`}
                                            style={{
                                                backgroundColor: "#1e3a1e",
                                                color: "#78b47b",
                                                fontSize: "10px",
                                                borderRadius: "4px",
                                                padding: "2px 5px",
                                                marginBottom: "3px",
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                            }}
                                        >
                                            {entry.exercise_name}
                                            <span style={{ color: "#509e54", marginLeft: "4px" }}>
                                                {entry.sets}×{entry.repetitions}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <span style={{ fontSize: "11px", color: "#444" }}>Rest</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderPlanExercises = (workoutPlanId) => {
        if (planDetailLoading) {
            return <p style={{ color: "#aaa", padding: "12px" }}>Loading exercises…</p>;
        }
        if (!planDetail?.exercises_by_day) {
            return null;
        }
        const byDay = planDetail.exercises_by_day;
        return (
            <div style={{ padding: "12px 0", borderTop: "1px solid #2e5c2e" }}>
                <WeeklyCalendar exercisesByDay={byDay} />
                {DAYS.map((day) => {
                    const entries = byDay[day] || [];
                    if (entries.length === 0) return null;
                    return (
                        <div key={day} style={{ marginBottom: "16px" }}>
                            <h4 style={{ color: "#78b47b", fontSize: "14px", marginBottom: "8px" }}>{day}</h4>
                            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                                {entries.map((entry) => (
                                    <li
                                        key={entry.id}
                                        style={{
                                            display: "flex",
                                            flexWrap: "wrap",
                                            alignItems: "center",
                                            gap: "8px",
                                            padding: "8px 0",
                                            borderBottom: "1px solid #1e3a1e",
                                            color: "#ddd",
                                            fontSize: "13px",
                                        }}
                                    >
                                        {editingEntryId === entry.id ? (
                                            <form
                                                onSubmit={(e) => handleEditExerciseSubmit(e, workoutPlanId)}
                                                style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center", width: "100%" }}
                                            >
                                                <select
                                                    name="exercise_id"
                                                    value={editExerciseForm.exercise_id}
                                                    onChange={handleEditExerciseField}
                                                    style={inputStyle}
                                                >
                                                    {exercises.map((ex) => (
                                                        <option key={ex.exercise_id} value={ex.exercise_id}>
                                                            {ex.exercise_name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <select
                                                    name="day_of_week"
                                                    value={editExerciseForm.day_of_week}
                                                    onChange={handleEditExerciseField}
                                                    style={{ ...inputStyle, maxWidth: "90px" }}
                                                >
                                                    {DAYS.map((d) => (
                                                        <option key={d} value={d}>
                                                            {d}
                                                        </option>
                                                    ))}
                                                </select>
                                                <input
                                                    name="order_in_day"
                                                    type="number"
                                                    min={1}
                                                    value={editExerciseForm.order_in_day}
                                                    onChange={handleEditExerciseField}
                                                    style={{ ...inputStyle, width: "70px" }}
                                                    title="Order"
                                                />
                                                <input
                                                    name="sets"
                                                    type="number"
                                                    min={1}
                                                    value={editExerciseForm.sets}
                                                    onChange={handleEditExerciseField}
                                                    style={{ ...inputStyle, width: "60px" }}
                                                />
                                                <input
                                                    name="repetitions"
                                                    type="number"
                                                    min={1}
                                                    value={editExerciseForm.repetitions}
                                                    onChange={handleEditExerciseField}
                                                    style={{ ...inputStyle, width: "70px" }}
                                                />
                                                <button type="submit" disabled={loading} style={saveButtonStyle}>
                                                    Save
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingEntryId(null)}
                                                    style={cancelButtonStyle}
                                                >
                                                    Cancel
                                                </button>
                                            </form>
                                        ) : (
                                            <>
                                                <span style={{ flex: "1 1 200px" }}>
                                                    <strong>{entry.exercise_name}</strong>
                                                    <span style={{ color: "#888", marginLeft: "8px" }}>
                                                        {entry.sets}×{entry.repetitions} (order {entry.order_in_day})
                                                    </span>
                                                </span>
                                                <button type="button" onClick={() => startEditEntry(entry)} style={editButtonStyle}>
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteEntry(entry.id, workoutPlanId)}
                                                    style={{ ...editButtonStyle, borderColor: "#c44", color: "#e88" }}
                                                >
                                                    Remove
                                                </button>
                                            </>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
                <form
                    onSubmit={(e) => handleAddExerciseSubmit(e, workoutPlanId)}
                    style={{
                        marginTop: "16px",
                        padding: "12px",
                        backgroundColor: "#0f200f",
                        borderRadius: "8px",
                    }}
                >
                    <h4 style={{ color: "#78b47b", fontSize: "14px", marginBottom: "10px" }}>Add exercise</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "10px" }}>
                        <div>
                            <label style={{ color: "#ccc", display: "block", marginBottom: "4px" }}>Exercise</label>
                            <select name="exercise_id" value={addExerciseForm.exercise_id} onChange={handleAddExerciseField} style={inputStyle}>
                                <option value="">Exercise</option>
                                {exercises.map((ex) => (
                                    <option key={ex.exercise_id} value={ex.exercise_id}>
                                        {ex.exercise_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ color: "#ccc", display: "block", marginBottom: "4px" }}>Day</label>
                            <select name="day_of_week" value={addExerciseForm.day_of_week} onChange={handleAddExerciseField} style={inputStyle}>
                                {DAYS.map((d) => (
                                    <option key={d} value={d}>
                                        {d}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ color: "#ccc", display: "block", marginBottom: "4px" }}>Order</label>
                            <input
                                name="order_in_day"
                                type="number"
                                min={1}
                                placeholder="Order"
                                value={addExerciseForm.order_in_day}
                                onChange={handleAddExerciseField}
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={{ color: "#ccc", display: "block", marginBottom: "4px" }}>Sets</label>
                            <input
                                name="sets"
                                type="number"
                                min={1}
                                placeholder="Sets"
                                value={addExerciseForm.sets}
                                onChange={handleAddExerciseField}
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={{ color: "#ccc", display: "block", marginBottom: "4px" }}>Reps</label>
                            <input
                                name="repetitions"
                                type="number"
                                min={1}
                                placeholder="Reps"
                                value={addExerciseForm.repetitions}
                                onChange={handleAddExerciseField}
                                style={inputStyle}
                            />
                        </div>
                    </div>
                    <button type="submit" disabled={loading} style={{ ...saveButtonStyle, marginTop: "12px" }}>
                        Add to plan
                    </button>
                </form>
            </div>
        );
    };

    return (
        <div className="dashboard-container">
            <nav className="sidebar">
                <div className="brand-logo">BitFit</div>
                <ul className="nav-list">
                    <li className="nav-item" onClick={() => navigate(`/LandingPage/${clientId}`)}>Dashboard</li>
                    <li className="nav-item" onClick={() => navigate(`/WorkoutLogPage/${clientId}`)}>Workout Logs</li>
                    <ul className="sub-nav">
                        <li className="nav-item active">Workout Plan</li>
                        <li className="nav-item" onClick={() => navigate(`/StepsTracker/${clientId}`)}>Step Tracker</li>
                        <li className="nav-item" onClick={() => navigate(`/CustomExercise/${clientId}`)}>Custom Exercise</li>
                    </ul>
                    <div className="sidebar-bottom">
                        <button className="back-btn" onClick={() => navigate(`/WorkoutLogPage/${clientId}`)}>← Back to Workout Logs</button>
                    </div>
                </ul>
            </nav>

            <div className="main-content">
                <div className="header">
                    <h1>Workout Plan</h1>
                </div>

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

                {showCreateForm && (
                    <div style={{ backgroundColor: "#1e3a1e", borderRadius: "12px", padding: "20px", marginTop: "16px" }}>
                        <h3 style={{ color: "#78b47b", marginBottom: "16px" }}>Create a Workout Plan</h3>
                        <p style={{ color: "#aaa", fontSize: "13px", marginBottom: "12px" }}>
                            Add exercises after the plan is created.
                        </p>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                            <div>
                                <label style={{ color: "#ccc", display: "block", marginBottom: "4px" }}>Frequency</label>
                                <input
                                    type="text"
                                    name="frequency"
                                    value={createForm.frequency}
                                    onChange={handleCreateField}
                                    placeholder="e.g. 4x/week"
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={{ color: "#ccc", display: "block", marginBottom: "4px" }}>Difficulty</label>
                                <select name="difficulty" value={createForm.difficulty} onChange={handleCreateField} style={inputStyle}>
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ marginTop: "16px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                            <button
                                type="button"
                                disabled={loading}
                                onClick={(e) => handleCreateSubmit(e, false)}
                                style={{
                                    backgroundColor: "#509e54",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "8px",
                                    padding: "10px 24px",
                                    cursor: "pointer",
                                    fontWeight: "bold",
                                }}
                            >
                                {loading ? "Saving…" : "Create Workout Plan"}
                            </button>
                            <button
                                type="button"
                                disabled={loading}
                                onClick={(e) => handleCreateSubmit(e, true)}
                                style={{
                                    backgroundColor: "#3d7a40",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "8px",
                                    padding: "10px 24px",
                                    cursor: "pointer",
                                    fontWeight: "bold",
                                }}
                            >
                                {loading ? "Saving…" : "Save as Draft"}
                            </button>
                        </div>
                    </div>
                )}

                <div style={{ marginTop: "32px" }}>
                    <h2 style={{ color: "#78b47b", marginBottom: "16px" }}>Your Workout Plans</h2>
                    {workoutPlans.length === 0 ? (
                        <p style={{ color: "#aaa" }}>No workout plans yet. Create one or ask your coach to assign a plan.</p>
                    ) : (
                        <div style={{ marginBottom: "12px", borderRadius: "10px", overflow: "hidden", border: "1px solid #2e5c2e" }}>
                            <div style={{ backgroundColor: "#152815" }}>
                                {workoutPlans.map((plan) => (
                                    <div key={plan.workout_plan_id} style={{ padding: "14px 20px", borderTop: "1px solid #2e5c2e" }}>
                                        {editingPlanId === plan.workout_plan_id ? (
                                            <form onSubmit={handleEditSubmit}>
                                                <p style={{ color: "#78b47b", fontWeight: "bold", marginBottom: "10px" }}>
                                                    Edit plan #{plan.workout_plan_id}
                                                </p>
                                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                                    <div>
                                                        <label style={{ color: "#ccc", fontSize: "13px" }}>Frequency</label>
                                                        <input
                                                            type="text"
                                                            name="frequency"
                                                            value={editForm.frequency}
                                                            onChange={handleEditChange}
                                                            style={inputStyle}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={{ color: "#ccc", fontSize: "13px" }}>Difficulty</label>
                                                        <input
                                                            type="text"
                                                            name="difficulty"
                                                            value={editForm.difficulty}
                                                            onChange={handleEditChange}
                                                            style={inputStyle}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={{ color: "#ccc", fontSize: "13px" }}>Draft</label>
                                                        <select name="is_draft" value={editForm.is_draft} onChange={handleEditChange} style={inputStyle}>
                                                            <option value="0">Published</option>
                                                            <option value="1">Draft</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
                                                    <button type="submit" disabled={loading} style={saveButtonStyle}>
                                                        {loading ? "Saving…" : "Save"}
                                                    </button>
                                                    <button type="button" onClick={() => setEditingPlanId(null)} style={cancelButtonStyle}>
                                                        Cancel
                                                    </button>
                                                </div>
                                            </form>
                                        ) : (
                                            <>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                                                    <div>
                                                        <p style={{ color: "white", fontWeight: "bold", margin: 0 }}>
                                                            Plan #{plan.workout_plan_id}
                                                            {plan.is_draft ? (
                                                                <span style={{ color: "#daa520", fontSize: "12px", marginLeft: "8px" }}>(draft)</span>
                                                            ) : null}
                                                        </p>
                                                        <p style={{ color: "#aaa", fontSize: "13px", margin: "4px 0 0 0" }}>
                                                            {plan.frequency ? `Frequency: ${plan.frequency}` : ""}
                                                            {plan.frequency && plan.difficulty ? " · " : ""}
                                                            {plan.difficulty ? `Difficulty: ${plan.difficulty}` : ""}
                                                        </p>
                                                        {plan.created && (
                                                            <p style={{ color: "#666", fontSize: "12px", margin: "4px 0 0 0" }}>
                                                                Created {new Date(plan.created).toLocaleString()}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                                        <button type="button" onClick={() => toggleExpand(plan.workout_plan_id)} style={editButtonStyle}>
                                                            {expandedPlanId === plan.workout_plan_id ? "Hide exercises" : "View / edit exercises"}
                                                        </button>
                                                        <button type="button" onClick={() => handleEditClick(plan)} style={editButtonStyle}>
                                                            Edit plan
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeletePlan(plan.workout_plan_id)}
                                                            style={{ ...editButtonStyle, borderColor: "#c44", color: "#e88" }}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                                {expandedPlanId === plan.workout_plan_id &&
                                                    planDetail?.workout_plan?.workout_plan_id === plan.workout_plan_id &&
                                                    renderPlanExercises(plan.workout_plan_id)}
                                                {expandedPlanId === plan.workout_plan_id &&
                                                    planDetail?.workout_plan?.workout_plan_id !== plan.workout_plan_id &&
                                                    planDetailLoading &&
                                                    renderPlanExercises(plan.workout_plan_id)}
                                            </>
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

