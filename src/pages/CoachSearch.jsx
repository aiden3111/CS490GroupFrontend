import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import "./Landingcss.css";
import React, { useState, useEffect } from "react";
import Modal from "./ModalPage";

//TODO: add the links to side bar
//TODO: Build the top bar
//TODO: Filter coaches
//TODO: Send request

const CoachSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { clientId } = useParams();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("search");
  const [coaches, setCoaches] = useState([]);
  const navigate = useNavigate();
  const [selectedCoach, setSelectedCoach] = useState(null);

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
      `/CoachSearch/${clientId}?search=${encodeURIComponent(searchTerm)}`,
    );
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const specialty = [
    { _id: 1, name: "Fitness" },
    { _id: 2, name: "Nutrition" },
    { _id: 3, name: "Both" },
  ];
  /* const handleSubmit = (event) => {
    let filters = '';
    if (filters.fitness) filters += 'fitnes';
    if (inputs.nutrition) {
      if (inputs.fitness) filters += ' and ';
      filters += 'nutrition';
    }
    if (filters == '') filters = 'no filters';
    alert(`asadasdda`);
    event.preventDefault();
  };
  const [inputs, setInputs] = useState({});
  const handleChange = (e) => {
    const target = e.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    
    setInputs(values => ({...values, value}))
  }*/

  useEffect(() => {
    if (query) {
      fetch(`http://127.0.0.1:5000/api/coaches_search/?search=${query}`)
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
    }
  }, [query]);

  const handleLogout = () => {
    //localStorage.removeItem("authenticatedClientId");
    localStorage.clear();
    navigate("/LoginPage/");
  };

  /*const handleCardClick = (coach) => {
    fetch(`http://127.0.0.1:5000/api/coaches_search/?search=${coach}`)
      .then((res) => res.json())
      .then((data) => {
        setSelectedCoach(data);
      });
  };*/

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

        {/* Checkbox not checkboxing
        
          <label className="checkbox-container">
            <input
              type="checkbox"
              name="Fitness"
              checked={selectedFilters.includes("fitness")}
      onChange={() => toggleFilter("fitness")}
            />
            Fitness
          </label>
          <label className="checkbox-container">
            #
            <input
              type="checkbox"
              name="Nutrition"
              checked={selectedFilters.includes("nutrition")}
      onChange={() => toggleFilter("nutrition")}
            />
            Nutrition
          </label>
          */}

        {/*} <Panel>
          {specialty.map((value, index) =>
          <React.Fragment key={index}>
            <CheckBox>
              onChange
              type="checkbox"
              checked
            </CheckBox>
            <span>{value.name}</span>
          </React.Fragment>)}
        </Panel>*/}

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

        {query && <h2 className="section-title">Seach Results: "{query}"</h2>}

        <div className="coach-grid">
          {coaches.length > 0
            ? coaches.map((coach) => (
                <div key={coach.coach_id} className="section-card">
                  <h3>
                    Coach: {coach.first_name} {coach.last_name}
                  </h3>
                  <p className="specialty-tag">
                    <b>Specialty:</b> {coach.specialty}
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
            : query && <p>No coaches found.</p>}
        </div>
        <Modal open={selectedCoach !== null} onClose={() => setSelectedCoach(null)}>
          {selectedCoach && (
            <div className="modal-inner-contentF">
              <strong> Coach Details:</strong>
              <h3> Name: {selectedCoach.first_name} {selectedCoach.last_name}</h3>
              <p className="specialty-tag"><b>Specialty:</b> {selectedCoach.specialty}</p>
              <p> <b>Pricing:</b> ${selectedCoach.pricing} </p>
              <p> <b>Certifications:</b> {selectedCoach.certifications} </p>
              <button className="rent-btn"> Request Coach </button>
            </div>
          )}
        </Modal>
      </main>
    </div>
  );
};

export default CoachSearch;
 