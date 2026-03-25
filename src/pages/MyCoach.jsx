import { useNavigate, useParams } from "react-router-dom";
import "./Landingcss.css";
import React, { useState, useEffect } from "react";
import { Navbar, Nav } from "react-bootstrap";

const MyCoach = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [myCoach, setMyCoach] = useState(null);

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

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/api/my_coach/${clientId}`)
      .then((res) => res.json())
      .then((data) => {
        setMyCoach(data);
      })
      .catch((error) => console.error("Error fetching my coach:", error));
  }, [clientId]);

  const handleLogout = () => {
    //localStorage.removeItem("authenticatedClientId");
    localStorage.clear();
    navigate("/LoginPage/");
  };

  //TODO: add the links to side bar
  //TODO: Build the top bar

  return (
    <div className="dashboard-container">
      <nav className="sidebar">
        <div className="brand-logo">BitFit</div>
        <ul className="nav-list">
          <li
            className="nav-item"
            onClick={() => navigate(`/LandingPage/${clientId}`)}
          >
            Dashboard
          </li>
          <li className="nav-item active">MyCoaches</li>
          <li
            className="nav-item"
            onClick={() => navigate(`/WorkoutLogPage/${clientId}`)}
          >
            Workout Logs
          </li>
          <li className="nav-item">Meal Tracker</li>
          <li
            className="nav-item"
            onClick={() => navigate(`/MoodTrackPage/${clientId}`)}
          >
            {" "}
            Mood Tracker
          </li>
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
          <h1 className="welcome-text">My Coach</h1>

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
        <div className="section-card">
          {!myCoach ? (
            <div className="coach-info-display">
              <p>No Coach Found</p>
              <button
                className="btn-search"
                onClick={() => navigate(`/CoachSearch/${clientId}`)}
              >
                Find a Coach
              </button>
            </div>
          ) : (
            <div className="coach-info-display">
              <h4> {myCoach.first_name} {myCoach.last_name}</h4>
              <p><b>Specialty:</b>
                {myCoach?.specialty?.toLowerCase() === "both"
                  ? "Fitness & Nutrition"
                  : myCoach.specialty}</p>
              <p>
                <b>Pricing:</b> ${myCoach.pricing}
              </p>
              <p>
                
                <b>Availability:</b> {myCoach.availability}
              </p>
              <p>
               
                <b>Certifications:</b> {myCoach.certifications}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
//TODO:
export default MyCoach;
