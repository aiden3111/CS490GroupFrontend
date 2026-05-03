import { useNavigate, useParams } from "react-router-dom";
import "./Landingcss.css";
import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import Sidebar from "../components/Sidebar";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const ViewClientProgress = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [calorieData, setCalorieData] = useState([]);
  const [stepData, setStepData] = useState([]);
  const [range, setRange] = useState("week");
  const [clientData, setClientData] = useState({ client_name: "" });

  const [workoutLogs, setWorkoutLogs] = useState([]); 
  useEffect(() => {
    const fetchClientProgress = async () => {
      try {
        const res = await fetch(
          `/api/coach/client_progress/${clientId}`,
        );
        const data = await res.json();

        setStepData(data.steps || []);
        setCalorieData(data.calories || []);
        setWorkoutLogs(data.workouts || []); 
        setClientData({ client_name: data.client_name });
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchClientProgress();
  }, [clientId]);

  return (
    <div className="dashboard-container">
      <Sidebar activePage="dashboard" />

      <main className="main-content">
        <h1>Progress for {clientData.client_name}</h1>
        <Container fluid>
          <Row className="mb-4">
            <Col md={12} className="section-card">
              <h3>Daily Calorie Trends</h3>
              <div style={{ width: "100%", height: 250 }}>
                <ResponsiveContainer>
                  <LineChart data={calorieData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="log_date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="actual_calories"
                      stroke="#509e54"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Col>
          </Row>
          <Row>
            <Col md={12} className="section-card mt-4">
              <h3>Recent Meal Details</h3>
              <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                {calorieData.length > 0 ? (
                  calorieData
                    .slice()
                    .reverse()
                    .map((meal, index) => (
                      <div
                        key={index}
                        className="mood-entry"
                        style={{ padding: "12px", marginBottom: "8px" }}
                      >
                        <div>
                          <div
                            className="mood-label"
                            style={{ color: "#fbbf24" }}
                          >
                            {meal.notes || "Meal Entry"}
                          </div>
                          <div className="mood-date">{meal.log_date}</div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#aaa",
                              marginTop: "4px",
                            }}
                          >
                            P: {meal.protein}g | C: {meal.carbs}g | F:{" "}
                            {meal.fats}g
                          </div>
                        </div>
                        <span className="mood-score">
                          {meal.actual_calories} kcal
                        </span>
                      </div>
                    ))
                ) : (
                  <p style={{ color: "var(--muted)" }}>
                    No detailed meal logs available.
                  </p>
                )}
              </div>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col md={12} className="section-card">
              <h3>Daily Steps Trends</h3>
              <div style={{ width: "100%", height: 250 }}>
                <ResponsiveContainer>
                  <LineChart data={stepData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="log_date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="steps" stroke="#3b82f6" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Col>
          </Row>
          <Row className="mt-4">
            <Col md={12} className="section-card">
              <h3>Client Workout History</h3>
              <div
                style={{
                  maxHeight: "400px",
                  overflowY: "auto",
                  marginTop: "16px",
                }}
              >
                {workoutLogs.length > 0 ? (
                  workoutLogs.map((log) => (
                    <div
                      key={log.log_id}
                      className="mood-entry"
                      style={{ marginBottom: "10px", padding: "15px" }}
                    >
                      <div>
                        <div
                          className="mood-label"
                          style={{ color: "#00ff44" }}
                        >
                          Exercise ID: {log.exercise_id}
                        </div>
                        <div className="mood-date">{log.log_date}</div>
                        <p
                          style={{
                            color: "#aaa",
                            fontSize: "13px",
                            margin: "4px 0",
                          }}
                        >
                          {log.sets_completed && `${log.sets_completed} sets`}
                          {log.reps_completed &&
                            ` × ${log.reps_completed} reps`}
                          {log.weight && ` @ ${log.weight} lbs`}
                          {log.notes && ` — ${log.notes}`}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: "var(--muted)" }}>
                    No workout logs found for this client.
                  </p>
                )}
              </div>
            </Col>
          </Row>

          <Row>
            <Col md={12} className="section-card">
              <h3>Before and after pics</h3>
            </Col>
          </Row>
        </Container>
      </main>
    </div>
  );
};

export default ViewClientProgress;
