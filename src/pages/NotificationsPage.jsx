import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import "./WorkoutPage.css";
import React, { useState, useEffect } from "react";

const NotificationsPage = () => {
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
    const fetchData = async () => {
      try {
        const notifRes = await fetch(
          `/api/notifications/${clientId}`,
        );
        const notifData = await notifRes.json();
        if (notifData.success) {
          setNotifications(notifData.notifications);
        }

        const prefRes = await fetch(
          `/api/notification-preferences/${clientId}`,
        );
        if (prefRes.status === 404) {
          await fetch(`/api/notification-preferences/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ client_id: clientId }),
          });
          fetchData();
        } else {
          const prefData = await prefRes.json();
          setPreferences(prefData);
        }
      } catch (err) {
        console.error("Error feeding notification page:", err);
      }
    };
    fetchData();
  }, [clientId]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      const res = await fetch(
        `/api/notifications/mark-read/${notificationId}`,
        {
          method: "PUT",
        },
      );

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.notification_id === notificationId
              ? { ...notif, is_read: 1 }
              : notif,
          ),
        );
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
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

        <section className="mt-4">
          <h3>Recent Alerts</h3>
          <div className="notifications-list">
            {notifications.map((n) => (
              <div
                key={n.notification_id}
                className={`notification-entry ${n.is_read ? "" : "unread-glow"}`}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    gap: "15px",
                  }}
                >
                  {!n.is_read && (
                    <input
                      type="checkbox"
                      onChange={() => handleMarkAsRead(n.notification_id)}
                      title="Mark as read"
                    />
                  )}

                  <div style={{ flex: 1 }}>
                    <strong>{n.title}</strong>
                    <p>{n.body}</p>
                    <small>{new Date(n.created_at).toLocaleDateString()}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default NotificationsPage;
