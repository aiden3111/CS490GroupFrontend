import { useNavigate, useParams } from "react-router-dom";
import "./Landingcss.css";
import React, { useState, useEffect } from "react";
import { Navbar, Nav } from "react-bootstrap";

const CoachLanding = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [requests, setRequests] = useState([]);
  const [clients, setClients] = useState([]);
  const userRole = localStorage.getItem("userRole");
  const coachSpecialty = localStorage.getItem("coachSpecialty");

  const handleCreatePlan = async (clientData) => {
    const planData = {
      created_by: localStorage.getItem("authenticatedClientId"),
      client_id: clientData.client_id,
      frequency: 3,
      difficulty: "Intermediate",
      is_draft: 0
    };

    try {
      const res = await fetch("/api/api/workoutPlansPage/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(planData)
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
    if (activeTab === 'clients') {
      fetch(`/api/api/clients/coach/${clientId}`)
        .then(res => res.json())
        .then(data => setClients(data))
        .catch(err => console.error("Error loading roster:", err));
    }
  }, [activeTab, clientId]);

  useEffect(() => {
    const loggedInId = localStorage.getItem("authenticatedClientId");
    if (loggedInId !== clientId) {
      navigate(`/UserProfile/${loggedInId}`);
      return;
    }
  }, [clientId, navigate]);

  useEffect(() => {
    fetch(`/api/api/coach/${clientId}/requests`)
      .then(res => res.json())
      .then(data => setRequests(data.filter(req => req.status === 'pending')))
      .catch(err => console.error("Error loading requests:", err));
  }, [clientId]);

  const handleAction = async (requestId, status, targetClientId) => {
    try {
      const response = await fetch(`/api/api/coach/${clientId}/requests/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: status,
          client_id: targetClientId
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error);
        return;
      }

      if (response.ok) {
        setRequests((prev) => prev.filter((req) => req.request_id !== requestId));
        alert(`Request ${status} successfully!`);
      }
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim().length === 0) {
      alert("Please enter a valid search term.");
      return;
    }
    const encodedSearch = encodeURIComponent(searchTerm);
    navigate(`/CoachSearch/${clientId}?search=${searchTerm}`);
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authenticatedClientId");
    navigate("/LoginPage/");
  };



  //TODO: add the links to side bar
  //TODO: Build the top bar

  return (
    <div className="dashboard-container">
      <nav className="sidebar">
        <div className="brand-logo">BitFit</div>
        <ul className="nav-list">
          <li className={`nav-item ${activeTab == 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >Dashboard</li>
          <li
            className={`nav-item ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            Pending Requests {requests.length > 0 && `(${requests.length})`}
          </li>
          <li
            className={`nav-item ${activeTab === 'clients' ? 'active' : ''}`}
            onClick={() => setActiveTab('clients')}
          >
            My Clients
          </li>
          <li className="nav-item" onClick={() => navigate(`/WorkoutLogPage/${clientId}`)}>Workout Logs</li>
          <li className="nav-item">Meal Tracker</li>
          {(userRole === 'coach' && (coachSpecialty === 'nutrition' || coachSpecialty === 'both')) && (
            <li className="nav-item" onClick={() => navigate(`/AssignMealPlan/${clientId}`)}>
              Assign Meal Plans
            </li>
          )}
          <li className="nav-item">Mood Tracker</li>
          <li className="nav-item" onClick={() => navigate(`/MessagingPage/${clientId}`)}>Messages</li>
          <li className="nav-item">Subscriptions</li>
          <li className="nav-item">Analytics</li>
          <li className="nav-item" onClick={() => navigate(`/UserProfile/${clientId}`)}>
            My Profile </li>
        </ul>

        <div className="sidebar-bottom">
          <button className="logout-btn" onClickCapture={handleLogout}>Logout</button>
        </div>
      </nav>

      <main className="main-content">
        <header className="dashboard-header">
          <h1 className="welcome-text">
            {activeTab === 'dashboard' && 'Coach Dashboard'}
            {activeTab === 'requests' && 'Manage Client Requests'}
            {activeTab === 'clients' && 'My Clients'}
          </h1>

          {(activeTab === 'dashboard' || activeTab === 'clients') && (
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
              <button className="search-btn" onClick={handleSearch}>Search</button>
            </div>
          )}
        </header>

        {activeTab === 'dashboard' && (
          <div className="dashboard-grid">
            <div className="grid-left">
              <div className="section-card">
                <h3>Mood Tracker</h3>
                <div className="chart-placeholder">Dashboard Analytics Here</div>
              </div>
            </div>
            <div className="grid-right">
              <div className="section-card">
                <h3>Top Coaches</h3>
              </div>
            </div>
          </div>
        )}

        {activeTab == 'requests' && (
          <div className="requests-page-view">
            <div className="section-card" style={{ minHeight: '70vh' }}>
              <div className="flex justify-between items-center mb-6">
                <h3>Incoming Requests</h3>
              </div>

              {requests.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-zinc-500 text-lg">No pending requests.</p>
                </div>
              ) : (
                <div className="request-stack" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {requests.map((req) => (
                    <div key={req.request_id} className="coach-square" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
                      <div>
                        <h4 style={{ margin: 0 }}>{req.first_name} {req.last_name}</h4>
                        <p className="text-zinc-500">Client ID: {req.client_id}</p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          className="btn-primary"
                          onClick={() => handleAction(req.request_id, 'accepted', req.client_id)}>Accept</button>
                        <button
                          className="btn-secondary"
                          onClick={() => handleAction(req.request_id, 'rejected')}>Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="clients-page-view">
            <div className="card" style={{ minHeight: '75vh' }}>
              <div className="flex justify-between items-center mb-6">
                <h3>Current Roster</h3>
                <p className="text-zinc-500">{clients.length} total active clients</p>
              </div>

              {clients.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-zinc-500 text-lg">Your roster is currently empty.</p>
                  <button className="btn-primary mt-4" onClick={() => setActiveTab('requests')}>Check Requests</button>
                </div>
              ) : (
                <div className="client-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                  {clients.map(client => (
                    <div key={client.client_id} className="card">
                      <div className="mb-4">
                        <h4 style={{ margin: 0, color: '#fbbf24' }}>{client.first_name} {client.last_name}</h4>
                        <p style={{ margin: 0, color: '#fbbf24' }} className="text-sm text-zinc-400">{client.email}</p>
                      </div>

                      <div className="client-meta mb-4" style={{ fontSize: '13px', borderTop: '1px solid #27272a', paddingTop: '10px' }}>
                        <p style={{ color: '#ffffff' }}><strong>Weight:</strong> {client.weight} lbs</p>
                        <p style={{ color: '#ffffff' }}><strong>Joined:</strong> {new Date(client.signup_date).toLocaleDateString()}</p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          className="meal-save-btn"
                          style={{ flex: 1 }}
                          onClick={() => navigate(`/UserProfile/${client.client_id}`)}
                        >
                          Full Profile
                        </button>
                        <button
                          className="btn-secondary"
                          onClick={() => navigate(`/WorkoutLogPage/${client.client_id}`)}
                        >
                          Logs {/*This is not redirecting to where its suposed to go*/}
                        </button>
                      </div>
                      <button
                        className="btn-outline-warning w-100"
                        style={{ border: '1px solid #fbbf24', color: '#fbbf24', background: 'transparent', padding: '8px' }}
                        onClick={() => handleCreatePlan(client)}
                      >
                        + Assign New Workout Plan
                      </button>
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
//TODO: Fix Styling
//TODO: Fix Sqares content
export default CoachLanding;