import { useNavigate, useParams } from "react-router-dom";
import "./Landingcss.css";
import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import { Form, Button, Container, Table, Row, Col } from "react-bootstrap";

const DeleteMoodPage = () => {
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
      const response = await fetch(`/api/mood/${clientId}`);
      const data = await response.json();
      setLandingData(data);
    };
    fetchLandingData();
  }, [clientId]);

  const date = new Date().toISOString().split("T")[0];
  const formik = useFormik({
    initialValues: {
      log_date: "",
      mood_score: "",
      mood_label: "",
      notes: "",
    },
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const res = await fetch(`/api/mood/${values.mood_log_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_id: clientId,
            mood_score: values.mood_score,
            mood_label: values.mood_label,
            notes: values.notes,
          }),
        });

        if (res.ok) {
          alert("Mood updated successfully!");
          fetchMood(values.selectedDate);
        }
      } catch (err) {
        console.error("Update failed:", err);
      }
    },
  });

  const handleEditClick = (mood) => {
    formik.setValues({
      ...formik.values,
      ...mood,
    });
  };

  const fetchMood = (clientId) => {
    fetch(`/api/mood${clientId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Help!");
        return res.json();
      })
      .then((data) => setMood(data))
      .catch((err) => console.error("Error fetching loogs", err));
  };

  const handleDeleteMood = async (logId) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;

    try {
      const res = await fetch(`/api/mood/${logId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Mood deleted!");
        setLandingData((prev) => prev.filter((m) => m.mood_log_id !== logId));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const today = new Date().toISOString().split("T")[0];
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
          <li
            className="nav-item"
            onClick={() => navigate(`/MoodTrackPage/${clientId}`)}
          >
            Mood Tracker
          </li>
          <ul>
            <li className="nav-item active"> Edit Mood</li>
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

          <Container
            className="mt-4"
            style={{
              backgroundColor: "#2a472a",
              padding: "20px",
              color: "white",
            }}
          >
            <h2>Something Changed? </h2>
            <h2> You can update today's log!</h2>

            {mooddata.length > 0 && (
              <Table striped bordered hover variant="dark">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Mood Score</th>
                    <th>Mood Label</th>
                    <th>Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mooddata
                    .filter((m) => {
                      const formattedDate = new Date(m.log_date)
                        .toISOString()
                        .split("T")[0];
                      return formattedDate === today;
                    })
                    .map((m) => (
                      <tr key={m.mood_log_id}>
                        <td>{new Date(m.log_date).toLocaleDateString()}</td>
                        <td>{m.mood_score}</td>
                        <td>{m.mood_label}</td>
                        <td>{m.notes}</td>

                        <td>
                          <Button
                            variant="warning"
                            size="sm"
                            className="me-2"
                            onClick={() => handleEditClick(m)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteMood(m.mood_log_id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            )}

            {formik.values.mood_log_id && (
              <div
                className="section-card mt-4"
                style={{
                  backgroundColor: "#1a2e1a",
                  padding: "20px",
                  color: "white",
                }}
              >
                <h3>Editing </h3>
                <Form onSubmit={formik.handleSubmit}>
                  <Form.Group className="mb-3">
                    <Row>
                      <Col>
                        <Form.Label>Date is not editable</Form.Label>
                        <p strong> {formik.values.log_date}</p>
                      </Col>
                      <Col>
                        <Form.Label>Mood Score</Form.Label>
                        <Form.Control
                          name="mood_score"
                          onChange={formik.handleChange}
                          value={formik.values.mood_score}
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <Form.Label>Label</Form.Label>
                        <Form.Control
                          name="mood_label"
                          onChange={formik.handleChange}
                          value={formik.values.mood_label}
                        />
                      </Col>
                      <Col>
                        <Form.Label>Notes</Form.Label>
                        <Form.Control
                          name="notes"
                          onChange={formik.handleChange}
                          value={formik.values.notes}
                        />
                      </Col>
                    </Row>
                  </Form.Group>

                  <Button variant="success" type="submit">
                    Save Changes
                  </Button>
                  <Button
                    variant="secondary"
                    className="ms-2"
                    onClick={() => formik.resetForm()}
                  >
                    Cancel
                  </Button>
                </Form>
              </div>
            )}
          </Container>
        </div>
      </div>
    </div>
  );
};
//TODO: Fix Styling
//TODO: Fix Sqares content
export default DeleteMoodPage;
