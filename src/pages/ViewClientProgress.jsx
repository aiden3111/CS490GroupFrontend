import { useNavigate, useParams } from "react-router-dom";
import "./Landingcss.css";
import React, { useState, useEffect } from "react";


const ViewClientProgress = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();




   useEffect(() => {
  const fetchClientProgress = async () => {
    // This calls the specific coach endpoint you just showed me
    const res = await fetch(`http://127.0.0.1:5000/api/coach/client_progress/${clientId}`);
    const data = await res.json();
    
    setStepData(data.steps); // From the "steps" key in your JSON
    setCalorieData(data.calories); // From the "calories" key in your JSON
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
        <h3>Hellllo veiw client progress</h3>
  
   
      </main>
    </div>
  );
};

export default ViewClientProgress;