import { useNavigate, useParams } from "react-router-dom";
import "./Landingcss.css";
import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import { Form, Button, Container, Table, Row, Col } from "react-bootstrap";
import Sidebar from "../components/Sidebar";
 
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
 
const EditWorkoutsfromPlan = () => {
    const { clientId } = useParams();
    const navigate = useNavigate();
 
    const [clients, setClients]     = useState([]);
    const [plans, setPlans]         = useState([]);
    const [exercises, setExercises] = useState([]);       
    const [allExercises, setAllExercises] = useState([]); 
 
  
    useEffect(() => {
        const loggedInId = localStorage.getItem("authenticatedClientId");
        if (loggedInId !== clientId) {
            navigate(`/UserProfile/${loggedInId}`);
        }
    }, [clientId, navigate]);
 
    useEffect(() => {
        fetch(`/api/api/clients/coach/${clientId}`)
            .then(res => res.json())
            .then(data => setClients(Array.isArray(data) ? data : []))
            .catch(err => console.error("Error loading clients:", err));
    }, [clientId]);
 
    useEffect(() => {
        fetch(`/api/api/exercises/`)
            .then(res => res.json())
            .then(data => setAllExercises(Array.isArray(data) ? data : (data.exercises ?? [])))
            .catch(err => console.error("Error loading exercise library:", err));
    }, []);
 
    const formik = useFormik({
        initialValues: {
            selectedClientId: "",
            selectedPlanId: "",
            id: "",               
            exercise_id: "",
            day_of_week: "",
            sets: "",
            repetitions: "",
            order_in_day: "",
        },
        enableReinitialize: true,
        onSubmit: async (values) => {
            if (!values.id) return;
 
            try {
                const res = await fetch(`/api/api/workoutPlanExercisesPage/entry/${values.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        exercise_id:  values.exercise_id,
                        day_of_week:  values.day_of_week,
                        sets:         values.sets,
                        repetitions:  values.repetitions,
                        order_in_day: values.order_in_day,
                    }),
                });
 
                if (res.ok) {
                    alert("Exercise updated successfully!");
                    fetchPlanExercises(values.selectedPlanId);
                    formik.resetForm({
                        values: {
                            ...formik.initialValues,
                            selectedClientId: values.selectedClientId,
                            selectedPlanId:   values.selectedPlanId,
                        },
                    });
                } else {
                    const err = await res.json();
                    alert(`Error: ${err.error}`);
                }
            } catch (err) {
                console.error("Update failed:", err);
            }
        },
    });
 
    const fetchPlanExercises = (planId) => {
        fetch(`/api/api/workoutPlansPage/${planId}`)
            .then(res => {
                if (!res.ok) throw new Error("Failed to load plan");
                return res.json();
            })
            .then(data => {
                
                const byDay = data.exercises_by_day ?? {};
                const flat  = Object.values(byDay).flat();
                setExercises(flat);
            })
            .catch(err => console.error("Error fetching plan exercises:", err));
    };
 
    const handleClientChange = (e) => {
        const selectedId = e.target.value;
        formik.setFieldValue("selectedClientId", selectedId);
        formik.setFieldValue("selectedPlanId", "");
        setPlans([]);
        setExercises([]);
 
        if (selectedId) {
            fetch(`/api/api/workoutPlansPage/client/${selectedId}`)
                .then(res => res.json())
                .then(data => setPlans(data.workout_plans ?? []))
                .catch(err => console.error("Error loading plans:", err));
        }
    };
 
    const handlePlanChange = (e) => {
        const planId = e.target.value;
        formik.setFieldValue("selectedPlanId", planId);
        setExercises([]);
        if (planId) fetchPlanExercises(planId);
    };
 
    const handleEditClick = (row) => {
        formik.setValues({
            ...formik.values,
            id:           row.id,
            exercise_id:  row.exercise_id,
            day_of_week:  row.day_of_week,
            sets:         row.sets,
            repetitions:  row.repetitions,
            order_in_day: row.order_in_day,
        });
        document.getElementById("edit-form")?.scrollIntoView({ behavior: "smooth" });
    };
 
    const handleDelete = async (rowId) => {
        if (!window.confirm("Are you sure you want to remove this exercise from the plan?")) return;
 
        try {
            const res = await fetch(`/api/api/workoutPlanExercisesPage/entry/${rowId}`, {
                method: "DELETE",
            });
 
            if (res.ok) {
                alert("Exercise removed!");
                setExercises(prev => prev.filter(e => e.id !== rowId));
                if (formik.values.id === rowId) formik.resetForm();
            } else {
                const err = await res.json();
                alert(`Error: ${err.error}`);
            }
        } catch (err) {
            console.error("Delete failed:", err);
        }
    };
 
    return (
        <div className="dashboard-container">
            <Sidebar activePage="editworkoutsfromplan" />
 
            <div className="main-content">
                <h1>Edit &amp; Delete Workouts</h1>
                <Container className="mt-4">
 
                    <div style={{ backgroundColor: "#2a472a", padding: "20px", borderRadius: "15px", color: "white", marginBottom: "20px" }}>
                        <Form.Group className="mb-3">
                            <Form.Label>Select Client</Form.Label>
                            <Form.Select onChange={handleClientChange} value={formik.values.selectedClientId}>
                                <option value="">Choose Client</option>
                                {clients.map(c => (
                                    <option key={c.client_id} value={c.client_id}>
                                        {c.first_name} {c.last_name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
 
                        <Form.Group>
                            <Form.Label>Select Workout Plan</Form.Label>
                            <Form.Select
                                onChange={handlePlanChange}
                                value={formik.values.selectedPlanId}
                                disabled={!formik.values.selectedClientId}
                            >
                                <option value="">Choose Plan</option>
                                {plans.map(p => (
                                    <option key={p.workout_plan_id} value={p.workout_plan_id}>
                                        Plan #{p.workout_plan_id} — {p.difficulty} · {p.frequency}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </div>
 
                    {exercises.length > 0 && (
                        <Table striped bordered hover variant="dark">
                            <thead>
                                <tr>
                                    <th>Exercise</th>
                                    <th>Muscle Group</th>
                                    <th>Day</th>
                                    <th>Sets</th>
                                    <th>Reps</th>
                                    <th>Order</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {exercises.map(ex => (
                                    <tr key={ex.id}>
                                        <td>{ex.exercise_name}</td>
                                        <td>{ex.muscle_group}</td>
                                        <td>{ex.day_of_week}</td>
                                        <td>{ex.sets}</td>
                                        <td>{ex.repetitions}</td>
                                        <td>{ex.order_in_day}</td>
                                        <td>
                                            <Button
                                                variant="warning"
                                                size="sm"
                                                className="me-2"
                                                onClick={() => handleEditClick(ex)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => handleDelete(ex.id)}
                                            >
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
 
                    {exercises.length === 0 && formik.values.selectedPlanId && (
                        <p style={{ color: "rgba(255,255,255,0.5)", marginTop: 10 }}>
                            No exercises in this plan yet. Add some from the &quot;Add Workouts&quot; page.
                        </p>
                    )}
 
                    {formik.values.id && (
                        <div
                            id="edit-form"
                            style={{ backgroundColor: "#1a2e1a", padding: "24px", borderRadius: "15px", color: "white", marginTop: "24px" }}
                        >
                            <h3 style={{ marginBottom: "16px" }}>
                                Editing exercise #{formik.values.id}
                            </h3>
                            <Form onSubmit={formik.handleSubmit}>
 
                                <Form.Group className="mb-3">
                                    <Form.Label>Exercise</Form.Label>
                                    <Form.Select
                                        name="exercise_id"
                                        onChange={formik.handleChange}
                                        value={formik.values.exercise_id}
                                    >
                                        <option value="">Choose an Exercise</option>
                                        {allExercises.map(ex => (
                                            <option key={ex.exercise_id} value={ex.exercise_id}>
                                                {ex.exercise_name} — {ex.muscle_group}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
 
                                <Row>
                                    <Col md={3}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Day of Week</Form.Label>
                                            <Form.Select
                                                name="day_of_week"
                                                onChange={formik.handleChange}
                                                value={formik.values.day_of_week}
                                            >
                                                <option value="">Select Day</option>
                                                {DAYS.map(d => (
                                                    <option key={d} value={d}>{d}</option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
 
                                    <Col md={3}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Sets</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="sets"
                                                min={1}
                                                onChange={formik.handleChange}
                                                value={formik.values.sets}
                                            />
                                        </Form.Group>
                                    </Col>
 
                                    <Col md={3}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Repetitions</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="repetitions"
                                                min={1}
                                                onChange={formik.handleChange}
                                                value={formik.values.repetitions}
                                            />
                                        </Form.Group>
                                    </Col>
 
                                    <Col md={3}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Order in Day</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="order_in_day"
                                                min={1}
                                                onChange={formik.handleChange}
                                                value={formik.values.order_in_day}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
 
                                <Button variant="success" type="submit" className="me-2">
                                    Save Changes
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() =>
                                        formik.resetForm({
                                            values: {
                                                ...formik.initialValues,
                                                selectedClientId: formik.values.selectedClientId,
                                                selectedPlanId:   formik.values.selectedPlanId,
                                            },
                                        })
                                    }
                                >
                                    Cancel
                                </Button>
                            </Form>
                        </div>
                    )}
                </Container>
            </div>
        </div>
    );
};
 
export default EditWorkoutsfromPlan;