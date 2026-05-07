import { useNavigate, useParams } from "react-router-dom";
import "./Landingcss.css";
import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import { Form, Button, Container } from "react-bootstrap";
import Sidebar from "../components/Sidebar";

const AssignWorkoutPlan = () => {
    const { clientId } = useParams();
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);

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

    const formik = useFormik({
        initialValues: {
            selectedClientId: "",
            frequency: "",
            difficulty: "",
        },
        onSubmit: async (values) => {
            if (!values.selectedClientId || !values.frequency || !values.difficulty) {
                alert("Please fill in all fields.");
                return;
            }

            try {
                const res = await fetch(`/api/workoutPlansPage/`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        created_by: clientId,
                        client_id: values.selectedClientId,
                        frequency: values.frequency,
                        difficulty: values.difficulty,
                        is_draft: 1,
                    }),
                });

                if (res.ok) {
                    alert("Workout plan created successfully!");
                    navigate(`/AddWorkoutstoPlan/${clientId}`);
                } else {
                    const errData = await res.json();
                    alert(`Error: ${errData.error}`);
                }
            } catch (err) {
                console.error("Assignment failed:", err);
            }
        },
    });

    return (
        <div className="dashboard-container">
            <Sidebar activePage="assignworkoutplan" />

            <div className="main-content">
                <main className="main-content">
                    <h1>Create Workout Plan</h1>
                    <Container className="mt-5">
                        <div style={{ backgroundColor: "#2a472a", padding: "30px", borderRadius: "15px", color: "white" }}>
                            <Form onSubmit={formik.handleSubmit}>

                                <Form.Group className="mb-4">
                                    <Form.Label>Frequency (e.g., 3x per week)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="frequency"
                                        placeholder="e.g., 4x per week"
                                        onChange={formik.handleChange}
                                        value={formik.values.frequency}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label>Difficulty</Form.Label>
                                    <Form.Select
                                        name="difficulty"
                                        onChange={formik.handleChange}
                                        value={formik.values.difficulty}
                                    >
                                        <option value="">Select Difficulty</option>
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label>Select Client</Form.Label>
                                    <Form.Select
                                        name="selectedClientId"
                                        onChange={formik.handleChange}
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

                                <Button variant="primary" type="submit" className="w-100">
                                    Create Workout Plan
                                </Button>
                            </Form>
                        </div>
                    </Container>
                </main>
            </div>
        </div>
    );
};

export default AssignWorkoutPlan;