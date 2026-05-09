import { useNavigate, useParams } from "react-router-dom";
import "./Landingcss.css";
import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
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

const StepsTracker = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [stepData, setStepData] = useState([]);

  const fetchStepData = async () => {
    try {
      const response = await fetch(`/api/steps_graph/${clientId}`);
      const data = await response.json();
      setStepData([...data].reverse());
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    const loggedInId = localStorage.getItem("authenticatedClientId");
    if (loggedInId !== clientId) {
      navigate(`/UserProfile/${loggedInId}`);
      return;
    }
    fetchStepData();
  }, [clientId, navigate]);

 const formatListDate = (dateStr) => {
  const date = new Date(dateStr.replace(/-/g, '\/'));
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  }).replace(/,/g, ''); 
};

const formatGraphDate = (dateStr) => {
  const date = new Date(dateStr.replace(/-/g, '\/'));
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: '2-digit' 
  });
};
  const formik = useFormik({
    initialValues: {
      steps: "",
    },
    onSubmit: async (values) => {
      try {
        const res = await fetch(`/api/logging`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_id: clientId,
            log_date: date,
            steps: values.steps,
          }),
        });

        if (res.ok) {
          alert("Steps added");
          formik.resetForm({
            values: {
              ...formik.initialValues,
              selectedClientId: values.selectedClientId,
            },
          });
          await fetchStepData();
        } else {
          const err = await res.json();
          alert(`Error: ${err.error}`);
        }
      } catch (err) {
        console.error("Failed to steps entry", err);
      }
    },
  });

  return (
    <div className="dashboard-container">
      <Sidebar activePage="steps" />

      <div className="main-content">
        <div className="header">
          <h2>Workout Logs</h2>
          <h1>Steps Tracker</h1>
          <div>
            <Container className="mt-5">
              <h2>How many steps today?</h2>
              <div
                style={{
                  backgroundColor: "#2a472a",
                  padding: "30px",
                  borderRadius: "15px",
                  color: "white",
                }}
              >
                <Form onSubmit={formik.handleSubmit}>
                  <Form.Group className="mb-3 flex-fill">
                    <Form.Label>Steps</Form.Label>
                    <Form.Control
                      type="number"
                      name="steps"
                      onChange={formik.handleChange}
                      value={formik.values.steps}
                    />
                  </Form.Group>
                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 mt-3"
                  >
                    Add Entry
                  </Button>
                </Form>
              </div>
            </Container>
          </div>
        </div>
        <div className="main-content">
          <div className="steps-log-section">
            <h3>Previous Logs</h3>
            <div className="steps-scroll-container">
              {stepData.map((steps) => (
                <div key={steps.log_date} className="meal-square">
                  <p><strong>Date:</strong> {formatListDate(item.log_date)}</p>
                  <p>
                    <strong>Steps:</strong> {steps.steps}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="callgraph">
            <div
              className="calorie-graph"
              style={{ width: "100%", height: 300, marginTop: "20px" }}
            >
              <h3>Steps Trends</h3>
              {stepData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[...stepData].reverse()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="log_date"
                      tickFormatter={formatGraphDate}
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={formatListDate}
                    />
                    <Line
                      type="monotone"
                      dataKey="steps"
                      stroke="#509e54"
                      strokeWidth={3}
                      dot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p>No steps data found.</p>
              )}
            </div>
          </div>
        </div>
        <div className="mood-graph"></div>
      </div>
    </div>
  );
};

export default StepsTracker;
