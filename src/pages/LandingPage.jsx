import { useNavigate, useParams } from "react-router-dom";
import "./Landingcss.css";
import React, { useState, useEffect } from "react";

const LandingPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { clientId } = useParams();
  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole");
  const [workoutHistory, setWorkoutHistory] = useState({});
  const [expandedDates, setExpandedDates] = useState({});
  const [exercises, setExercises] = useState([]);
  const [landingData, setLandingData] = useState({
    top_coaches: [],
    trackers: [],
  });

  const [hasUnread, setHasUnread] = useState(false);
  const [calorieData, setCalorieData] = useState([]);
  useEffect(() => {
    const checkUnread = async () => {
      try {
        const res = await fetch(
          `/api/notifications/unread-count/${clientId}`,
        );
        const data = await res.json();
        if (data.success && data.unread_count > 0) {
          setHasUnread(true);
        } else {
          setHasUnread(false);
        }
      } catch (err) {
        console.error("Error checking unread status:", err);
      }
    };

    checkUnread();
  }, [clientId]);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch(
          `/api/admin/check_status/${clientId}`,
        );
        const data = await res.json();

        if (data.status === "disabled" || data.status === "suspended") {
          localStorage.clear();
          navigate(`/AccountSuspended`);
        }
      } catch (err) {
        console.error("Status check failed");
      }
    };

    checkStatus();

    const loggedInId = localStorage.getItem("authenticatedClientId");
    if (loggedInId !== clientId) {
      navigate(`/UserProfile/${loggedInId}`);
      return;
    }
    if (userRole === "coach") {
      navigate(`/CoachLanding/${clientId}`);
      return;
    }
  }, [clientId, navigate, userRole]);

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
      const response = await fetch(`/api/landing_page/${clientId}`);
      const data = await response.json();
      setLandingData(data);
    };
    fetchLandingData();
    fetchHistory();
    fetchExercises();
  }, [clientId]);

  const fetchHistory = async () => {
    try {
      const res = await fetch(
        `/api/workoutLogPage/history/${clientId}`,
      );
      const data = await res.json();
      setWorkoutHistory(data.workout_history || {});
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  const fetchExercises = async () => {
    try {
      const res = await fetch(`/api/exercises`);
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

  useEffect(() => {
    const fetchCalorieData = async () => {
      const response = await fetch(
        `/api/calorie_graph/${clientId}`,
      );
      const data = await response.json();
      setCalorieData(data);
    };
    fetchCalorieData();
  }, [clientId]);

  return (
    <div className="dashboard-container">
      <nav className="sidebar">
        <div className="brand-logo">BitFit</div>
        <span className="nav-section-label">Main</span>

        <ul className="nav-list">
          <li className="nav-item active">Dashboard</li>
          <li
            className={`nav-item ${location.pathname.includes("NotificationsPage") ? "active" : ""}`}
            onClick={() => navigate(`/NotificationsPage/${clientId}`)}
          >
            {" "}
            Notifications{" "}
            {hasUnread && <span className="notification-dot"></span>}{" "}
          </li>
          <li
            className="nav-item"
            onClick={() => navigate(`/MyCoach/${clientId}`)}
          >
            {" "}
            My Coach
          </li>
          <li
            className="nav-item"
            onClick={() => navigate(`/WorkoutLogPage/${clientId}`)}
          >
            Workout Logs
          </li>
          <li
            className="nav-item"
            onClick={() => navigate(`/MealTrackPage/${clientId}`)}
          >
            Meal Tracker
          </li>
          <span className="nav-section-label">Insights</span>

          <li
            className="nav-item"
            onClick={() => navigate(`/MoodTrackPage/${clientId}`)}
          >
            {" "}
            Mood Tracker{" "}
          </li>
          <li
            className="nav-item"
            onClick={() => navigate(`/MessagingPage/${clientId}`)}
          >
            Messages
          </li>
          <li
            className="nav-item"
            onClick={() => navigate(`/Analytics/${clientId}`)}
          >
            Analytics
          </li>
          {userRole === "admin" && (
            <>
              <span className="nav-section-label">Admin</span>
              <li
                className="nav-item"
                onClick={() => navigate(`/AdminUsers/${clientId}`)}
              >
                User Management
              </li>
              <li
                className="nav-item"
                onClick={() => navigate(`/AdminReports/${clientId}`)}
              >
                Coach Reports
              </li>
              <li
                className="nav-item"
                onClick={() => navigate(`/AdminCoachApplications/${clientId}`)}
              >
                Coach Applications
              </li>
            </>
          )}
          <span className="nav-section-label">Account</span>

          <li className="nav-item">Subscriptions</li>

          <li
            className="nav-item"
            onClick={() => navigate(`/UserProfile/${clientId}`)}
          >
            My Profile{" "}
          </li>
        </ul>

        <div className="sidebar-bottom">
          <button className="logout-btn" onClickCapture={handleLogout}>
            <span></span>
            Logout
          </button>
        </div>
      </nav>

      <main className="main-content">
        <header className="dashboard-header">
          <h1 className="welcome-text">
            Welcome Back, {landingData.user_name}!
          </h1>

          <div className="search-container">
            <span className="search-icon">⌕</span>
            <input
              type="text"
              className="form-control search-input"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleEnter}
            />
            <button className="search-btn" onClick={handleSearch}>
              Search
            </button>
          </div>
        </header>

        <div className="dashboard-grid">
          <div className="card">
            <div>
              <h3> Mood Tracker </h3>
              {landingData.trackers?.length > 0 ? (
                landingData.trackers.slice(0, 4).map((mood) => (
                  <div key={mood.log_date} className="mood-entry">
                    <div>
                      <div className="mood-label">{mood.mood_label}</div>
                      <div className="mood-date">{mood.log_date}</div>
                    </div>
                    <span className="mood-score">{mood.mood_score} / 10</span>
                  </div>
                ))
              ) : (
                <p style={{ color: "var(--muted)", fontSize: "13px" }}>
                  No mood logs found.
                </p>
              )}
            </div>
          </div>

          <div className="card">
            <h3> Exercise Tracker</h3>
            {/* Workout History */}
            <div style={{ marginTop: "32px" }}>
              <h4 style={{ color: "#78b47b", marginBottom: "16px" }}>
                Workout History
              </h4>
              {Object.keys(workoutHistory).length === 0 ? (
                <p style={{ color: "var(--muted)", fontSize: "13px" }}>
                  No workout found.
                </p>
              ) : (
                Object.keys(workoutHistory)
                  .slice(0, 4)
                  .map((date) => (
                    <div key={date} className="workout-date-group">
                      {/* Date Header */}
                      <div
                        className="workout-date-header"
                        onClick={() => toggleDate(date)}
                      >
                        <span className="workout-date-label">{date}</span>
                        <span className="workout-count">
                          {workoutHistory[date].length} exercise
                          {workoutHistory[date].length !== 1 ? "s" : ""}{" "}
                          {expandedDates[date] ? "▲" : "▼"}
                        </span>
                      </div>
                      {expandedDates[date] &&
                        workoutHistory[date].map((log) => (
                          <div key={log.log_id} className="workout-exercise">
                            <span>
                              <strong style={{ color: "var(--text)" }}>
                                {getExerciseName(log.exercise_id)}
                              </strong>
                              {" · "}
                              {log.sets_completed &&
                                `${log.sets_completed} sets`}
                              {log.reps_completed &&
                                ` × ${log.reps_completed} reps`}
                              {log.weight && ` @ ${log.weight} lbs`}
                              {log.cardio_type && ` | ${log.cardio_type}`}
                              {log.cardio_duration &&
                                ` ${log.cardio_duration} min`}
                              {log.notes && ` — ${log.notes}`}
                            </span>
                          </div>
                        ))}
                    </div>
                  ))
              )}
            </div>
          </div>

          <div className="card">
            <h3>Top Coaches</h3>
            {landingData.top_coaches?.length > 0 ? (
              landingData.top_coaches.slice(0, 4).map((coach) => (
                <div key={coach.coach_id} className="coach-square">
                  <div className="coach-avatar">
                    {coach.first_name[0]}
                    {coach.last_name[0]}
                  </div>
                  <div className="coach-info">
                    <div className="coach-name">
                      {coach.first_name} {coach.last_name}
                    </div>
                    <div className="coach-spec">{coach.specialty}</div>
                  </div>
                  <span className="coach-rating">
                    ★{" "}
                    {coach.average_rating != null
                      ? Number(coach.average_rating).toFixed(2)
                      : "0.00"}
                  </span>
                </div>
              ))
            ) : (
              <p style={{ color: "var(--muted)", fontSize: "13px" }}>
                No coaches found.
              </p>
            )}
          </div>

          <div className="card">
            <h3>Meal Tracker</h3>
            <div style={{ marginTop: "16px" }}>
              {calorieData.length > 0 ? (
                calorieData.slice(0, 4).map((cal) => (
                  <div key={cal.meal_log_id} className="mood-entry">
                    <div>
                      <div className="mood-label">Meal Log</div>
                      <div className="mood-date">
                        {cal.log_date} {cal.notes ? `— ${cal.notes}` : ""}
                      </div>
                    </div>
                    <span className="mood-score" style={{ color: "#85fb24" }}>
                      {cal.actual_calories} kcal
                    </span>
                  </div>
                ))
              ) : (
                <p style={{ color: "var(--muted)", fontSize: "13px" }}>
                  No meals logged yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
//TODO: Fix Styling

export default LandingPage;
