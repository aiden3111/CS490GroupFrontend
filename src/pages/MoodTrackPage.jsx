import { useNavigate, useParams } from "react-router-dom";
import "./Landingcss.css";
import React, { useState, useEffect } from "react";
import { Navbar, Nav } from "react-bootstrap";

const MoodTrackPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [mooddata, setLandingData] = useState([]);

  useEffect(() => {
    const loggedInId = localStorage.getItem("authenticatedClientId");
    if (loggedInId !== clientId) {
      navigate(`/UserProfile/${loggedInId}`);
      return;
    }
  }, [clientId, navigate]);

  const handleSearch = () => {
    if (searchTerm.trim().length === 0) {
      alert("Please enter a valid search term.");
      return;
    }
    const encodedSearch = encodeURIComponent(searchTerm);
    navigate(`/CoachSearch/${clientId}?search=${searchTerm}`);
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authenticatedClientId");
    navigate("/LoginPage/");
  };

  useEffect(() => {
    const fetchLandingData = async () => {
      const response = await fetch(`/api/api/mood/${clientId}`);
      const data = await response.json();
      setLandingData(data);
    };
    fetchLandingData();
  }, [clientId]);

  //TODO: add the links to side bar
  //TODO: Build the top bar

  return (
    <div className="dashboard-container">
      <nav className="sidebar">
        <div className="brand-logo">BitFit</div>
        <ul className="nav-list">
          <li className="nav-item"onClick={() => navigate(`/LandingPage/${clientId}`)}>Dashboard</li>
          <li className="nav-item" onClick={() => navigate(`/MyCoach/${clientId}`)}>My Coaches </li>
          <li className="nav-item" onClick={() => navigate(`/WorkoutLogPage/${clientId}`)}>Workout Logs</li>
          <li className="nav-item"onClick={() => navigate(`/MealTrackPage/${clientId}`)}>Meal Tracker</li>
          <li className="nav-item active">Mood Tracker</li>
          <li className="nav-item" onClick={() => navigate(`/MessagingPage/${clientId}`)}>Messages</li>
          <li className="nav-item">Subscriptions</li>
          <li className="nav-item">Analytics</li>
          <li className="nav-item"onClick={() => navigate(`/UserProfile/${clientId}`)}>My Profile</li>
        </ul>

        <div className="sidebar-bottom">
          <button className="nav-item" onClickCapture={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <div className="main-content">
        <div className="header">
          <h1>Mood Tracker</h1>
          {mooddata.map((mood) => (
           <div key={mood.log_date} className="mood-square">
            <p>Date:  {mood.log_date}</p>
             <p>Score {mood.mood_score}</p>
                <p>Label: {mood.mood_label}</p>
                <p>Aditional notes: {mood.notes}</p>
                </div>
          ))}
        </div>
        <div className="mood-graph">

        </div>


      </div>

    </div>
  );
};
//TODO: Fix Styling
//TODO: Fix Sqares content
export default MoodTrackPage;
