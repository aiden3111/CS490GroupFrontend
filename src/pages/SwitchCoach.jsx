import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import "./Landingcss.css";
import React, { useState, useEffect } from "react";
import Modal from "./ModalPage";
import Sidebar from "../components/Sidebar";

//TODO: add the links to side bar
//TODO: Build the top bar
//TODO: DEal with the "both" from the

const SwitchCoach = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { clientId } = useParams();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("search");
  const [coaches, setCoaches] = useState([]);
  const navigate = useNavigate();
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [selectedFilters, setselectedFilters] = useState([]);
  const [agreed, setAgreed] = useState(false);

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
      fetch(`/api/coaches_search/?search=${query}`)
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

  const handleFilterChange = (name) => {
    const lowerName = name.toLowerCase();
    setselectedFilters((prev) =>
      prev.includes(lowerName)
        ? prev.filter((item) => item !== lowerName)
        : [...prev, lowerName],
    );
  };






  const displayCoaches =
    selectedFilters.length === 0
      ? coaches
      : coaches.filter((coach) =>
          selectedFilters.includes(coach.specialty.toLowerCase()),
        );

  const handleRequestCoach = async () => {
    try {
      const response = await fetch(
        `/api/coach/${selectedCoach.coach_id}/request`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ client_id: clientId }),
        },
      );

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

  const handleRemove = () => {
    try{
fetch(`/api/my_coach/${clientId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: clientId }),
    })
    .then(res => res.json())
    .then(data => {
      alert("Coach removed!");
      setMyCoach(null); 
    });
    } catch(error){
      console.error("Error:", error)
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar activePage="mycoach" />

      <main className="main-content">
        <h1 className="welcome-text"> Remove or Switch Coach</h1>
        <div className="coach-removal">
          <div className="coachremoval-message">
            <p>
              If you choose to remove your current coach you no longer will be
              able to use their services
            </p>
            <p>You may select a new coach using the search option bellow</p>
          </div>
          <label className="checkbox-agree">
            <input
              type="checkbox"
              name="I gree"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            I Agree
          </label>
          <button disabled={!agreed} onClick={() => handleRemove()}> Remove Coach</button>
        </div>

        <div className="search-containerR">

          <h1>Select New Coach</h1>
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
          {displayCoaches.length > 0
            ? displayCoaches.map((coach) => (
                <div key={coach.coach_id} className="section-card">
                  <h3>
                    Coach: {coach.first_name} {coach.last_name}
                  </h3>
                  <p className="specialty-tag">
                    <b>Specialty:</b>{" "}
                    {coach.specialty === "both"
                      ? "Fitness & Nutrition"
                      : coach.specialty}
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
        <Modal
          open={selectedCoach !== null}
          onClose={() => setSelectedCoach(null)}
        >
          {selectedCoach && (
            <div className="modal-inner-contentF">
              <strong> Coach Details:</strong>
              <h3>
                {" "}
                Name: {selectedCoach.first_name} {selectedCoach.last_name}
              </h3>
              <p className="specialty-tag">
                <b>Specialty:</b> {selectedCoach.specialty}
              </p>
              <p>
                {" "}
                <b>Pricing:</b> ${selectedCoach.pricing}{" "}
              </p>
              <p>
                {" "}
                <b>Certifications:</b> {selectedCoach.certifications}{" "}
              </p>
              <button
                className="rent-btn"
                onClick={() => handleRequestCoach(selectedCoach.coach_id)}
              >
                {" "}
                Request Coach{" "}
              </button>
            </div>
          )}
        </Modal>
      </main>
    </div>
  );
};

export default SwitchCoach;
