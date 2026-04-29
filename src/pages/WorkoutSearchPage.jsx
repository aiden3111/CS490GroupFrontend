import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import "./WorkoutPage.css";
import React, { useState, useEffect } from "react";
import Modal from "./ModalPage";


//TODO: Search by terms not working 

const WorkoutSearchPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { clientId } = useParams();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("search");
  const [workouts, setWorkouts] = useState([]);
  const navigate = useNavigate();

  const [selectedFilters, setselectedFilters] = useState([]);

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
      fetch(`http://127.0.0.1:5000/api/exercises/?search=${encodeURIComponent(query)}`)
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

  const displayWorkouts =
    selectedFilters.length === 0
      ? workouts
      : workouts.filter((exercise) =>
            selectedFilters.includes(exercise.muscle_group) ||
            selectedFilters.includes(exercise.equipment)
        );

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
          <li className="nav-item" onClick={() => navigate(`/WorkoutLogPage/${clientId}`)}>Workout Logs</li>
           <ul className="sub-nav">
            <li className="nav-item" onClick={() => navigate(`/StepsTracker/${clientId}`)}>Step Tracker</li>
            <li className="nav-item" onClick={() => navigate(`/CustomExercise/${clientId}`)}>Custom Exercise</li>
          </ul>
        </ul>

        {/* Checkbox not checkboxing*/}
        <div className="checkbox">
          <p>Muscle Group</p>

          <label className="checkbox-container1">
            <input
              type="checkbox"
              name="Chest"
              checked={selectedFilters.includes("Chest")}
              onChange={() => handleFilterChange("Chest")}
            />
            Chest
          </label>

          <label className="checkbox-container2">
            <input
              type="checkbox"
              name="Shoulders"
              checked={selectedFilters.includes("Shoulders")}
              onChange={() => handleFilterChange("Shoulders")}
            />
            Shoulders
          </label>

          <label className="checkbox-container3">
            <input
              type="checkbox"
              name="Back"
              checked={selectedFilters.includes("Back")}
              onChange={() => handleFilterChange("Back")}
            />
            Back
          </label>

          <label className="checkbox-container4">
            <input
              type="checkbox"
              name="Legs"
              checked={selectedFilters.includes("Legs")}
              onChange={() => handleFilterChange("Legs")}
            />
            Legs
          </label>

          <label className="checkbox-container5">
            <input
              type="checkbox"
              name="Hamstrings"
              checked={selectedFilters.includes("Hamstrings")}
              onChange={() => handleFilterChange("Hamstrings")}
            />
            Hamstrings
          </label>

          <label className="checkbox-container6">
            <input
              type="checkbox"
              name="Core"
              checked={selectedFilters.includes("Core")}
              onChange={() => handleFilterChange("Core")}
            />
            Core
          </label>

          <label className="checkbox-container7">
            <input
              type="checkbox"
              name="Cardio"
              checked={selectedFilters.includes("Cardio")}
              onChange={() => handleFilterChange("Cardio")}
            />
            Cardio
          </label>

          <label className="checkbox-container8">
            <input
              type="checkbox"
              name="Arms"
              checked={selectedFilters.includes("Arms")}
              onChange={() => handleFilterChange("Arms")}
            />
            Arms
          </label>

          <label className="checkbox-container9">
            <input
              type="checkbox"
              name="Glutes"
              checked={selectedFilters.includes("Glutes")}
              onChange={() => handleFilterChange("Glutes")}
            />
            Glutes
          </label>

          <label className="checkbox-container10">
            <input
              type="checkbox"
              name="Full Body"
              checked={selectedFilters.includes("Full Body")}
              onChange={() => handleFilterChange("Full Body")}
            />
            Full Body
          </label>
        </div>

        <div className="checkbox">
          <p>Equipment</p>

          <label className="checkbox-container-e1">
            <input
              type="checkbox"
              name="Barbell"
              checked={selectedFilters.includes("Barbell")}
              onChange={() => handleFilterChange("Barbell")}
            />
            Barbell
          </label>

          <label className="checkbox-container-e2">
            <input
              type="checkbox"
              name="Dumbbell"
              checked={selectedFilters.includes("Dumbbell")}
              onChange={() => handleFilterChange("Dumbbell")}
            />
            Dumbbell
          </label>

          <label className="checkbox-container-e3">
            <input
              type="checkbox"
              name="Machine"
              checked={selectedFilters.includes("Machine")}
              onChange={() => handleFilterChange("Machine")}
            />
            Machine
          </label>

          <label className="checkbox-container-e4">
            <input
              type="checkbox"
              name="Bodyweight"
              checked={selectedFilters.includes("Bodyweight")}
              onChange={() => handleFilterChange("Bodyweight")}
            />
            Bodyweight
          </label>

          <label className="checkbox-container-e5">
            <input
              type="checkbox"
              name="Treadmill"
              checked={selectedFilters.includes("Treadmill")}
              onChange={() => handleFilterChange("Treadmill")}
            />
            Treadmill
          </label>

          <label className="checkbox-container-e6">
            <input
              type="checkbox"
              name="Cable"
              checked={selectedFilters.includes("Cable")}
              onChange={() => handleFilterChange("Cable")}
            />
            Cable
          </label>

          <label className="checkbox-container-e7">
            <input
              type="checkbox"
              name="None"
              checked={selectedFilters.includes("None")}
              onChange={() => handleFilterChange("None")}
            />
            None
          </label>
        </div>

        <div className="sidebar-bottom">
          <button className="nav-item" onClickCapture={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <main className="main-content">
        <h1 className="welcome-text"> Exercise Library</h1>

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

        {query && <h2 className="section-title">Seach Results: "{query}"</h2>}

        <div className="coach-grid">
          {displayWorkouts.length > 0
            ? displayWorkouts.map((exercise) => (
                <div key={exercise.exercise_id} className="section-card">
                  <h3>{exercise.exercise_name}</h3>
                  <p><small>Created by: {exercise.created_by ? exercise.created_by: "System"}</small></p>

                  <p className="specialty-tag">
                    <b>Muscle Group:</b> {exercise.muscle_group}
                  </p>

                  <p>
                    <b>Equipment:</b> {exercise.equipment}
                  </p>

                  <p>
                    <b>Category:</b> {exercise.category}
                  </p>

                  <p>
                    <b>Source:</b> {exercise.is_custom ? "Custom" : "Library"}
                  </p>
                  {exercise.example_video && (
                    <a
                      href={exercise.example_video}
                      target="_blank"
                      rel="noreferrer"
                      className="video-link"
                    >
                      View Demo Video
                    </a>
                  )}
                </div>
              ))
            : query && <p>No coaches found.</p>}
        </div>
        <Modal>
         
        </Modal>
      </main>
    </div>
  );
};

export default WorkoutSearchPage;
