import { useNavigate, useParams } from "react-router-dom";
import "./Landingcss.css";
import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import Sidebar from "../components/Sidebar";

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


  useEffect(() => {
    const fetchLandingData = async () => {
      const response = await fetch(`/api/mood/${clientId}`);
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
        const res = await fetch(`/api/mood`, {
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
      <Sidebar activePage="moodtracker" />

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
                          placeholder="0 - 10"
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
                          placeholder=" 'Happy' 'Sad' 'Tired'"
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
                          placeholder="'Walk in the park' 'Busy Day'"
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
          <div className="meal-tracker-header">
          {mooddata.map((mood) => (
            <div key={mood.log_date} className="mood-square">
              <p>Date: {mood.log_date}</p>
              <p>Score {mood.mood_score}</p>
              <p>Label: {mood.mood_label}</p>
              <p>Aditional notes: {mood.notes}</p>
            </div>
          ))}
          </div>
        </div>

        <div className="mood-graph"></div>
      </div>
    </div>
  );
};
//TODO: Fix Styling
//TODO: Fix Sqares content
export default MoodTrackPage;
