import { useNavigate, useParams } from "react-router-dom";
import "./Landingcss.css";
import React, { useState, useEffect } from "react";
import { Navbar, Nav } from "react-bootstrap";

const LandingPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [workoutHistory, setWorkoutHistory] = useState({});
  const [expandedDates, setExpandedDates] = useState({});
  const [exercises, setExercises] = useState([]);
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
    fetchHistory();
    fetchExercises();
  }, [clientId]);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/workoutLogPage/history/${clientId}`);
      const data = await res.json();
      setWorkoutHistory(data.workout_history || {});
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  const fetchExercises = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/exercises`);
      const data = await res.json();
      setExercises(data || []);
    } catch (err) {
      console.error("Error fetching exercises:", err);
    }
  };

  const toggleDate = (date) => {
    setExpandedDates((prev) => ({ ...prev, [date]: !prev[date] }));
  };

  const getExerciseName = (id) => {
    const ex = exercises.find((e) => e.exercise_id === id);
    return ex ? ex.exercise_name : `Exercise #${id}`;
  };

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
          <li className="nav-item" onClick={() => navigate(`/MealTrackPage/${clientId}`)}>Meal Tracker</li>
          <li className="nav-item" onClick={() => navigate(`/MoodTrackPage/${clientId}`)}> Mood Tracker</li>
          <li className="nav-item" onClick={() => navigate(`/MessagingPage/${clientId}`)}>Messages</li>
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
                {landingData.trackers?.length > 0 ? (
                  landingData.trackers.map((mood) => (
                    <div key={mood.log_date} className="coach-square">
                      <p> {mood.log_date} </p>
                      <p> Score: {mood.mood_score} </p>
                      <p>Feeling: {mood.mood_label}</p>

                    </div>
                  ))
                ) : (
                  <p>No mood logs found.</p>
                )}
              </div>
            </div>

            <div className="section-card">
              <h3> Exercise tracker.</h3>
              {/* Workout History */}
              <div style={{ marginTop: "32px" }}>
                <h2 style={{ color: "#78b47b", marginBottom: "16px" }}>Workout History</h2>
                {Object.keys(workoutHistory).length === 0 ? (
                  <p style={{ color: "#aaa" }}>No workout history found.</p>
                ) : (
                  Object.keys(workoutHistory).map((date) => (
                    <div key={date} style={{ marginBottom: "12px", borderRadius: "10px", overflow: "hidden", border: "1px solid #2e5c2e" }}>
                      {/* Date Header */}
                      <div
                        onClick={() => toggleDate(date)}
                        style={{
                          backgroundColor: "#1e3a1e",
                          padding: "14px 20px",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span style={{ color: "#78b47b", fontWeight: "bold", fontSize: "16px" }}>{date}</span>
                        <span style={{ color: "#aaa", fontSize: "13px" }}>
                          {workoutHistory[date].length} exercise{workoutHistory[date].length !== 1 ? "s" : ""} &nbsp;
                          {expandedDates[date] ? "▲" : "▼"}
                        </span>
                      </div>
                      {expandedDates[date] && (
                        <div style={{ backgroundColor: "#152815" }}>
                          {workoutHistory[date].map((log) => (
                            <div key={log.log_id} style={{ padding: "14px 20px", borderTop: "1px solid #2e5c2e" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                  <p style={{ color: "white", fontWeight: "bold", margin: 0 }}>
                                    {getExerciseName(log.exercise_id)}
                                  </p>
                                  <p style={{ color: "#aaa", fontSize: "13px", margin: "4px 0 0 0" }}>
                                    {log.sets_completed && `${log.sets_completed} sets`}
                                    {log.reps_completed && ` × ${log.reps_completed} reps`}
                                    {log.weight && ` @ ${log.weight} lbs`}
                                    {log.cardio_type && ` | ${log.cardio_type}`}
                                    {log.cardio_duration && ` ${log.cardio_duration} min`}
                                    {log.notes && ` — ${log.notes}`}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="grid-right">
            <div className="section-card">
              <h3>Top Coaches</h3>
              {landingData.top_coaches?.length > 0 ? (
                landingData.top_coaches.map((coach) => (
                  <div key={coach.coach_id} className="coach-square">
                    <h3> {coach.first_name} {coach.last_name} </h3>
                    <p>Specialty: {coach.specialty}</p>
                    <p>Rating: {coach.average_rating} ⭐ </p>
                  </div>
                ))
              ) : (
                <p>No coach found!</p>
              )}
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
