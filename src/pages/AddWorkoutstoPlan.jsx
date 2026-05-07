import { useNavigate, useParams } from "react-router-dom";
import "./Landingcss.css";
import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import Sidebar from "../components/Sidebar";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const AddWorkoutstoPlan = () => {
    const { clientId } = useParams();
    const navigate = useNavigate();

    const [clients, setClients] = useState([]);
    const [plans, setPlans] = useState([]);
    const [exercises, setExercises] = useState([]);  

    useEffect(() => {
        const loggedInId = localStorage.getItem("authenticatedClientId");
        if (loggedInId !== clientId) {
            navigate(`/UserProfile/${loggedInId}`);
        }
    }, [clientId, navigate]);

    useEffect(() => {
        fetch(`/api/clients/coach/${clientId}`)
            .then(res => res.json())
            .then(data => setClients(Array.isArray(data) ? data : []))
            .catch(err => console.error("Error loading clients:", err));
    }, [clientId]);

    useEffect(() => {
        fetch(`/api/exercises/`)
            .then(res => res.json())
            .then(data => setExercises(Array.isArray(data) ? data : (data.exercises ?? [])))
            .catch(err => console.error("Error loading exercises:", err));
    }, []);

    const handleClientChange = (e) => {
        const selectedId = e.target.value;
        formik.setFieldValue("selectedClientId", selectedId);
        formik.setFieldValue("selectedPlanId", "");
        setPlans([]);

        if (selectedId) {
            fetch(`/api/workoutPlansPage/client/${selectedId}`)
                .then(res => res.json())
                .then(data => setPlans(data.workout_plans ?? []))
                .catch(err => console.error("Error loading plans:", err));
        }
    };

    const formik = useFormik({
        initialValues: {
            selectedClientId: "",
            selectedPlanId: "",
            exercise_id: "",
            day_of_week: "",
            sets: "",
            repetitions: "",
            order_in_day: "",
        },
        onSubmit: async (values) => {
            if (!values.selectedPlanId) {
                alert("Please select a workout plan first.");
                return;
            }
            if (!values.exercise_id || !values.day_of_week || !values.sets || !values.repetitions) {
                alert("Please fill in all exercise fields.");
                return;
            }

            try {
                const res = await fetch(`/api/workoutPlanExercisesPage/${values.selectedPlanId}/exercises`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        workout_plan_id: values.selectedPlanId,
                        exercise_id: values.exercise_id,
                        day_of_week: values.day_of_week,
                        sets: values.sets,
                        repetitions: values.repetitions,
                        order_in_day: values.order_in_day || 1,
                    }),
                });

                if (res.ok) {
                    alert("Exercise added to plan!");
                    formik.resetForm({
                        values: {
                            ...formik.initialValues,
                            selectedClientId: values.selectedClientId,
                            selectedPlanId: values.selectedPlanId,
                        },
                    });
                } else {
                    const err = await res.json();
                    alert(`Error: ${err.error}`);
                }
            } catch (err) {
                console.error("Failed to add exercise:", err);
            }
        },
    });

    return (
        <div className="dashboard-container">
            <Sidebar activePage="addworkoutstoplan" />

            <div className="main-content">
                <h1>Add Workouts to Plan</h1>
                <Container className="mt-5">
                    <div style={{ backgroundColor: "#2a472a", padding: "30px", borderRadius: "15px", color: "white" }}>
                        <Form onSubmit={formik.handleSubmit}>

                            <Form.Group className="mb-4">
                                <Form.Label>Select Client</Form.Label>
                                <Form.Select
                                    name="selectedClientId"
                                    onChange={handleClientChange}
                                    value={formik.values.selectedClientId}
                                >
                                    <option value="">Choose a Client</option>
                                    {clients.map(client => (
                                        <option key={client.client_id} value={client.client_id}>
                                            {client.first_name} {client.last_name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label>Select Workout Plan</Form.Label>
                                <Form.Select
                                    name="selectedPlanId"
                                    onChange={formik.handleChange}
                                    value={formik.values.selectedPlanId}
                                    disabled={!formik.values.selectedClientId}
                                >
                                    <option value="">Choose a Plan</option>
                                    {plans.map(plan => (
                                        <option key={plan.workout_plan_id} value={plan.workout_plan_id}>
                                            Plan #{plan.workout_plan_id} — {plan.difficulty} · {plan.frequency}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            <hr style={{ borderColor: "rgba(255,255,255,0.2)" }} />

                            <Form.Group className="mb-3">
                                <Form.Label>Exercise</Form.Label>
                                <Form.Select
                                    name="exercise_id"
                                    onChange={formik.handleChange}
                                    value={formik.values.exercise_id}
                                    disabled={!formik.values.selectedPlanId}
                                >
                                    <option value="">Choose an Exercise</option>
                                    {exercises.map(ex => (
                                        <option key={ex.exercise_id} value={ex.exercise_id}>
                                            {ex.exercise_name} — {ex.muscle_group}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            <Row>
                                <Col md={4}>
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

                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Sets</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="sets"
                                            placeholder="e.g. 3"
                                            min={1}
                                            onChange={formik.handleChange}
                                            value={formik.values.sets}
                                        />
                                    </Form.Group>
                                </Col>

                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Repetitions</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="repetitions"
                                            placeholder="e.g. 10"
                                            min={1}
                                            onChange={formik.handleChange}
                                            value={formik.values.repetitions}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-4">
                                <Form.Label>Order in Day <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>(optional)</span></Form.Label>
                                <Form.Control
                                    type="number"
                                    name="order_in_day"
                                    placeholder="e.g. 1"
                                    min={1}
                                    onChange={formik.handleChange}
                                    value={formik.values.order_in_day}
                                />
                            </Form.Group>

                            <Button variant="primary" type="submit" className="w-100 mt-2">
                                Add Exercise to Plan
                            </Button>
                        </Form>
                    </div>
                </Container>
            </div>
        </div>
    );
};

export default AddWorkoutstoPlan;