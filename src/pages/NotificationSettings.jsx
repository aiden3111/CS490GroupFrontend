import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import "./WorkoutPage.css";
import React, { useState, useEffect } from "react";

const NotificationSettings = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [preferences, setPreferences] = useState({
    daily_water_reminder: true,
    workout_today_reminder: true,
    email_notifications: true,
    in_app_notifications: true,
  });

  useEffect(() => {
    const loggedInId = localStorage.getItem("authenticatedClientId");
    if (loggedInId !== clientId) {
      navigate(`/UserProfile/${loggedInId}`);
    }
  }, [clientId, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/LoginPage/");
  };

  useEffect(() => {
    const fetchNotificationData = async () => {
      try {
        const prefRes = await fetch(
          `/api/notification-preferences/${clientId}`,
        );

        if (prefRes.status === 404) {
          // Row doesn't exist, create it with defaults
          await fetch(`/api/notification-preferences`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ client_id: clientId }),
          });

          fetchNotificationData();
        } else {
          const prefData = await prefRes.json();
          setPreferences(prefData);
        }
      } catch (err) {
        console.error("Error setting up preferences:", err);
      }
    };
    fetchNotificationData();
  }, [clientId]);

  const handleTogglePreference = async (field) => {
    const updatedValue = !preferences[field];
    try {
      const res = await fetch(
        `/api/notification-preferences/${clientId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [field]: updatedValue }),
        },
      );

      const data = await res.json();

      if (res.ok) {
        setPreferences(data.preferences);
      } else {
        alert(`Update failed: ${data.error}`);
      }
    } catch (err) {
      console.error("Failed to update preference:", err);
    }
  };

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
          <li
            className="nav-item"
            onClick={() => navigate(`/UserProfile/${clientId}`)}
          >
            My Profile
          </li>

          <li className="nav-item active">Notifications Settings</li>
        </ul>

        <div className="sidebar-bottom">
          <button className="nav-item" onClickCapture={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <main className="main-content">
        <h1>Notifications</h1>

        <section className="section-card">
          <h3>Notification Settings</h3>
          <div className="checkbox">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={preferences.daily_water_reminder}
                onChange={() => handleTogglePreference("daily_water_reminder")}
              />
              Daily Water Reminders
            </label>

            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={preferences.workout_today_reminder}
                onChange={() =>
                  handleTogglePreference("workout_today_reminder")
                }
              />
              Daily Workout Reminders
            </label>

            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={preferences.email_notifications}
                onChange={() => handleTogglePreference("email_notifications")}
              />
              Email Notifications
            </label>

            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={preferences.in_app_notifications}
                onChange={() => handleTogglePreference("in_app_notifications")}
              />
              In-App Notifications
            </label>

            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={preferences.in_app_notifications}
                onChange={() => handleTogglePreference("in_app_notifications")}
              />
              In-App Notifications
            </label>
          </div>
        </section>
      </main>
    </div>
  );
};

export default NotificationSettings;
