import { useNavigate, useParams } from "react-router-dom";
import "./Landingcss.css";
import React, { useState, useEffect } from "react";
import { Navbar, Nav } from "react-bootstrap";

const LandingPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [landingData, setLandingData] = useState({
    top_coaches: [],
    trackers: [],
  });

  useEffect(() => {
    const loggedInId = localStorage.getItem("authenticatedClientId");
    if (loggedInId !== clientId) {
      navigate(`/UserProfile/${loggedInId}`);
      return;
    }
  }, [clientId, navigate]);

  useEffect(() => {
    const loggedInId = localStorage.getItem("authenticatedClientId");
    const userRole = localStorage.getItem("userRole"); 
    if (loggedInId !== clientId) {
      navigate(`/UserProfile/${loggedInId}`);
      return;
    }
    if (userRole === 'coach') {
      navigate(`/CoachLanding/${clientId}`);
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
      const response = await fetch(`/api/api/landing_page/${clientId}`);
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
          <li className="nav-item active">Dashboard</li>
          <li className="nav-item" onClick={() => navigate(`/MyCoach/${clientId}`)}> My Coach</li>
          <li className="nav-item" onClick={() => navigate(`/WorkoutLogPage/${clientId}`)}>Workout Logs</li>
          <li className="nav-item"onClick={() => navigate(`/MealTrackPage/${clientId}`)}>Meal Tracker</li>
          <li className="nav-item" onClick={() => navigate(`/MoodTrackPage/${clientId}`)}> Mood Tracker</li>
          <li className="nav-item">Messages</li>
          <li className="nav-item">Subscriptions</li>
          <li className="nav-item">Analytics</li>
          <li
            className="nav-item"
            onClick={() => navigate(`/UserProfile/${clientId}`)}
          >
            My Profile{" "}
          </li>
        </ul>

        <div className="sidebar-bottom">
          <button className="nav-item" onClickCapture={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <main className="main-content">
        <header className="dashboard-header">
          <h1 className="welcome-text">Welcome Back!</h1>

          <div className="search-container">
            <p>Search here</p>
            <input
              type="text"
              className="form-control search-input"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleEnter}
            />
            <button onClick={handleSearch}>Search</button>
          </div>
        </header>

        <div className="dashboard-grid">
          <div className="grid-left">
            <div className="section-card">
              <div>
              <h3> Mood Tracker</h3>
              {landingData.trackers.map((mood) => (
                <div key={mood.log_date} className="coach-square">
                  <p> {mood.log_date} </p>
                  <p> Score: {mood.mood_score} </p>
                  <p>Feeling: {mood.mood_label}</p>
                  
                </div>
              ))}
            </div>
            </div>

            <div className="section-card">
              <h3> Exercise tracker.</h3>
              <div className="chart-placeholder">TODO: Add exercise tracker logic here.</div>
            </div>
          </div>

          <div className="grid-right">
            <div className="section-card">
              <h3>Top Coaches</h3>
              {landingData.top_coaches.map((coach) => (
                <div key={coach.coach_id} className="coach-square">
                  <h3> {coach.first_name} {coach.last_name} </h3>
                  <p>Specialty: {coach.specialty}</p>
                  <p>Rating: {coach.average_rating } ⭐ </p>
                </div>
              ))}
            </div>

            <div className="section-card">
              <h3>Meal Tracker</h3>
              <p>TODO: Add meal tracker logic here.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
//TODO: Fix Styling
//TODO: Fix Sqares content
export default LandingPage;
