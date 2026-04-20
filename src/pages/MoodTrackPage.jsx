import { useNavigate, useParams } from "react-router-dom";
import "./Landingcss.css";
import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import { Form, Button, Container, Row, Col } from "react-bootstrap";

const MoodTrackPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [mooddata, setLandingData] = useState([]);

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

  const handleLogout = () => {
    localStorage.removeItem("authenticatedClientId");
    navigate("/LoginPage/");
  };

  useEffect(() => {
    const fetchLandingData = async () => {
      const response = await fetch(`/api/api/mood/${clientId}`);
      const data = await response.json();
      setLandingData(data);
    };
    fetchLandingData();
  }, [clientId]);
  const date = new Date().toISOString().split('T')[0];
  const formik = useFormik({
    initialValues: {
      
      log_date: "",
      mood_score: "",
      mood_label: "",
      notes: "",
    },
    onSubmit: async (values) => {
      try {
        const res = await fetch(`/api/api/mood/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            
                client_id: clientId,
                log_date: values.date,
          
                mood_score: values.mood_score,
                mood_label: values.mood_label,
                notes: values.notes,
              
          }),
        });

        if (res.ok) {
          alert("Mood added");
          formik.resetForm({
            values: {
              ...formik.initialValues,
              selectedClientId: values.selectedClientId,
            },
          });
        } else {
          const err = await res.json();
          alert(`Error: ${err.error}`);
        }
      } catch (err) {
        console.error("Failed to mood entry", err);
      }
    },
  });

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
          <li
            className="nav-item"
            onClick={() => navigate(`/MyCoach/${clientId}`)}
          >
            My Coaches{" "}
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
          <li className="nav-item active">Mood Tracker</li>
          <ul>
            <li className="nav-item" onClick={() => navigate(`/DeleteMoodPage/${clientId}`)}> Edit Mood</li>
          </ul>
          <li
            className="nav-item"
            onClick={() => navigate(`/MessagingPage/${clientId}`)}
          >
            Messages
          </li>
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
          <button className="nav-item" onClickCapture={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <div className="main-content">
        <div className="header">
          <h1>Mood Tracker</h1>
          <div>
          
            <Container className="mt-5">
                <h2>How are you feeling today?</h2>
              <div
                style={{
                  backgroundColor: "#2a472a",
                  padding: "30px",
                  borderRadius: "15px",
                  color: "white",
                }}
              >
                <Form onSubmit={formik.handleSubmit}>
               

                  <Row>
                    <Col>
                      <Form.Group className="mb-3 flex-fill">
                        <Form.Label>Mood Score</Form.Label>
                        <Form.Control
                          type="number"
                          name="mood_score"
                          onChange={formik.handleChange}
                          value={formik.values.mood_score}
                        />
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group className="mb-3 flex-fill">
                        <Form.Label>Mood Label</Form.Label>
                        <Form.Control
                          type="text"
                          name="mood_label"
                          onChange={formik.handleChange}
                          value={formik.values.mood_label}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col>
                      <Form.Group className="mb-3 flex-fill">
                        <Form.Label>Notes</Form.Label>
                        <Form.Control
                          type="text"
                          name="notes"
                          onChange={formik.handleChange}
                          value={formik.values.notes}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 mt-3"
                  >
                    Add Entry
                  </Button>
                </Form>
              </div>
            </Container>
          </div>

          <h3>Previous logs</h3>
          {mooddata.map((mood) => (
            <div key={mood.log_date} className="mood-square">
              <p>Date: {mood.log_date}</p>
              <p>Score {mood.mood_score}</p>
              <p>Label: {mood.mood_label}</p>
              <p>Aditional notes: {mood.notes}</p>
            </div>
          ))}
        </div>

        <div className="mood-graph"></div>
      </div>
    </div>
  );
};
//TODO: Fix Styling
//TODO: Fix Sqares content
export default MoodTrackPage;
