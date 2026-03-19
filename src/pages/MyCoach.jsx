import { useNavigate, useParams } from "react-router-dom";
import "./Landingcss.css";
import React, { useState, useEffect } from "react";
import { Navbar, Nav } from "react-bootstrap";

const MyCoach = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { clientId } = useParams();
  const navigate = useNavigate();

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

  //TODO: add the links to side bar
  //TODO: ask Litzy add a button back on user profile
  //TODO: Add logut logit
  //TODO: Build the top bar
  

  
  return (
    <div className="dashboard-container">
      <nav className="sidebar">
        <div className="brand-logo">BitFit</div>
        <ul className="nav-list">
          <li className="nav-item" onClick={() => navigate(`/LandingPage/${clientId}`)}>Dashboard</li>
          <li className="nav-item active">MyCoaches</li>
          <li className="nav-item">Workout Logs</li>
          <li className="nav-item">Meal Tracker</li>
          <li className="nav-item">Mood Tracker</li>
          <li className="nav-item">Messages</li>
          <li className="nav-item">Subscriptions</li>
          <li className="nav-item">Analytics</li>
          <li className="nav-item" onClick={() => navigate(`/UserProfile/${clientId}`)}>
            My Profile </li>
        </ul>

        <div className="sidebar-bottom">
          <button className="nav-item">Logout</button>
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
              <h3> My Coach</h3>
              <div className="chart-placeholder">Coaches</div>
            </div>

            <div className="section-card">
              <h3> I dont know </h3>
              <div className="chart-placeholder">I dont know</div>
            </div>
          </div>

          <div className="grid-right">
            <div className="section-card">
              <h3>I dont know </h3>
              <p>Maybe remove it</p>
            </div>

            <div className="section-card">
                <h3>I dont know </h3>
              <p>Maybe remove it</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
//TODO: 
export default MyCoach;
