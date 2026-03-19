import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import "./Landingcss.css";
import React, { useState, useEffect } from "react";

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

  return (
    <div className="coach-page">
    <nav className="sidebar">
        <div className="brand-logo">BitFit</div>
        <ul className="nav-list">
          <li className="nav-item">Dashboard</li>
          <li className="nav-item">MyCoaches</li>
          <li className="nav-item">Workout Logs</li>
          <li className="nav-item">Meal Tracker</li>
          <li className="nav-item">Mood Tracker</li>
          <li className="nav-item">Messages</li>
          <li className="nav-item">Subscriptions</li>
          <li className="nav-item">Analytics</li>
          <li className="nav-item" onClick={() => navigate(`/UserProfile/${clientId}`)}>
            My Profile </li>
        </ul>

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
