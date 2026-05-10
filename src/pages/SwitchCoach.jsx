import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import "./Landingcss.css";
import React, { useState, useEffect } from "react";
import Modal from "./ModalPage";
import Sidebar from "../components/Sidebar";

const dayOptions = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const timeOptions = ["Morning", "Afternoon", "Evening"];

const availabilityMatches = (availability = "", selectedDays = [], selectedTimes = []) => {
  const text = availability.toLowerCase();
  const dayMap = {
    mon: ["mon", "monday", "mon-fri", "weekdays"],
    tue: ["tue", "tuesday", "mon-fri", "tue-sat", "weekdays"],
    wed: ["wed", "wednesday", "mon-fri", "mon-thu", "weekdays"],
    thu: ["thu", "thursday", "mon-fri", "mon-thu", "weekdays"],
    fri: ["fri", "friday", "mon-fri", "weekdays"],
    sat: ["sat", "saturday", "tue-sat", "weekend", "weekends"],
    sun: ["sun", "sunday", "weekend", "weekends"],
  };

  const dayMatch =
    selectedDays.length === 0 ||
    selectedDays.some((day) =>
      (dayMap[day] || [day]).some((token) => text.includes(token)),
    );

  const timeMatch =
    selectedTimes.length === 0 ||
    selectedTimes.some((time) => text.includes(time) || text.includes(`${time}s`));

  return dayMatch && timeMatch;
};

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
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    const loggedInId = localStorage.getItem("authenticatedClientId");
    if (loggedInId !== clientId) {
      navigate(`/UserProfile/${loggedInId}`);
    }
  }, [clientId, navigate]);

  const handleSearch = () => {
    if (searchTerm.trim().length === 0) {
      navigate(`/SwitchCoach/${clientId}`);
      return;
    }
    navigate(
      `/SwitchCoach/${clientId}?search=${encodeURIComponent(searchTerm)}`,
    );
  };

  const toggleDay = (day) => {
    const key = day.toLowerCase();
    setSelectedDays((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );
  };

  const toggleTime = (time) => {
    const key = time.toLowerCase();
    setSelectedTimes((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  useEffect(() => {
    const url = query
      ? `/api/coaches_search?search=${encodeURIComponent(query)}`
      : "/api/coaches_search";

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
    setselectedFilters((prev) =>
      prev.includes(lowerName)
        ? prev.filter((item) => item !== lowerName)
        : [...prev, lowerName],
    );
  };






  const displayCoaches =
    (selectedFilters.length === 0
      ? coaches
      : coaches.filter((coach) => {
          const specialty = coach.specialty
            ? coach.specialty.toLowerCase().trim()
            : "";
          const wantsFitness = selectedFilters.includes("fitness");
          const wantsNutrition = selectedFilters.includes("nutrition");
          if (
            specialty === "both" ||
            specialty.includes("fitness & nutrition")
          ) {
            return wantsFitness || wantsNutrition;
          }
          return selectedFilters.includes(specialty);
        })
    )
      .filter((coach) => availabilityMatches(coach.availability, selectedDays, selectedTimes))
      .filter((coach) => coach.coach_id !== clientId);

  const handleRequestCoach = async () => {
    try {
      if (!selectedCoach) return;
      if (selectedCoach.coach_id === clientId) {
        alert("You cannot request yourself as a coach.");
        return;
      }
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
    try {
      fetch(`/api/my_coach/${clientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: clientId }),
      })
        .then((res) => res.json())
        .then(() => {
          alert("Coach removed!");
          navigate(`/CoachSearch/${clientId}`);
        });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar activePage="mycoach" />

      <main className="main-content">
        <h1 className="welcome-text">Remove or Switch Coach</h1>
        <div className="section-card" style={{ marginBottom: "20px" }}>
          <div className="coachremoval-message">
            <p>
              If you choose to remove your current coach you no longer will be
              able to use their services
            </p>
            <p>You can select a new coach after removing your current coach.</p>
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
          <button className="btn-outline-warning" disabled={!agreed} onClick={() => handleRemove()}>
            Remove Coach
          </button>
        </div>

        <h1 className="welcome-text">Coach Search</h1>
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
            Search
          </button>
        </div>

        {query && <h2 className="section-title">Search Results: "{query}"</h2>}

        <section className="filter-panel">
          <div className="filter-group">
            <p>Specialty</p>
            <div className="filter-options">
              {["Fitness", "Nutrition"].map((name) => (
                <label key={name} className="filter-option">
                  <input
                    type="checkbox"
                    checked={selectedFilters.includes(name.toLowerCase())}
                    onChange={() => handleFilterChange(name)}
                  />
                  {name}
                </label>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <p>Days</p>
            <div className="filter-options">
              {dayOptions.map((day) => (
                <label key={day} className="filter-option">
                  <input
                    type="checkbox"
                    checked={selectedDays.includes(day.toLowerCase())}
                    onChange={() => toggleDay(day)}
                  />
                  {day}
                </label>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <p>Time</p>
            <div className="filter-options">
              {timeOptions.map((time) => (
                <label key={time} className="filter-option">
                  <input
                    type="checkbox"
                    checked={selectedTimes.includes(time.toLowerCase())}
                    onChange={() => toggleTime(time)}
                  />
                  {time}
                </label>
              ))}
            </div>
          </div>
          {(selectedFilters.length > 0 || selectedDays.length > 0 || selectedTimes.length > 0) && (
            <button
              className="clear-filters-btn"
              onClick={() => {
                setselectedFilters([]);
                setSelectedDays([]);
                setSelectedTimes([]);
              }}
            >
              Clear Filters
            </button>
          )}
        </section>

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
                  <p>
                    <b>Availability:</b> {coach.availability}
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
                <b>Availability:</b> {selectedCoach.availability}
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
