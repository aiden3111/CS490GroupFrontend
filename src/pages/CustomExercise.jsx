import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import "./Landingcss.css";
import React, { useState, useEffect } from "react";
import Modal from "./ModalPage";
import { Form, Button, Container, Row, Col } from "react-bootstrap";

import { useFormik } from "formik";
//TODO: add the links to side bar
//TODO: Build the top bar

function CustomExercise() {
  const [searchTerm, setSearchTerm] = useState("");
  const { clientId } = useParams();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("search");
  const [workouts, setWorkouts] = useState([]);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("mycustom");

  /*I will updae this to search only user made exercises*/

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

  return (
    <div className="coach-page">
      <nav className="sidebar">
        <div className="brand-logo">BitFit</div>
        <ul className="nav-list">
          <li
            className="nav-item"
            onClick={() => navigate(`/LandingPage/${clientId}`)}
          >
            {" "}
            Dashboard{" "}
          </li>
          <li
            className="nav-item"
            onClick={() => navigate(`/UserProfile/${clientId}`)}
          >
            {" "}
            My Profile{" "}
          </li>
          <li
            className="nav-item"
            onClick={() => navigate(`/WorkoutLogPage/${clientId}`)}
          >
            {" "}
            Workout Logs{" "}
          </li>
          <ul className="sub-nav">
            <li
              className="nav-item"
              onClick={() => navigate(`/StepsTracker/${clientId}`)}
            >
              {" "}
              Step Tracker{" "}
            </li>
            <li className="nav-item active">Custom Exercise </li>
            <ul className="sub-sub-nav">
              <li
                onClick={() => setActiveTab("mycustom")}
                className={`nav-item ${activeTab === "mycustom" ? "active" : ""}`}
              >
                My Custom
              </li>
              <li
                onClick={() => setActiveTab("create-custom")}
                className={`nav-item ${activeTab === "create-custom" ? "active" : ""}`}
              >
                {" "}
                Create exercise
              </li>
            </ul>
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

        {activeTab === "mycustom" ? (
          <MyCustom clientId={clientId} />
        ) : (
          <CustomCreation clientId={clientId} />
        )}
      </main>
    </div>
  );
}

function MyCustom({ clientId }) {
  const [workouts, setWorkouts] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/api/my_exercises/?client_id=${clientId}`)
      .then((res) => res.json())
      .then((data) => setWorkouts(data));
  }, [clientId]);

  const handleCardClick = (film) => {
    fetch(`http://127.0.0.1:5000/api/exercises/${film.id}`)
      .then((res) => res.json())
      .then((fullData) => {
        setSelectedExercise(fullData);
      });
  };


  const handleDelete = async (exer) => {
    const confirm = window.confirm("The Exercise will be permanently removed");
    if (confirm ){
      try {
    const response = await fetch(`http://127.0.0.1:5000/api/exercises/${exer}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: clientId }) 
    });

    const data = await response.json();
    if (response.ok) {
      alert("Exercise Deleted");
      setSelectedExercise(null);
      window.location.reload();
    } else {
      alert(data.error || "Error");
    }
  } catch (err) {
    console.error("Error:", err);
  }

    }else{
          
      alert("DElete Canceled");
    }
 
  };


  return (
    <div className="first-section">
      <div className="exercise-section">
        {workouts.map((ex) => (
          <div key={ex.exercise_id} className="section-card"
           
            style={{ cursor: "help" }}
          >
            <h3>{ex.exercise_name}</h3>
            <p>{ex.muscle_group} </p>
            <p> {ex.equipment}</p>
              <button className="edit-btn" onClick={() => handleCardClick(ex)}> Edit </button>
              <button className="delete-btn" onClick={() => handleDelete(ex.exercise_id)}> Delete </button>
          </div>
        ))}
      </div>
      <div className="modal-sectoion">
        <Modal open={selectedExercise !== null} onClose={() => setSelectedExercise(null)}>
          {selectedExercise && (
            <div className="modal-inner-contentF">
              <strong> Exercise Details:</strong>
              <h3> Name: {selectedExercise.exercise_name} </h3>
              <p> <b>Muscle Group:</b> {selectedExercise.muscle_group}</p>
              <p> <b>Equipment:</b> {selectedExercise.ex.equipment} </p>
              <p> <b>Example:</b> {selectedExercise.example_video} </p>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}

function CustomCreation({ clientId }) {
  const [activeTab, setActiveTab] = useState("create-custom");

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

  return (
    <div className="Outer-custom">
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
    </div>
  );
}

export default CustomExercise;
