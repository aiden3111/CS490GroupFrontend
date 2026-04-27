import { useNavigate, useParams } from "react-router-dom";
import "./Landingcss.css";
import React, { useState, useEffect } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const MealTrackPage = () => {
 
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [calorieData, setCalorieData] = useState([]);

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

  useEffect(() => {
    const fetchCalorieData = async () => {
      const response = await fetch(`http://127.0.0.1:5000/api/calorie_graph/${clientId}`);
      const data = await response.json();
      setCalorieData(data);
    };
    fetchCalorieData();
  }, [clientId]);

  //TODO: add the links to side bar
  //TODO: Build the top bar

  return (
    <div className="dashboard-container">
      <nav className="sidebar">
        <div className="brand-logo">BitFit</div>
        <span className="nav-section-label">Main</span>

        <ul className="nav-list">
          <li className="nav-item" onClick={() => navigate(`/LandingPage/${clientId}`)}> Dashboard</li>
          <li className="nav-item" onClick={() => navigate(`/MyCoach/${clientId}`)}> My Coaches </li>
          <li className="nav-item" onClick={() => navigate(`/WorkoutLogPage/${clientId}`)}> Workout Logs</li>
          <li className="nav-item active">Meal Tracker</li>
              <ul className="sub-sub-nav">
                        <li className="nav-item"> Meal Plan</li>
                        <li className="nav-item" onClick={() => navigate(`/LogTodaysMeal/${clientId}`)}> Log Today's Meals</li>
                        <li className="nav-item" onClick={() => navigate(`/EditTodaysMeal/${clientId}`)}> Edit Today's Meals</li>

              </ul>
          <span className="nav-section-label">Insights</span>

          <li className="nav-item" onClick={() => navigate(`/MoodTrackPage/${clientId}`)}> Mood Tracker </li>
          <li className="nav-item" onClick={() => navigate(`/MessagingPage/${clientId}`)}>Messages</li>
          <li className="nav-item">Analytics</li>
          <span className="nav-section-label">Account</span>
          <li className="nav-item">Subscriptions</li>
          <li
            className="nav-item"
            onClick={() => navigate(`/UserProfile/${clientId}`)}
          >
            My Profile
          </li>
        </ul>

        <div className="sidebar-bottom">
          <button className="logout-btn" onClickCapture={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <div className="main-content">
        <h1>Meal Tracker</h1>
        <div className="meal-tracker-header">
          <h2>Meal & Calories</h2>
          {calorieData.map((cal) => (
            <div key={cal.meal_log_id} className="meal-square">
              <p>Date: {cal.log_date}</p>
              <p>Calories: {cal.actual_calories}</p>
              <p>Notes: {cal.notes}</p>
            </div>
          ))}
        </div>
        <div className="callgraph">
          <div className="calorie-graph" style={{ width: "100%", height: 300, marginTop: "20px" }}>
            <h3>Calorie Trends</h3>
            {calorieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={calorieData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="log_date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="actual_calories"
                    stroke="#509e54"
                    fill="#78b47b"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p>No calorie data found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

//TODO: Fix Sqares content
export default MealTrackPage;
