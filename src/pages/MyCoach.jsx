import { useNavigate, useParams } from "react-router-dom";
import "./Landingcss.css";
import React, { useState, useEffect } from "react";
import { Navbar, Nav } from "react-bootstrap";
import { useFormik } from "formik";
import { Form, Button, Container } from "react-bootstrap";

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
      .then((res) => {
        if (!res.ok) {
          return null;
        }

        return res.json();
      })
      .then((data) => {
        setMyCoach(data);
      })
      .catch((error) => console.error("Error fetching my coach:", error));
  }, [clientId]);

  const formik = useFormik({
    initialValues: {
      rating: "",
      comment: "",
    },
    onSubmit: async (values) => {
      
      if (!values.rating) {
        alert("Please provide a rating.");
        return;
      }

      try {
        const res = await fetch(
          `http://127.0.0.1:5000/api/coach_ratings/${myCoach.coach_id}/rate`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              client_id: clientId, 
              rating: Number(values.rating),
              comment: values.comment,
            }),
          },
        );

        if (res.ok) {
          alert("Review added successfully!");
          formik.resetForm();
        } else {
          const errData = await res.json();
          alert(`Error: ${errData.error}`);
        }
      } catch (err) {
        console.error("Review submission failed:", err);
      }
    },
  });

  const handleLogout = () => {
    //localStorage.removeItem("authenticatedClientId");
    localStorage.clear();
    navigate("/LoginPage/");
  };

  return (
    <div className="dashboard-container">
      <nav className="sidebar">
        <div className="brand-logo">BitFit</div>
        <span className="nav-section-label">Main</span>

        <ul className="nav-list">
          <li className="nav-item" onClick={() => navigate(`/LandingPage/${clientId}`)}> Dashboard </li>
          <li className="nav-item active">My Coach</li>
          <li className="nav-item" onClick={() => navigate(`/WorkoutLogPage/${clientId}`)}> Workout Logs </li>
          <li className="nav-item" onClick={() => navigate(`/MealTrackPage/${clientId}`)}> Meal Tracker </li>
          <span className="nav-section-label">Insights</span>
          <li className="nav-item" onClick={() => navigate(`/MoodTrackPage/${clientId}`)}> Mood Tracker </li>
          <li className="nav-item" onClick={() => navigate(`/MessagingPage/${clientId}`)}> Messages </li>
          <li className="nav-item" onClick={() => navigate(`/Analytics/${clientId}`)}> Analytics </li>
          <span className="nav-section-label">Account</span>
          <li className="nav-item">Subscriptions</li>
          <li className="nav-item" onClick={() => navigate(`/UserProfile/${clientId}`)}> My Profile </li>
        </ul>
        <div className="sidebar-bottom">
          <button className="logout-btn" onClickCapture={handleLogout}>
            <span></span>Logout
          </button>
        </div>
      </nav>

      <main className="main-content">
        <header className="dashboard-header">
          <h1 className="welcome-text">My Coach</h1>

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
        {!myCoach ? (
          <div className="card coach-empty-card">
            <div className="coach-empty-avatar">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            </div>
            <p className="coach-empty-text">No Coach Found</p>
            <button
              className="coach-find-btn"
              onClick={() => navigate(`/CoachSearch/${clientId}`)}
            >
              Find a Coach!
            </button>
          </div>
        ) : (
          <div className="card coach-detail-card">
            <div className="coach-detail-header">
              <div className="coach-detail-avatar">
                {myCoach.first_name[0]}
                {myCoach.last_name[0]}
              </div>
              <div>
                <h2 className="coach-detail-name">
                  {myCoach.first_name} {myCoach.last_name}
                </h2>
                <span className="coach-detail-badge">
                  {myCoach?.specialty?.toLowerCase() === "both"
                    ? "Fitness & Nutrition"
                    : myCoach.specialty}
                </span>
              </div>
            </div>

            <div className="coach-detail-fields">
              <div className="coach-detail-row">
                <span className="coach-detail-label">Pricing</span>
                <span className="coach-detail-value">
                  ${myCoach.pricing}
                  <span className="coach-detail-per">/mo</span>
                </span>
              </div>
              <div className="coach-detail-row">
                <span className="coach-detail-label">Availability</span>
                <span className="coach-detail-value">
                  {myCoach.availability}
                </span>
              </div>
              <div className="coach-detail-row">
                <span className="coach-detail-label">Certifications</span>
                <span className="coach-detail-value">
                  {[
                    myCoach.fitness_certifications,
                    myCoach.nutrition_certifications,
                  ]
                    .filter(Boolean)
                    .join(", ") || "None listed"}
                </span>
              </div>
            </div>

            <button
              className="coach-remove-btn"
              onClick={() => navigate(`/SwitchCoach/${clientId}`)}
            >
              Remove / Switch Coach
            </button>
          </div>
        )}
        <div className="coach-reviews">
          <h2>Leave a Review </h2>
          <Container className="mt-3">
            <div
              style={{
                backgroundColor: "#2a472a",
                padding: "30px",
                borderRadius: "15px",
                color: "white",
              }}
            >
              <Form onSubmit={formik.handleSubmit}>
                <Form.Group className="mb-4">
                  <Form.Label>Rating (1-5)</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max="5"
                    name="rating"
                    placeholder="Enter a score from 1 to 5"
                    onChange={formik.handleChange}
                    value={formik.values.rating}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Comment</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="comment"
                    placeholder="Share your experience with this coach..."
                    onChange={formik.handleChange}
                    value={formik.values.comment}
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100">
                  Submit Review
                </Button>
              </Form>
            </div>
          </Container>
        </div>
      </main>
    </div>
  );
};
//TODO:
export default MyCoach;
