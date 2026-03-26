import React, { useState } from "react";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { useFormik } from "formik";
import "./Regcss.css";
import { useParams, useNavigate, Link } from "react-router-dom";


function OnboardingSurveyPage() {
    const navigate = useNavigate();
    const { clientId } = useParams();
    const formikForm = useFormik({
        initialValues: {
            client_id: clientId,
            workout_days_per_week: "",
            goal_weight: "",
            steps_per_day: "",
            time_active_per_day: ""
        },
        validateOnChange: false,
        validateOnBlur: false,
        onSubmit: (values) => {
            fetch("/api/api/surveys", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.error) {
                        alert(data.error);
                    } else {
                        console.log("Success:", data);
                        navigate(`/UserProfile/${clientId}`);
                        //navigate("/LandingPage");
                    }
                })
                .catch((err) => console.error("Error:", err));
        },
        validate: (values) => {
            const errors = {};
            if (!values.workout_days_per_week) errors.workout_days_per_week = "Required";
            if (!values.goal_weight) errors.goal_weight = "Required";
            if (!values.steps_per_day) errors.steps_per_day = "Required";
            if (!values.time_active_per_day) errors.time_active_per_day = "Required";
            return errors;
        },
    });

    return (
        <Container>
            <div
                className="containerdiv"
                style={{
                    backgroundColor: "#09090b",
                    padding: "20px",
                    borderRadius: "15px",
                }}
            >
                <Form onSubmit={formikForm.handleSubmit}>
                    <Form.Group className="mb-3" controlId="formWeeklyGoal">
                        <Form.Label className="text-white">How many days a week do you plan to workout</Form.Label>
                        <Form.Select
                            name="workout_days_per_week"
                            onChange={formikForm.handleChange}
                            value={formikForm.values.workout_days_per_week}
                        >
                            <option value={formikForm.values.workout_days_per_week}>{formikForm.values.workout_days_per_week}</option>
                            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                                <option key={day} value={day}>{day}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formWeightGoal">
                        <Form.Label className="text-white">What is your goal weight?</Form.Label>
                        <Form.Control
                            type="number"
                            name="goal_weight"
                            onChange={formikForm.handleChange}
                            value={formikForm.values.goal_weight}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formStepGoal">
                        <Form.Label className="text-white">What is the daily amount of steps you plan to take?</Form.Label>
                        <Form.Control
                            type="number"
                            name="steps_per_day"
                            onChange={formikForm.handleChange}
                            value={formikForm.values.steps_per_day}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formTimeGoal">
                        <Form.Label className="text-white">How long do you plan to workout each day in minutes?</Form.Label>
                        <Form.Control
                            type="number"
                            name="time_active_per_day"
                            onChange={formikForm.handleChange}
                            value={formikForm.values.time_active_per_day}
                        />
                    </Form.Group>

                    <Button variant="primary" type="submit" className="w-100">
                        Submit
                    </Button>
                </Form>
            </div>
            <div>
                <p>
                    <Link
                        to={`/UserProfile/${clientId}`}
                        style={{ color: "#1d271d", fontWeight: "bold" }}
                    >
                        Skip
                    </Link>
                </p>
            </div>
        </Container>
    );
}



export default OnboardingSurveyPage;
