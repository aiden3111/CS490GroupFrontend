import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import "./WorkoutPage.css";
import React, { useState, useEffect } from "react";
import Modal from "./ModalPage";

//TODO: add the links to side bar
//TODO: Build the top bar
//TODO: Search by terms not working 

const NotificationsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
    const { clientId } = useParams();
    const [searchParams] = useSearchParams();
    const query = searchParams.get("search");
    const [workouts, setWorkouts] = useState([]);
    const navigate = useNavigate();
    const [selectedCoach, setSelectedCoach] = useState(null);
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
        fetch(`http://127.0.0.1:5000/api/exercises/`)
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

              <li className="nav-item active" onClick={() => navigate(`/NotificationsPage/${loggedInId}`)}>Notifications Settings</li>
            
          </ul>

           <div className="sidebar-bottom">
            <button className="nav-item" onClickCapture={handleLogout}>
              Logout
            </button>
          </div>
        </nav>
  
        <main className="main-content">
        <h1 className="welcome-text"> Notification Preferences</h1>
  
          
          
        </main>
      </div>
    );
  };

export default NotificationsPage;
