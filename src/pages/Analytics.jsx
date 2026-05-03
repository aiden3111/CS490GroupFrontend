import { useNavigate, useParams,} from "react-router-dom";
import "./Landingcss.css";
import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
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

  const [range, setRange] = useState("week");
  


  useEffect(() => {
    const loggedInId = localStorage.getItem("authenticatedClientId");
    if (loggedInId !== clientId) {
      navigate(`/UserProfile/${loggedInId}`);
    }
  }, [clientId, navigate]);

useEffect(() => {
    const fetchAllData = async () => {
      try {
      
        const calRes = await fetch(`/api/calorie_graph/${clientId}?range=${range}`);
        const rawCalorieData = await calRes.json();

        if (Array.isArray(rawCalorieData)) {
            const dailyTotals = rawCalorieData.reduce((acc, current) => {
                const date = current.log_date;
                if (!acc[date]) {
                    acc[date] = { log_date: date, actual_calories: 0 };
                }
                acc[date].actual_calories += Number(current.actual_calories);
                return acc;
            }, {});
            setCalorieData(Object.values(dailyTotals));
        }


        const stepRes = await fetch(`/api/steps_graph/${clientId}?range=${range}`);
        const stpData = await stepRes.json();
        setStepData(Array.isArray(stpData) ? stpData : []);

        const moodRes = await fetch(`/api/mood/${clientId}`);
        const mdData = await moodRes.json();
        setMoodData(Array.isArray(mdData) ? mdData : []);

      } catch (err) {
        console.error("Failed to fetch analytics data", err);
      }
    };
    fetchAllData();
  }, [clientId, range]);

  return (
    <div className="dashboard-container">
      <Sidebar activePage="analytics" />

      <main className="main-content">
        <h1>Health Analytics</h1>
        <div style={{ marginBottom: "16px" }}>
          <label style={{ color: "var(--muted)", fontSize: "13px", marginRight: "8px" }}>Filter Range:</label>
          <select
            className="bitfit-input"
            value={range}
            onChange={(e) => setRange(e.target.value)}
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "6px", color: "white", padding: "6px 10px" }}
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

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
                    <Line type="monotone" dataKey="actual_calories" stroke="#509e54" />
                  </LineChart>
                </ResponsiveContainer>
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

          <Row>
            
            <Col md={12} className="section-card">
              <h3>Daily Mood Score Trends</h3>
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