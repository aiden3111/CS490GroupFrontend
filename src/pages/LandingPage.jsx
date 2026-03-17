import { useNavigate, useParams } from "react-router-dom";
import "./Landingcss.css";
import React, { useState } from "react";
import { Navbar, Nav } from "react-bootstrap";

const LandingPage = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();

  //TODO: add the links to side bar
  //TODO: ask Litzy add a button back on user profile
  //TODO: Add logut logit
  //TODO: Build the top bar
  //TODO: add the search
  return (
    <div className="dashboard-container">
     

      <nav className="sidebar">
        <div className="brand-logo">BitFit</div>
        <ul className="nav-list">
          <li className="nav-item active">Dashboard</li>
          <li className="nav-item">MyCoaches</li>
          <li className="nav-item">Workout Logs</li>
          <li className="nav-item">Meal Tracker</li>
          <li className="nav-item">Mood Tracker</li>
          <li className="nav-item">Messages</li>
          <li className="nav-item">Subscriptions</li>
          <li className="nav-item">Analytics</li>
          <li
            className="nav-item"
            onClick={() => navigate(`/UserProfile/${clientId}`)}
          >
            My Profile
          </li>
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
          </div>
        </header>

        <div className="dashboard-grid">
          <div className="grid-left">
            <div className="section-card">
              <h3> Mood Tracker</h3>
              <div className="chart-placeholder">TODO: put the chart here</div>
            </div>

             <div className="section-card">
              <h3> Mood Tracker</h3>
              <div className="chart-placeholder">TODO: put the chart here</div>
            </div>
          </div>

          <div className="grid-right">
            <div className="section-card">
              <h3>Top Coaches</h3>
              <p>TODO: Loading coach recommendations.</p>
            </div>

             <div className="section-card">
              <h3>Top Coaches</h3>
              <p>TODO: Loading coach recommendations.</p>
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
