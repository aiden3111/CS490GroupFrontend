import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import "./Landingcss.css";

const emptyForm = {
  exercise_name: "",
  muscle_group: "",
  equipment: "",
  category: "",
  example_video: "",
};

const AdminExerciseBank = () => {
  const [exercises, setExercises] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/exercises");
      const data = await res.json();
      setExercises(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load exercises:", err);
      setMessage("Failed to load exercises.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  const filteredExercises = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return exercises;
    return exercises.filter((exercise) =>
      [
        exercise.exercise_name,
        exercise.muscle_group,
        exercise.equipment,
        exercise.category,
        exercise.created_by ? "custom" : "system",
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
  }, [exercises, query]);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!form.exercise_name.trim()) {
      setMessage("Exercise name is required.");
      return;
    }

    const payload = {
      ...form,
      is_custom: editingId ? undefined : 0,
      created_by: null,
    };

    try {
      const res = await fetch(
        editingId ? `/api/exercises/${editingId}` : "/api/exercises",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Failed to save exercise.");
        return;
      }
      setMessage(editingId ? "Exercise updated." : "Exercise added.");
      resetForm();
      fetchExercises();
    } catch (err) {
      console.error("Save exercise failed:", err);
      setMessage("Failed to save exercise.");
    }
  };

  const startEdit = (exercise) => {
    setEditingId(exercise.exercise_id);
    setForm({
      exercise_name: exercise.exercise_name || "",
      muscle_group: exercise.muscle_group || "",
      equipment: exercise.equipment || "",
      category: exercise.category || "",
      example_video: exercise.example_video || "",
    });
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteExercise = async (exercise) => {
    const confirmed = window.confirm(`Delete ${exercise.exercise_name}?`);
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/exercises/${exercise.exercise_id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Failed to delete exercise.");
        return;
      }
      setMessage("Exercise deleted.");
      fetchExercises();
    } catch (err) {
      console.error("Delete exercise failed:", err);
      setMessage("Failed to delete exercise.");
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar activePage="adminexercises" />
      <main className="main-content">
        <header className="dashboard-header">
          <h1 className="welcome-text">Exercise Bank</h1>
        </header>

        <section className="section-card" style={{ marginBottom: "18px" }}>
          <h3>{editingId ? "Edit Exercise" : "Add Exercise"}</h3>
          {message && <p style={{ color: "#fbbf24" }}>{message}</p>}
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "12px" }}>
            <div className="stats-grid">
              <div className="field-group">
                <label className="field-label">Exercise Name</label>
                <input className="bitfit-input" name="exercise_name" value={form.exercise_name} onChange={handleChange} />
              </div>
              <div className="field-group">
                <label className="field-label">Muscle Group</label>
                <input className="bitfit-input" name="muscle_group" value={form.muscle_group} onChange={handleChange} />
              </div>
              <div className="field-group">
                <label className="field-label">Equipment</label>
                <input className="bitfit-input" name="equipment" value={form.equipment} onChange={handleChange} />
              </div>
              <div className="field-group">
                <label className="field-label">Category</label>
                <input className="bitfit-input" name="category" value={form.category} onChange={handleChange} />
              </div>
            </div>
            <div className="field-group">
              <label className="field-label">Demo Video URL</label>
              <input className="bitfit-input" name="example_video" value={form.example_video} onChange={handleChange} />
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button className="btn-primary" type="submit">
                {editingId ? "Save Changes" : "Add Exercise"}
              </button>
              {editingId && (
                <button className="btn-secondary" type="button" onClick={resetForm}>
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="section-card">
          <div className="dashboard-header">
            <h3>All Exercises</h3>
            <input
              className="bitfit-input"
              style={{ maxWidth: "320px" }}
              placeholder="Search exercise bank..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          {loading ? (
            <p>Loading exercises...</p>
          ) : (
            <div className="coach-grid">
              {filteredExercises.map((exercise) => (
                <div key={exercise.exercise_id} className="section-card">
                  <h4>{exercise.exercise_name}</h4>
                  <p><strong>Muscle:</strong> {exercise.muscle_group || "-"}</p>
                  <p><strong>Equipment:</strong> {exercise.equipment || "-"}</p>
                  <p><strong>Category:</strong> {exercise.category || "-"}</p>
                  <p><strong>Source:</strong> {exercise.created_by ? "Custom" : "System"}</p>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <button className="btn-secondary" onClick={() => startEdit(exercise)}>
                      Edit
                    </button>
                    <button className="btn-outline-warning" onClick={() => deleteExercise(exercise)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default AdminExerciseBank;
