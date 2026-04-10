import { useNavigate, useParams } from "react-router-dom";
import "./Landingcss.css";
import React, { useState, useEffect } from "react";
import { useFormik } from "formik";

const AssignMealPlan = () => {
    
    const { clientId } = useParams();
    const navigate = useNavigate();
    

    useEffect(() => {
        const loggedInId = localStorage.getItem("authenticatedClientId");
        if (loggedInId !== clientId) {
          navigate(`/UserProfile/${loggedInId}`);
          return;
        }
      }, [clientId, navigate]);

    const handleLogout = () => {
    localStorage.removeItem("authenticatedClientId");
    navigate("/LoginPage/");
  };

 
//TODO: add view restriction based on roles
//TODO: this should be nutritionist only

    return (
        <div className="dashboard-container">
            <nav className="sidebar">
                <div className="brand-logo">BitFit</div>
                <ul className="nav-list">
                    <li className="nav-item" onClick={() => navigate(`/LandingPage/${clientId}`)}>Dashboard</li>
                    <li className="nav-item" onClick={() => navigate(`/MyCoach/${clientId}`)}>My Coach</li>
                    <li className="nav-item" onClick={() => navigate(`/WourkoutPlanPage/${clientId}`)}>Workout Logs</li>
                    <ul className="sub-nav">
                        <li className="nav-item" onClick={() => navigate(`/StepsTracker/${clientId}`)}>Step Tracker</li>
                        <li className="nav-item" onClick={() => navigate(`/CustomExercise/${clientId}`)}>Custom Exercise</li>
                    </ul>
                    <li className="nav-item" onClick={() => navigate(`/MealTrackPage/${clientId}`)}>Meal Tracker</li>
                    <ul className="sub-sub-nav">
                        <li className="nav-item active"> Meal Plan</li>
                    </ul>
                    <li className="nav-item" onClick={() => navigate(`/MoodTrackPage/${clientId}`)}>Mood Tracker</li>
                    <li className="nav-item" onClick={() => navigate(`/MessagingPage/${clientId}`)}>Messages</li>
                    <li className="nav-item">Subscriptions</li>
                    <li className="nav-item">Analytics</li>
                    <li className="nav-item" onClick={() => navigate(`/UserProfile/${clientId}`)}>My Profile</li>
                </ul>
                <div className="sidebar-bottom">
                    <button className="nav-item" onClickCapture={handleLogout}>Logout</button>
                </div>
            </nav>

            <div className="main-content">
                <h1>Assingn Meal Plan</h1>
                
            </div>
        </div>
    );
};



export default AssignMealPlan;