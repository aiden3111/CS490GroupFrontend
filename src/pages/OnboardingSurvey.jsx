import React, { useState } from "react";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { useFormik } from "formik";
import "./Regcss.css";
import { useParams, useNavigate, Link } from "react-router-dom";


function OnboardingSurveyPage() {
    const navigate = useNavigate();
    const { clientId } = useParams();
    const [selectedDays, setSelectedDays] = useState(null);
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
                        navigate(`/LandingPage/${clientId}`);
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
    const handleDaySelect = (day) => {
        setSelectedDays(day);
        formikForm.setFieldValue("workout_days_per_week", day);
    };

    const filledCount = [
        selectedDays,
        formikForm.values.goal_weight,
        formikForm.values.steps_per_day,
        formikForm.values.time_active_per_day,
    ].filter(Boolean).length;

    const progress = Math.round((filledCount / 4) * 100);

    return (
        <div className="survey-page">
            <div className="survey-wrap">

                <div className="survey-header">
                    <div className="survey-brand">BitFit</div>
                    <div className="survey-progress-track">
                        <div className="survey-progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="survey-step-label">Step 2 of 2 — Set your goals</div>
                    <h1 className="survey-title">Let's personalize your experience</h1>
                    <p className="survey-sub">These goals help us tailor your plan. You can update them anytime.</p>
                </div>

                <form onSubmit={formikForm.handleSubmit}>
                    <div className="survey-card">

                        <div className="survey-q">
                            <div className="survey-q-label">Question 1</div>
                            <div className="survey-q-text">How many days a week do you plan to work out?</div>
                            <div className="survey-day-grid">
                                {[1, 2, 3, 4, 5, 6, 7].map(d => (
                                    <button
                                        type="button"
                                        key={d}
                                        className={`survey-day-btn ${selectedDays === d ? "selected" : ""}`}
                                        onClick={() => handleDaySelect(d)}
                                    >{d}</button>
                                ))}
                            </div>
                        </div>

                        <div className="survey-divider" />

                        <div className="survey-q">
                            <div className="survey-q-label">Question 2</div>
                            <div className="survey-q-text">What is your goal weight?</div>
                            <div className="survey-input-unit">
                                <input
                                    className="survey-input"
                                    type="number"
                                    name="goal_weight"
                                    placeholder="160"
                                    value={formikForm.values.goal_weight}
                                    onChange={formikForm.handleChange}
                                />
                                <span className="survey-unit">lbs</span>
                            </div>
                        </div>

                        <div className="survey-divider" />

                        <div className="survey-q">
                            <div className="survey-q-label">Question 3</div>
                            <div className="survey-q-text">How many steps do you aim to take daily?</div>
                            <div className="survey-input-unit">
                                <input
                                    className="survey-input"
                                    type="number"
                                    name="steps_per_day"
                                    placeholder="8000"
                                    value={formikForm.values.steps_per_day}
                                    onChange={formikForm.handleChange}
                                />
                                <span className="survey-unit">steps</span>
                            </div>
                        </div>

                        <div className="survey-divider" />

                        <div className="survey-q">
                            <div className="survey-q-label">Question 4</div>
                            <div className="survey-q-text">How long do you plan to be active each day?</div>
                            <div className="survey-input-unit">
                                <input
                                    className="survey-input"
                                    type="number"
                                    name="time_active_per_day"
                                    placeholder="45"
                                    value={formikForm.values.time_active_per_day}
                                    onChange={formikForm.handleChange}
                                />
                                <span className="survey-unit">hrs/day</span>
                            </div>
                        </div>

                        <div className="survey-actions">
                            <button type="submit" className="survey-submit-btn">Complete Setup</button>
                            <Link to={`/LandingPage/${clientId}`} className="survey-skip">
                                Skip for now — I'll set goals later
                            </Link>
                        </div>

                    </div>
                </form>
            </div>
        </div>
    );
}

export default OnboardingSurveyPage;