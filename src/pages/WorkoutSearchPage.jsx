import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import "./WorkoutPage.css";
import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";


//TODO: Search by terms not working 

const WorkoutSearchPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { clientId } = useParams();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("search");
  const [workouts, setWorkouts] = useState([]);
  const navigate = useNavigate();

  const [selectedFilters, setselectedFilters] = useState([]);
  const muscleFilters = ["Chest", "Shoulders", "Back", "Legs", "Hamstrings", "Core", "Cardio", "Arms", "Glutes", "Full Body"];
  const equipmentFilters = ["Barbell", "Dumbbell", "Machine", "Cable", "Bodyweight", "None", "Treadmill"];

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

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  useEffect(() => {
    const endpoint = query
      ? `/api/exercises?search=${encodeURIComponent(query)}`
      : "/api/exercises";

    fetch(endpoint)
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
      <Sidebar activePage="exercise-library" />

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

        {query && <h2 className="section-title">Search Results: "{query}"</h2>}

        <section className="filter-panel">
          <div className="filter-group">
            <p>Muscle Group</p>
            <div className="filter-options">
              {muscleFilters.map((name) => (
                <label key={name} className="filter-option">
                  <input
                    type="checkbox"
                    checked={selectedFilters.includes(name)}
                    onChange={() => handleFilterChange(name)}
                  />
                  {name}
                </label>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <p>Equipment</p>
            <div className="filter-options">
              {equipmentFilters.map((name) => (
                <label key={name} className="filter-option">
                  <input
                    type="checkbox"
                    checked={selectedFilters.includes(name)}
                    onChange={() => handleFilterChange(name)}
                  />
                  {name}
                </label>
              ))}
            </div>
          </div>
          {selectedFilters.length > 0 && (
            <button className="clear-filters-btn" onClick={() => setselectedFilters([])}>
              Clear Filters
            </button>
          )}
        </section>

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
            : <p>No exercises found.</p>}
        </div>
      </main>
    </div>
  );
};

export default WorkoutSearchPage;
