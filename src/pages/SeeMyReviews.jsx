import { useNavigate, useParams } from "react-router-dom";
import "./Landingcss.css";
import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";

const SeeMyReviews = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);

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
  }, [clientId, navigate]);


  useEffect(() => {
    const loadReviews = async () => {
      try {
        const res = await fetch(
          `/api/review/coach/${clientId}`,
        );
        const data = await res.json();

        if (res.ok) {
          setReviews(data);
        }
      } catch (err) {
        console.error("Failed to load reviews on startup:", err);
      }
    };

    if (clientId) {
      loadReviews();
    }
  }, [clientId]);

  return (
    <div className="dashboard-container">
      <Sidebar activePage="myreviews" />

      <main className="main-content">
        <header className="dashboard-header">
          <h1 className="welcome-text">Client Feedback</h1>
        </header>

        <div className="reviews-container">
          {reviews.length > 0 ? (
            reviews.map((r, index) => (
              <div key={index} className="review-card">
                <div className="review-header">
                  <div>
                    <h4 style={{ margin: 0, color: "#ffffff" }}>
                      {r.first_name} {r.last_name}
                    </h4>
                    <span style={{ color: "#71717a", fontSize: "12px" }}>
                      Client ID: {r.client_id}
                    </span>
                  </div>

                  <div className="rating-stars">
                    {"★".repeat(r.rating)}
                    {"☆".repeat(5 - r.rating)}
                  </div>
                </div>

                <p className="review-comment">"{r.comment}"</p>
                <span>
                  {new Date(r.created_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            ))
          ) : (
            <div
              className="card"
              style={{ textAlign: "center", padding: "40px" }}
            >
              <p style={{ color: "#71717a" }}>No reviews yet for this coach.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SeeMyReviews;
