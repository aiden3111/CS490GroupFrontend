import { useNavigate, useParams } from "react-router-dom";
import "./Landingcss.css";
import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";


const ViewClientProgress = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [calorieData, setCalorieData] = useState([]);
  const [stepData, setStepData] = useState([]);
  const [range, setRange] = useState("week");
  const [clientData, setClientData] = useState({ client_name: "" });

   useEffect(() => {
  const fetchClientProgress = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/coach/client_progress/${clientId}`);
      const data = await res.json();
      
      setStepData(data.steps || []);
      setCalorieData(data.calories || []);
      
      setClientData({ client_name: data.client_name }); 
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };
  fetchClientProgress();
}, [clientId]);

  const handleLogout = () => {
    localStorage.removeItem("authenticatedClientId");
    navigate("/LoginPage/");
  };

  return (
    <div className="dashboard-container">
      <nav className="sidebar">
        <div className="brand-logo">BitFit</div>
        <span className="nav-section-label">Coach Features</span>
        <ul className="nav-list">
         <li className="nav-item" onClick={() => navigate(`/CoachLanding/${clientId}`)}>Dashboard</li>
        </ul>

        <div className="sidebar-bottom">
          <button className="logout-btn" onClickCapture={handleLogout}>Logout</button>
        </div>
      </nav>

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
                      <h3>Before and after pics</h3>
                      
                    </Col>
                  </Row>
                </Container>
   
      </main>
    </div>
  );
};

export default ViewClientProgress;