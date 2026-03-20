import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import "./Landingcss.css";
import React, { useState, useEffect } from "react";
//TODO: add the links to side bar
//TODO: ask Litzy add a button back on user profile
//TODO: Add logut logit
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

    navigate(`/CoachSearch/${clientId}?search=${encodeURIComponent(searchTerm)}`,);
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };
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
  //Coach Search dont have lateral nav bar add filtering ans sorting instead
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
        <form onSubmit={handleSubmit}>
          
          <label>
            Fitness
            <input
              type="checkbox"
              name="Fitness"
              checked={inputs.Fitness}
              onChange={handleChange}
            />
          </label>
          <label>
            Nutrition
            <input
              type="checkbox"
              name="Nutrition"
              checked={inputs.Nutrition}
              onChange={handleChange}
            />
          </label>
          <button type="submit">Submit </button>
        </form>
        */}

        <div className="sidebar-bottom">
          <button className="nav-item">Logout</button>
        </div>
      </nav>

      <main className="main-content">
        <h1 className="welcome-text"> Coach Search</h1>

        <div className="search-container">
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search by name or specialty (e.g. fitness)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleEnter}
          />
          <button className="btn-search" onClick={handleSearch}>
            Search
          </button>
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
                  <button className="btn-outline">View Profile</button>
                </div>
              ))
            : query && <p>No coaches found.</p>}
        </div>
      </main>
    </div>
  );
};

export default CoachSearch;
//TODO: Coach profile modal
//TODO: Back button just in case
