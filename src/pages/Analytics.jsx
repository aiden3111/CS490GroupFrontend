import { useNavigate, useParams } from "react-router-dom";
import "./Landingcss.css";
import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const Analytics = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  

  const [calorieData, setCalorieData] = useState([]);
  const [stepData, setStepData] = useState([]);
  const [moodData, setMoodData] = useState([]);

  useEffect(() => {
    const loggedInId = localStorage.getItem("authenticatedClientId");
    if (loggedInId !== clientId) {
      navigate(`/UserProfile/${loggedInId}`);
    }
  }, [clientId, navigate]);

  
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [calRes, stepRes, moodRes] = await Promise.all([
          fetch(`http://127.0.0.1:5000/api/calorie_graph/${clientId}`),
          fetch(`http://127.0.0.1:5000/api/steps_graph/${clientId}`),
          fetch(`/api/api/mood/${clientId}`)
        ]);

        setCalorieData(await calRes.json());
        setStepData(await stepRes.json());
        setMoodData(await moodRes.json());
      } catch (err) {
        console.error("Failed to fetch analytics data", err);
      }
    };
    fetchAllData();
  }, [clientId]);

  return (
    <div className="dashboard-container">
      <nav className="sidebar">
        <div className="brand-logo">BitFit</div>
        <ul className="nav-list">
          <li className="nav-item" onClick={() => navigate(`/LandingPage/${clientId}`)}>Dashboard</li>
          <li className="nav-item active">Analytics</li>
          <li className="nav-item" onClick={() => navigate(`/UserProfile/${clientId}`)}>My Profile</li>
        </ul>
      </nav>

      <main className="main-content">
        <h1>Health Analytics</h1>
        
        <Container fluid>
          <Row className="mb-4">
        
            <Col md={12} className="section-card">
              <h3>Calorie Trends</h3>
              <div style={{ width: "100%", height: 250 }}>
                <ResponsiveContainer>
                  <LineChart data={calorieData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="log_date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="actual_calories" stroke="#509e54" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Col>
          </Row>

          <Row className="mb-4">
          
            <Col md={12} className="section-card">
              <h3>Steps Trends</h3>
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

          <Row>
            
            <Col md={12} className="section-card">
              <h3>Mood Score Trends</h3>
              <div style={{ width: "100%", height: 250 }}>
                <ResponsiveContainer>
                  <LineChart data={moodData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="log_date" />
                    <YAxis domain={[0, 5]} /> 
                    <Tooltip />
                    <Line type="monotone" dataKey="mood_score" stroke="#f59e0b" />
                  </LineChart>
                </ResponsiveContainer>
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

export default Analytics;