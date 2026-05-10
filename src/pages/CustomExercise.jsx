import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import "./Landingcss.css";
import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";

import { Form, Button, Container, Row, Col, Modal } from "react-bootstrap";

import { useFormik } from "formik";


function CustomExercise() {
  const [searchTerm, setSearchTerm] = useState("");
  const { clientId } = useParams();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("search");
  const [workouts, setWorkouts] = useState([]);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("mycustom");



  useEffect(() => {
    const loggedInId = localStorage.getItem("authenticatedClientId");
    if (loggedInId !== clientId) {
      navigate(`/UserProfile/${loggedInId}`);
    }
  }, [clientId, navigate]);

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
      fetch(`/api/exercises`)
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
    <div className="dashboard-container">
      <Sidebar activePage="customexercise" />

      <main className="main-content">
        <h1 className="welcome-text"> Custom Exercise</h1>

        <div className="tab-row">
          <button
            className={`btn-${activeTab === "mycustom" ? "primary" : "secondary"}`}
            onClick={() => setActiveTab("mycustom")}
          >
            My Custom Exercises
          </button>
          <button
            className={`btn-${activeTab === "create" ? "primary" : "secondary"}`}
            onClick={() => setActiveTab("create")}
          >
            Create Exercise
          </button>
        </div>

        {activeTab === "mycustom" ? (
          <MyCustom clientId={clientId} />
        ) : (
          <CustomCreation clientId={clientId} navigate={navigate} />
        )}
      </main>
    </div>
  );
}

function MyCustom({ clientId }) {
  const [workouts, setWorkouts] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [modalEdit, setModalEdit] = useState(false);

  const fetchWorkouts = () => {
    fetch(`/api/my_exercises?client_id=${clientId}`)
      .then((res) => res.json())
      .then((data) => setWorkouts(data));
  };

  useEffect(() => {
    fetchWorkouts();
  }, [clientId]);

  const handleEdit = (exercise) => {
    setSelectedExercise(exercise);
    setModalEdit(true);
  };

  const handleDelete = async (exerId) => {
    const confirm = window.confirm("The Exercise will be permanently removed");
    if (!confirm) return;

    try {
      const response = await fetch(
        `/api/exercises/${exerId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ client_id: clientId }),
        },
      );

      if (response.ok) {
        alert("Exercise Deleted");

        setWorkouts((prev) => prev.filter((ex) => ex.exercise_id !== exerId));
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };
  return (
    <div className="first-section">
      <div className="exercise-section">
        {workouts.map((ex) => (
          <div
            key={ex.exercise_id}
            className="section-card"
            style={{ cursor: "help" }}
          >
            <h3>Exercise: {ex.exercise_name}</h3>
            <p>Muscle Group: {ex.muscle_group} </p>
            <p>Equipment: {ex.equipment}</p>
            <p>
              <b>Example:</b>{" "}
              {ex.example_video ? (
                <a
                  href={ex.example_video}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#1d2c59", textDecoration: "underline" }}
                >
                  View Demo Video
                </a>
              ) : (
                "No video available"
              )}
            </p>
            <button className="edit-btn" onClick={() => handleEdit(ex)}>
              Edit
            </button>
            <button
              className="delete-btn"
              onClick={() => handleDelete(ex.exercise_id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
      <EditModal
        show={modalEdit}
        onHide={() => setModalEdit(false)}
        exercise={selectedExercise}
        clientId={clientId}
        onSuccess={fetchWorkouts}
      />
    </div>
  );
}

function EditModal({ show, onHide, exercise, clientId, onSuccess }) {
  const formikForm = useFormik({
    initialValues: {
      exercise_name: exercise?.exercise_name || "",
      muscle_group: exercise?.muscle_group || "",
      equipment: exercise?.equipment || "",
      category: exercise?.category || "",
      example_video: exercise?.example_video || "",
    },
    enableReinitialize: true,

    onSubmit: async (values) => {
      try {
        const res = await fetch(
          `/api/exercises/${exercise.exercise_id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...values,
              created_by: clientId,
            }),
          },
        );
        if (res.ok) {
          alert("Exercise Updated");
          onSuccess();
          onHide();
        }
      } catch (err) {
        console.error(err);
      }
    },
  });

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="bg-dark text-white">
        <Modal.Title>Edit Exercise</Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-dark text-white">
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

          <Button variant="success" type="submit" className="meal-save-btn">
            {" "}
            Edit{" "}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
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
    // Remova o validateOnChange: false para validação em tempo real
    
  validate: (values) => {
    const errors = {};
    
    if (!values.exercise_name) errors.exercise_name = "Required";
    if (!values.muscle_group) errors.muscle_group = "Required";
    if (!values.equipment) errors.equipment = "Required";
    if (!values.category) errors.category = "Required";
    if (!values.example_video) errors.example_video = "Required";

    
    return errors;
  },

  onSubmit: (values) => {
      
    fetch("/api/exercises", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    })
    .then((res) => res.json())
    .then((data) => {
      if (data.error) {
        alert(data.error);
      } else {
        alert("Exercise Created.");
          setActiveTab("mycustom");   
        }
    })
    .catch((err) => console.error("Error:", err));
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
                  required
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
                  required
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
                  required
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
                  required
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
                  required
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
