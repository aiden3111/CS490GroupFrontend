import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import "../pages/Landingcss.css";

const Sidebar = ({ activePage = "" }) => {
  const navigate = useNavigate();
  const clientId = localStorage.getItem("authenticatedClientId");
  const userRole = localStorage.getItem("userRole");
  const coachSpecialty = localStorage.getItem("coachSpecialty");
  const [hasUnread, setHasUnread] = useState(false);

  // Everyone is a client. Additional roles stack on top.
  const isCoach = userRole === "coach" || userRole === "nutritionist";
  const isAdmin = userRole === "admin";
  // Admins can also have coach specialty
  const hasCoachRole =
    isCoach ||
    (isAdmin &&
      (coachSpecialty === "fitness" ||
        coachSpecialty === "nutrition" ||
        coachSpecialty === "both"));
  const canAssignMeals =
    coachSpecialty === "nutrition" || coachSpecialty === "both";

  useEffect(() => {
    const checkUnread = async () => {
      try {
        const res = await fetch(`/api/notifications/unread-count/${clientId}`);
        const data = await res.json();
        setHasUnread(data.success && data.unread_count > 0);
      } catch {}
    };
    if (clientId) checkUnread();
  }, [clientId]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/LoginPage/");
  };

  // Coaches go to CoachLanding as their primary dashboard
  const dashboardPath = isCoach
    ? `/CoachLanding/${clientId}`
    : `/LandingPage/${clientId}`;

  return (
    <nav className="sidebar">
      <div className="brand-logo">BitFit</div>

      {/* ── Client routes (everyone) ── */}
      <span className="nav-section-label">Main</span>
      <ul className="nav-list">
        <li
          className={`nav-item${activePage === "dashboard" ? " active" : ""}`}
          onClick={() => navigate(dashboardPath)}
        >
          Dashboard
        </li>
        <li
          className={`nav-item${activePage === "notifications" ? " active" : ""}`}
          onClick={() => navigate(`/NotificationsPage/${clientId}`)}
        >
          Notifications{hasUnread && <span className="notification-dot" />}
        </li>
        <li
          className={`nav-item${activePage === "mycoach" ? " active" : ""}`}
          onClick={() => navigate(`/MyCoach/${clientId}`)}
        >
          My Coach
        </li>
        <li
          className={`nav-item${activePage === "workoutlogs" ? " active" : ""}`}
          onClick={() => navigate(`/WorkoutLogPage/${clientId}`)}
        >
          Workout Logs
        </li>
        <li
          className={`nav-item${activePage === "mealtracker" ? " active" : ""}`}
          onClick={() => navigate(`/MealTrackPage/${clientId}`)}
        >
          Meal Tracker
        </li>

        <span className="nav-section-label">Insights</span>
        <li
          className={`nav-item${activePage === "moodtracker" ? " active" : ""}`}
          onClick={() => navigate(`/MoodTrackPage/${clientId}`)}
        >
          Mood Tracker
        </li>
        <li
          className={`nav-item${activePage === "messages" ? " active" : ""}`}
          onClick={() => navigate(`/MessagingPage/${clientId}`)}
        >
          Messages
        </li>
        <li
          className={`nav-item${activePage === "analytics" ? " active" : ""}`}
          onClick={() => navigate(`/Analytics/${clientId}`)}
        >
          Analytics
        </li>

        {/* ── Coach routes (coach / nutritionist / admin-with-specialty) ── */}
        {hasCoachRole && (
          <>
            <span className="nav-section-label">Coach</span>
            {canAssignMeals && (
              <li
                className={`nav-item${activePage === "assignmealplan" ? " active" : ""}`}
                onClick={() => navigate(`/AssignMealPlan/${clientId}`)}
              >
                Assign Meal Plans
              </li>
            )}
            <li
              className={`nav-item${activePage === "myreviews" ? " active" : ""}`}
              onClick={() => navigate(`/SeeMyReviews/${clientId}`)}
            >
              My Reviews
            </li>
          </>
        )}

        {/* ── Admin routes ── */}
        {isAdmin && (
          <>
            <span className="nav-section-label">Admin</span>
            <li
              className={`nav-item${activePage === "admindashboard" ? " active" : ""}`}
              onClick={() => navigate(`/AdminAnalytics/${clientId}`)}
            >
              Admin Dashboard
            </li>
            <li
              className={`nav-item${activePage === "usermanagement" ? " active" : ""}`}
              onClick={() => navigate(`/AdminUsers/${clientId}`)}
            >
              User Management
            </li>
            <li
              className={`nav-item${activePage === "coachreports" ? " active" : ""}`}
              onClick={() => navigate(`/AdminReports/${clientId}`)}
            >
              Coach Reports
            </li>
            <li
              className={`nav-item${activePage === "coachapplications" ? " active" : ""}`}
              onClick={() => navigate(`/AdminCoachApplications/${clientId}`)}
            >
              Coach Applications
            </li>
          </>
        )}

        {/* ── Account routes (everyone) ── */}
        <span className="nav-section-label">Account</span>
        <li
          className={`nav-item${activePage === "billing" ? " active" : ""}`}
          onClick={() => navigate(`/BillingPage/${clientId}`)}
        >
          Billing &amp; Invoices
        </li>
        <li
          className={`nav-item${activePage === "profile" ? " active" : ""}`}
          onClick={() => navigate(`/UserProfile/${clientId}`)}
        >
          My Profile
        </li>
      </ul>

      <div className="sidebar-bottom">
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
