import { useNavigate, useParams } from "react-router-dom";
import "./Landingcss.css";
import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";

const CoachLanding = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [requests, setRequests] = useState([]);
  const [clients, setClients] = useState([]);
  const userRole = localStorage.getItem("userRole");
  const coachSpecialty = localStorage.getItem("coachSpecialty");

  const [landingData, setLandingData] = useState({
    user_name: "",
    pricing: 0,
    availability: "",
    status: ""
  });
  const [lanData, setLanData] = useState({
    trackers: [],
  });
  const [calorieData, setCalorieData] = useState([]);
  const [reviews, setReviews] = useState([]);

  const fetchClients = () => {
    fetch(`/api/clients/coach/${clientId}`)
      .then((res) => res.json())
      .then((data) => setClients(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error loading roster:", err));
  };

  useEffect(() => {
    const fetchLandingData = async () => {
      const response = await fetch(`/api/landing_page/${clientId}`);
      const data = await response.json();
      setLanData(data);
    };
    fetchLandingData();
  }, [clientId]);

  useEffect(() => {
    const fetchCoachData = async () => {
      try {
        const res = await fetch(`/api/coach/${clientId}`);
        const data = await res.json();
        if (res.ok) {
          setLandingData({
            ...data,
            user_name: `${data.first_name} ${data.last_name}`,
          });
        }
      } catch (err) {
        console.error("Error loading coach data:", err);
      }
    };
    fetchCoachData();
  }, [clientId]);

  const handleCreatePlan = async (clientData) => {
    const planData = {
      created_by: localStorage.getItem("authenticatedClientId"),
      client_id: clientData.client_id,
      frequency: 3,
      difficulty: "Intermediate",
      is_draft: 0,
    };

    try {
      const res = await fetch("/api/workoutPlansPage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(planData),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Plan created!");
      }
    } catch (err) {
      console.error("Assignment failed:", err);
    }
  };

  useEffect(() => {
    if (activeTab === "clients") {
      fetchClients();
    }
  }, [activeTab, clientId]);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/admin/check_status/${clientId}`);
        const data = await res.json();

        if (data.status === "disabled" || data.status === "suspended") {
          localStorage.clear();
          navigate(`/AccountSuspended`);
        }
      } catch (err) {
        console.error("Status check failed");
      }
    };

    checkStatus();

    const loggedInId = localStorage.getItem("authenticatedClientId");
    if (loggedInId !== clientId) {
      navigate(`/UserProfile/${loggedInId}`);
      return;
    }
  }, [clientId, navigate]);

  useEffect(() => {
    fetch(`/api/coach/${clientId}/requests`)
      .then((res) => res.json())
      .then((data) =>
        setRequests(data.filter((req) => req.status === "pending")),
      )
      .catch((err) => console.error("Error loading requests:", err));
  }, [clientId]);

  const handleAction = async (requestId, status, targetClientId) => {
    try {
      const response = await fetch(`/api/coach/${clientId}/requests/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: status,
          client_id: targetClientId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error);
        return;
      }

      setRequests((prev) =>
        prev.filter((req) => req.request_id !== requestId),
      );
      alert(`Request ${status} successfully!`);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const handleRemoveClient = async (targetClient) => {
    const confirmed = window.confirm(
      `Remove ${targetClient.first_name} ${targetClient.last_name} from your roster?`,
    );
    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/clients/coach/${clientId}/${targetClient.client_id}`,
        { method: "DELETE" },
      );
      const data = await response.json();
      if (!response.ok) {
        alert(data.error || "Failed to remove client.");
        return;
      }
      setClients((prev) =>
        prev.filter((client) => client.client_id !== targetClient.client_id),
      );
      alert("Client removed from roster.");
    } catch (err) {
      console.error("Remove client failed:", err);
      alert("Failed to remove client.");
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim().length === 0) {
      alert("Please enter a valid search term.");
      return;
    }
    navigate(`/CoachSearch/${clientId}?search=${encodeURIComponent(searchTerm)}`);
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  useEffect(() => {
    const fetchCalorieData = async () => {
      const response = await fetch(`/api/calorie_graph/${clientId}`);
      const data = await response.json();
      setCalorieData(data);
    };
    fetchCalorieData();
  }, [clientId]);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const res = await fetch(`/api/review/coach/${clientId}`);
        const data = await res.json();

        if (res.ok) {
          setReviews(data);
        }
      } catch (err) {
        console.error("Failed to load reviews on startup:", err);
      }
    };

    if (clientId) {
      loadReviews();
    }
  }, [clientId]);

  return (
    <div className="dashboard-container">
      <Sidebar activePage="dashboard" />

      <main className="main-content">
        <h1 className="welcome-text">
          Welcome Back, {landingData.first_name} {landingData.last_name}!
        </h1>
        <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
          <button
            className={`btn-${activeTab === "dashboard" ? "primary" : "secondary"}`}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={`btn-${activeTab === "requests" ? "primary" : "secondary"}`}
            onClick={() => setActiveTab("requests")}
          >
            Pending Requests{requests.length > 0 ? ` (${requests.length})` : ""}
          </button>
          <button
            className={`btn-${activeTab === "clients" ? "primary" : "secondary"}`}
            onClick={() => setActiveTab("clients")}
          >
            My Clients
          </button>
        </div>
        <header className="dashboard-header">
          <h1 className="welcome-text">
            {activeTab === "dashboard" && "Coach Dashboard"}
            {activeTab === "requests" && "Manage Client Requests"}
            {activeTab === "clients" && "My Clients"}
          </h1>

          {(activeTab === "dashboard" || activeTab === "clients") && (
            <div className="search-container">
              <span className="search-icon">⌕</span>
              <input
                type="text"
                className="form-control search-input"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleEnter}
              />
              <button className="search-btn" onClick={handleSearch}>
                Search
              </button>
            </div>
          )}
        </header>

        {activeTab === "dashboard" && (
          <div className="dashboard-grid">
            <div className="card">
              <h3>Recent Reviews</h3>
              {reviews.length > 0 ? (
                reviews.slice(0, 3).map((r, index) => (
                  <div key={index} className="rreview-card">
                    <p>
                      {r.first_name} {r.last_name}
                    </p>
                    <p>
                      <strong>Rating:</strong> {r.rating}/5
                    </p>
                    <p>
                      <strong>Comment: </strong>
                      <i>"{r.comment}"</i>
                    </p>
                    <strong>Date: </strong>
                    {new Date(r.created_at).toLocaleDateString()}
                  </div>
                ))
              ) : (
                <p>No reviews yet for this coach.</p>
              )}
            </div>

            <div className="card">
              <h3>My Profile & Settings</h3>
              <div className="rreview-card">
                <p><strong>Current Rate:</strong> ${landingData.pricing || '0.00'}/mo</p>
                <p><strong>Availability:</strong> {landingData.availability || 'Not Set'}</p>
                <p><strong>Status:</strong>
                  <span style={{ color: landingData.status === 'active' ? '#00ff44' : '#ef4444', marginLeft: '5px' }}>
                    {landingData.status || 'inactive'}
                  </span>
                </p>
              </div>

              <div style={{ marginTop: '20px' }}>
                <button
                  className="btn-primary"
                  style={{ width: '100%' }}
                  onClick={() => navigate(`/UserProfile/${clientId}`)}
                >
                  Update Profile & Rates
                </button>
              </div>
            </div>

            <div className="card">
              <h3>Meal Tracker</h3>
              {calorieData.length > 0 ? (
                calorieData.slice(0, 4).map((cal) => (
                  <div key={cal.meal_log_id} className="mood-entry">
                    <div>
                      <div className="mood-label">Meal Log</div>
                      <div className="mood-date">
                        {cal.log_date} {cal.notes ? `— ${cal.notes}` : ""}
                      </div>
                    </div>
                    <span className="mood-score" style={{ color: "#85fb24" }}>
                      {cal.actual_calories} kcal
                    </span>
                  </div>
                ))
              ) : (
                <p style={{ color: "var(--muted)", fontSize: "13px" }}>
                  No meals logged yet.
                </p>
              )}
            </div>

            <div className="card">
              <h3>Mood Tracker</h3>
              {lanData.trackers?.length > 0 ? (
                lanData.trackers.slice(0, 4).map((mood) => (
                  <div key={mood.log_date} className="mood-entry">
                    <div>
                      <div className="mood-label">{mood.mood_label}</div>
                      <div className="mood-date">{new Date(mood.log_date.replace(/-/g, '\/')).toLocaleDateString()}</div>
                    </div>
                    <span className="mood-score">{mood.mood_score} / 10</span>
                  </div>
                ))
              ) : (
                <p style={{ color: "var(--muted)", fontSize: "13px" }}>
                  No mood logs found.
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab == "requests" && (
          <div className="requests-page-view">
            <div className="section-card" style={{ minHeight: "70vh" }}>
              <div className="flex justify-between items-center mb-6">
                <h3>Incoming Requests</h3>
              </div>

              {requests.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-zinc-500 text-lg">No pending requests.</p>
                </div>
              ) : (
                <div
                  className="request-stack"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "15px",
                  }}
                >
                  {requests.map((req) => (
                    <div
                      key={req.request_id}
                      className="coach-square"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "20px",
                      }}
                    >
                      <div>
                        <h4 style={{ margin: 0 }}>
                          {req.first_name} {req.last_name}
                        </h4>
                        <p className="text-zinc-500">
                          Client ID: {req.client_id}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          className="btn-primary"
                          onClick={() =>
                            handleAction(req.request_id, "accepted", req.client_id)
                          }
                        >
                          Accept
                        </button>
                        <button
                          className="btn-secondary"
                          onClick={() =>
                            handleAction(req.request_id, "rejected")
                          }
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "clients" && (
          <div className="clients-page-view">
            <div className="card" style={{ minHeight: "75vh" }}>
              <div className="flex justify-between items-center mb-6">
                <h3>Current Roster</h3>
                <p className="text-zinc-500">
                  {clients.length} total active clients
                </p>
              </div>

              {clients.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-zinc-500 text-lg">
                    Your roster is currently empty.
                  </p>
                  <button
                    className="btn-primary mt-4"
                    onClick={() => setActiveTab("requests")}
                  >
                    Check Requests
                  </button>
                </div>
              ) : (
                <div
                  className="client-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                    gap: "20px",
                  }}
                >
                  {clients.map((client) => (
                    <div key={client.client_id} className="card">
                      <div className="mb-4">
                        <h4 style={{ margin: 0, color: "#fbbf24" }}>
                          {client.first_name} {client.last_name}
                        </h4>
                        <p
                          style={{ margin: 0, color: "#fbbf24" }}
                          className="text-sm text-zinc-400"
                        >
                          {client.email}
                        </p>
                      </div>

                      <div
                        className="client-meta mb-4"
                        style={{
                          fontSize: "13px",
                          borderTop: "1px solid #27272a",
                          paddingTop: "10px",
                        }}
                      >
                        <p style={{ color: "#ffffff" }}>
                          <strong>Weight:</strong> {client.weight} lbs
                        </p>
                        <p style={{ color: "#ffffff" }}>
                          <strong>Joined:</strong>{" "}
                          {new Date(client.signup_date).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          className="meal-save-btn"
                          style={{ flex: 1 }}
                          onClick={() =>
                            navigate(`/UserProfile/${client.client_id}`)
                          }
                        >
                          Full Profile
                        </button>
                        <button
                          className="btn-secondary"
                          onClick={() =>
                            navigate(`/ViewClientProgress/${client.client_id}`)
                          }
                        >
                          View Progress
                        </button>
                        <button
                          className="btn-outline-warning"
                          onClick={() => handleRemoveClient(client)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CoachLanding;
