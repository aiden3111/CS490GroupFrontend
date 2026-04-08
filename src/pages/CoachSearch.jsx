import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import "./Landingcss.css";
import React, { useState, useEffect } from "react";
import Modal from "./ModalPage";

//TODO: add the links to side bar
//TODO: Build the top bar
//TODO: DEal with the "both" from the

const CoachSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { clientId } = useParams();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("search");
  const [coaches, setCoaches] = useState([]);
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
      `/CoachSearch/${clientId}?search=${encodeURIComponent(searchTerm)}`,
    );
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };



  useEffect(() => {
    const url = query
      ? `http://127.0.0.1:5000/api/coaches_search/?search=${query}`
      : `http://127.0.0.1:5000/api/coaches_search/`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          console.error("Backend Error:", data.error);
          setCoaches([]);
        } else {
          setCoaches(data);
        }
      })
      .catch((err) => console.error("Fetch error:", err));
  }, [query]);




  const handleFilterChange = (name) => {
    const lowerName = name.toLowerCase();
      setselectedFilters( prev => prev.includes(lowerName) ? prev.filter(item=> item !== lowerName)
    : [...prev, lowerName]);
};

const displayCoaches = selectedFilters.length === 0 
    ? coaches 
    : coaches.filter(coach => selectedFilters.includes(coach.specialty.toLowerCase()));


  const handleRequestCoach = async () => {
  try {
    const response = await fetch(`http://127.0.0.1:5000/api/coach/${selectedCoach.coach_id}/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: clientId }) 
    });

    const data = await response.json();
    if (response.ok) {
      alert("Sent");
      setSelectedCoach(null); 
    } else {
      alert(data.error || "Error");
    }
  } catch (err) {
    console.error("Error:", err);
  } 
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
        </ul>

        {/* Checkbox not checkboxing*/}
        <div className="checkbox">
          <label className="checkbox-container1">
            <input
              type="checkbox"
              name="Fitness"
              checked={selectedFilters.includes("fitness")}
              onChange={() => handleFilterChange("fitness")}
            />
            Fitness
          </label>
          <label className="checkbox-container2">
            <input
              type="checkbox"
              name="Nutrition"
              checked={selectedFilters.includes("nutrition")}
              onChange={() => handleFilterChange("nutrition")}
            />
            Nutrition
          </label>
          </div>
          

        <div className="sidebar-bottom">
          <button className="nav-item" onClickCapture={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <main className="main-content">
        <h1 className="welcome-text"> Coach Search</h1>

        <div className="search-container">
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleEnter}
          />
          <button className="btn-search" onClick={handleSearch} > Search </button>
        </div>

        {query && <h2 className="section-title">Search Results: "{query}"</h2>}

        <div className="coach-grid">
          {displayCoaches.length > 0
            ? displayCoaches.map((coach) => (
                <div key={coach.coach_id} className="section-card">
                  <h3>
                    Coach: {coach.first_name} {coach.last_name}
                  </h3>
                  <p className="specialty-tag">
                    <b>Specialty:</b> {coach.specialty === 'both' ? 'Fitness & Nutrition' : coach.specialty}
                  </p>
                  <p>
                    <b>Pricing:</b> ${coach.pricing}
                  </p>
                  <button
                    className="btn-outline"
                    onClick={() => setSelectedCoach(coach)}
                  >
                    View Profile
                  </button>
                </div>
              ))
            : <p>No coaches found.</p>}
        </div>
        <Modal open={selectedCoach !== null} onClose={() => setSelectedCoach(null)}>
          {selectedCoach && (
            <div className="modal-inner-contentF">
              <strong> Coach Details:</strong>
              <h3> Name: {selectedCoach.first_name} {selectedCoach.last_name}</h3>
              <p className="specialty-tag"><b>Specialty:</b> {selectedCoach.specialty}</p>
              <p> <b>Pricing:</b> ${selectedCoach.pricing} </p>
              <p> <b>Certifications:</b> {selectedCoach.certifications} </p>
              <button className="rent-btn" onClick={() => handleRequestCoach(selectedCoach.coach_id)}> Request Coach </button>
            </div>
          )}
        </Modal>
      </main>
    </div>
  );
};

export default CoachSearch;
 