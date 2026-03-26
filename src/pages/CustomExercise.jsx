import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import "./Landingcss.css";
import React, { useState, useEffect } from "react";
import Modal from "./ModalPage";
import { Form, Button, Container, Row, Col } from "react-bootstrap";

import { useFormik } from "formik";
//TODO: add the links to side bar
//TODO: Build the top bar

const CustomExercise = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { clientId } = useParams();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("search");
  const [workouts, setWorkouts] = useState([]);
  const navigate = useNavigate();
  const [selectedFilters, setselectedFilters] = useState([]);

  const formikForm = useFormik({
    initialValues: {
      exercise_name: "",
      muscle_group: "",
      equipment: "",
      category: "",
      example_video: "",
      is_custom: 1, 
      created_by: clientId,
    },
    validateOnChange: false,
    validateOnBlur: false,

    onSubmit: (values) => {
      fetch("http://127.0.0.1:5000/api/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            alert(data.error);
          } else {
            console.log("Success:", data);
            alert("Exercise Created.");
            navigate(`/WorkoutSearchPage/${clientId}`);
        
          }
        })
        .catch((err) => console.error("Error:", err));
    },
    validate: (values) => {
      if (
        values.exercise_name.length === 0 ||
        values.muscle_group.length === 0 ||
        values.equipment.length === 0 ||
        values.category.length === 0 ||
        values.example_video.length === 0
      
      )
        return alert("All fields are required");
    },
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

  const handleSearch = () => {
    if (searchTerm.trim().length === 0) {
      alert("Please enter a valid search term.");
      return;
    }
    navigate(
      `/WorkoutSearchPage/${clientId}?search=${encodeURIComponent(searchTerm)}`,
    );
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  useEffect(() => {
    if (query) {
      fetch(`http://127.0.0.1:5000/api/exercises`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            console.error("Backend Error:", data.error);
            setWorkouts([]);
          } else {
            setWorkouts(data);
          }
        })
        .catch((err) => console.error("Fetch error:", err));
    }
  }, [query]);

  const handleFilterChange = (name) => {
    setselectedFilters((prev) =>
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name],
    );
  };



  return (
    <div className="coach-page">
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
          <li
            className="nav-item"
            onClick={() => navigate(`/WorkoutLogPage/${clientId}`)}
          >
            Workout Logs
          </li>
          <ul className="sub-nav">
            <li
              className="nav-item"
              onClick={() => navigate(`/StepsTracker/${clientId}`)}
            >
              Step Tracker{" "}
            </li>
            <li className="nav-item active">Custom Exercise </li>
          </ul>
        </ul>

        <div className="sidebar-bottom">
          <button className="nav-item" onClickCapture={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <main className="main-content">
        <h1 className="welcome-text"> Custom Exercise</h1>

        <div className="search-container">
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleEnter}
          />
          <button className="btn-search" onClick={handleSearch}>
            {" "}
            Search{" "}
          </button>
        </div>
        <div className="custom-creation">
          <Container>
            <div
              style={{
                backgroundColor: "#2a472a",
                padding: "20px",
                borderRadius: "15px",
              }}
            >
              <h1 className="text-center mb-4">Create New Exercise</h1>
              <Form onSubmit={formikForm.handleSubmit}>
                
                <Form.Group className="mb-3" controlId="formExerciseName">
                  <Form.Label>Exercise Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="exercise_name"
                    placeholder="..."
                    onChange={formikForm.handleChange}
                    value={formikForm.values.exercise_name}
                  />
                </Form.Group>

                
                <Form.Group className="mb-3" controlId="formMuscleGroup">
                  <Form.Label>Muscle Group</Form.Label>
                  <Form.Select
                    name="muscle_group"
                    onChange={formikForm.handleChange}
                    value={formikForm.values.muscle_group}
                  >
                    <option value="">Select Muscle Group</option>
                    <option value="Chest">Chest</option>
                    <option value="Shoulders">Shoulders</option>
                    <option value="Back">Back</option>
                    <option value="Legs">Legs</option>
                    <option value="Arms">Arms</option>
                    <option value="Core">Core</option>
                    <option value="Glutes">Glutes</option>
                    <option value="Cardio">Cardio</option>
                  </Form.Select>
                </Form.Group>

                
                <Form.Group className="mb-3" controlId="formEquipment">
                  <Form.Label>Equipment</Form.Label>
                  <Form.Select
                    name="equipment"
                    onChange={formikForm.handleChange}
                    value={formikForm.values.equipment}
                  >
                    <option value="">Select Equipment</option>
                    <option value="Barbell">Barbell</option>
                    <option value="Dumbbell">Dumbbell</option>
                    <option value="Machine">Machine</option>
                    <option value="Cable">Cable</option>
                    <option value="Bodyweight">Bodyweight</option>
                    <option value="None">None</option>
                    <option value="Treadmill">Treadmill</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formCategory">
                  <Form.Label>Category</Form.Label>
                  <Form.Control
                    type="text"
                    name="category"
                    placeholder="e.g. Strength"
                    onChange={formikForm.handleChange}
                    value={formikForm.values.category}
                  />
                </Form.Group>

                
                <Form.Group className="mb-3" controlId="formVideo">
                  <Form.Label>Example Video URL</Form.Label>
                  <Form.Control
                    type="url"
                    name="example_video"
                    placeholder="https://youtube.com/..."
                    onChange={formikForm.handleChange}
                    value={formikForm.values.example_video}
                  />
                </Form.Group>

                <Button variant="success" type="submit" className="w-100">
                  Create Custom Exercise
                </Button>
              </Form>
            </div>
          </Container>
        </div>
      </main>
    </div>
  );
};

export default CustomExercise;
