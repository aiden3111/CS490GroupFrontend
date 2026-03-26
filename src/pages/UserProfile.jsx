import "./UserProfile.css";
import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import { Form, Button } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";

function UserProfile() {
  const { clientId } = useParams();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("personal");
  const [isEditing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInId = localStorage.getItem("authenticatedClientId");
    if (loggedInId !== clientId) {
      navigate(`/UserProfile/${loggedInId}`);
      return;
    }
    if (clientId) {
      fetch(`http://127.0.0.1:5000/api/clients/${clientId}`)
        .then((res) => res.json())
        .then((data) => {
          setUser(data);
          setFormData({
            first_name: data.first_name,
            last_name: data.last_name,
            phone_number: data.phone_number,
            email: data.email,
          });
        })
        .catch((err) => console.error("Fetch error:", err));
    }
  }, [clientId, navigate]);

  const handleSave = async () => {
    const res = await fetch(`http://127.0.0.1:5000/api/clients/${clientId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      setUser({ ...user, ...formData });
      setEditing(false);
    }
  };

  if (!clientId)
    return (
      <div className="dashboard-container p-10">
        No Client ID found. Please log in again.
      </div>
    );

  if (!user)
    return (
      <div className="dashboard-container p-10">Loading BitFit Profile...</div>
    );

  return (
    <div className="dashboard-container">
      <nav className="sidebar">
        <div className="brand-logo">BitFit</div>
        <ul className="nav-list">
          <li onClick={() => setActiveTab("personal")} className={`nav-item ${activeTab === "personal" ? "active" : ""}`}>Personal Info</li>
          <li onClick={() => setActiveTab("physical")} className={`nav-item ${activeTab === "physical" ? "active" : ""}`}> Physical Stats</li>
          <li onClick={() => setActiveTab("goals")} className={`nav-item ${activeTab === "goals" ? "active" : ""}`}> Fitness </li>
          {user.role === 'coach' && (
            <>
              <div className="sidebar-divider" style={{ borderTop: '1px solid #27272a', margin: '1rem 0' }}></div>
              <li onClick={() => setActiveTab('coach-management')} className={`nav-item ${activeTab === "coach-management" ? "active" : ""}`}>Coach Management</li>
            </>
          )}
          {user.role != 'coach' && (
            <>
              <div className="sidebar-divider" style={{ borderTop: '1px solid #27272a', margin: '1rem 0' }}></div>
              <li onClick={() => setActiveTab('coach-application')} className={`nav-item ${activeTab === "coach-application" ? "active" : ""}`}>Coach Application</li>
            </>
          )}
          <li className="nav-item" onClick={() => navigate(`/LandingPage/${clientId}`)}>Dashboard</li>
        </ul>
      </nav>

      <main className="main-content">
        {activeTab === "personal" && (
          <PersonalInfoSection
            user={user}
            formData={formData}
            setFormData={setFormData}
            isEditing={isEditing}
            setEditing={setEditing}
            handleSave={handleSave}
          />
        )}
        {activeTab === "physical" && (
          <PhysicalStatsSection
            user={user}
            clientId={clientId}
            setUser={setUser}
          />
        )}
        {activeTab === "goals" && <FitnessGoalsSection clientId={clientId} />}
        {activeTab === 'coach-management' && <CoachManagementSection clientId={clientId} />}
        {activeTab === 'coach-application' && <CoachApplication clientId={clientId} />}
      </main>
    </div>
  );
}

const PersonalInfoSection = ({
  user,
  formData,
  setFormData,
  isEditing,
  setEditing,
  handleSave,
}) => {
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="section-card">
      <div className="section-header">
        <h2 className="section-title">Personal Information</h2>
        {!isEditing ? (
          <button onClick={() => setEditing(true)} className="btn-outline">
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={handleSave} className="btn-primary">
              Save Changes
            </button>
            <button onClick={() => setEditing(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="stats-grid">
        <div className="field-group">
          <label className="field-label">First Name</label>
          {isEditing ? (
            <input
              name="first_name"
              className="bitfit-input"
              value={formData.first_name || ""}
              onChange={handleChange}
            />
          ) : (
            <p className="field-value-highlight">{user.first_name}</p>
          )}
        </div>

        <div className="field-group">
          <label className="field-label">Last Name</label>
          {isEditing ? (
            <input
              name="last_name"
              className="bitfit-input"
              value={formData.last_name || ""}
              onChange={handleChange}
            />
          ) : (
            <p className="field-value-highlight">{user.last_name}</p>
          )}
        </div>

        <div className="field-group">
          <label className="field-label">Email</label>
          {isEditing ? (
            <input
              name="email"
              className="bitfit-input"
              value={formData.email || ""}
              onChange={handleChange}
            />
          ) : (
            <p className="field-value-highlight">{user.email}</p>
          )}
        </div>

        <div className="field-group">
          <label className="field-label">Phone Number</label>
          {isEditing ? (
            <input
              name="phone_number"
              className="bitfit-input"
              value={formData.phone_number || ""}
              onChange={handleChange}
            />
          ) : (
            <p className="field-value-highlight">{user.phone_number}</p>
          )}
        </div>
      </div>
    </div>
  );
};

const PhysicalStatsSection = ({ user, clientId, setUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [statsForm, setStatsForm] = useState({
    weight: user.weight,
    height: user.height,
  });

  const handleSavePhysical = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/profile/physical`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_id: clientId,
            weight: statsForm.weight,
            height: statsForm.height,
          }),
        },
      );

      if (response.ok) {
        setUser({
          ...user,
          weight: statsForm.weight,
          height: statsForm.height,
        });
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  return (
    <div className="section-card">
      <div className="section-header">
        <h2 className="section-title">Physical Stats</h2>
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} className="btn-outline">
            Update Stats
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={handleSavePhysical} className="btn-primary">
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="stats-grid">
        <div className="field-group">
          <label className="field-label">Weight (lbs)</label>
          {isEditing ? (
            <input
              type="number"
              value={statsForm.weight}
              onChange={(e) =>
                setStatsForm({ ...statsForm, weight: e.target.value })
              }
              className="bitfit-input"
            />
          ) : (
            <p className="field-value-highlight">
              {user.weight} <span className="text-zinc-500 text-sm">lbs</span>
            </p>
          )}
        </div>

        <div className="field-group">
          <label className="field-label">Height (inches)</label>
          {isEditing ? (
            <input
              type="number"
              value={statsForm.height}
              onChange={(e) =>
                setStatsForm({ ...statsForm, height: e.target.value })
              }
              className="bitfit-input"
            />
          ) : (
            <p className="field-value-highlight">
              {user.height} <span className="text-zinc-500 text-sm">in</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const FitnessGoalsSection = ({ clientId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [goals, setGoals] = useState(null);
  const [goalsForm, setGoalsForm] = useState({
    goal_weight: "",
    steps_per_day: "",
    time_active_per_day: "",
    workout_days_per_week: "",
  });

  useEffect(() => {
    if (clientId) {
      fetch(`http://127.0.0.1:5000/api/profile/goals/${clientId}`)
        .then((res) => res.json())
        .then((data) => {
          setGoals(data);
          setGoalsForm({
            goal_weight: data.goal_weight,
            steps_per_day: data.steps,
            time_active_per_day: data.time_active,
            workout_days_per_week: data.workout_days_per_week,
          });
        })
        .catch((err) => console.error("Error fetching goals:", err));
    }
  }, [clientId]);

  const handleSaveGoals = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/profile/goals`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          ...goalsForm,
        }),
      });

      if (response.ok) {
        setGoals({
          ...goals,
          goal_weight: goalsForm.goal_weight,
          steps: goalsForm.steps_per_day,
          time_active: goalsForm.time_active_per_day,
          workout_days_per_week: goalsForm.workout_days_per_week,
        });
        setIsEditing(false);
      }
    } catch (err) {
      console.error(" update failed:", err);
    }
  };

  if (!goals)
    return <div className="p-4 text-zinc-500">Loading BitFit ...</div>;

  return (
    <div className="section-card">
      <div className="section-header">
        <h2 className="section-title">Fitness Goals</h2>
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} className="btn-outline">
            Edit Goals
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={handleSaveGoals} className="btn-primary">
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="stats-grid">
        <div className="field-group">
          <label className="field-label">Target Weight (lbs)</label>
          {isEditing ? (
            <input
              type="number"
              value={goalsForm.goal_weight}
              onChange={(e) =>
                setGoalsForm({ ...goalsForm, goal_weight: e.target.value })
              }
              className="bitfit-input"
            />
          ) : (
            <p className="field-value-highlight">{goals.goal_weight} lbs</p>
          )}
        </div>

        <div className="field-group">
          <label className="field-label">Daily Steps</label>
          {isEditing ? (
            <input
              type="number"
              value={goalsForm.steps_per_day}
              onChange={(e) =>
                setGoalsForm({ ...goalsForm, steps_per_day: e.target.value })
              }
              className="bitfit-input"
            />
          ) : (
            <p className="field-value-highlight">
              {goals.steps.toLocaleString()}
            </p>
          )}
        </div>

        <div className="field-group">
          <label className="field-label">Active Time (hrs/day)</label>
          {isEditing ? (
            <input
              type="number"
              step="0.25"
              value={goalsForm.time_active_per_day}
              onChange={(e) =>
                setGoalsForm({
                  ...goalsForm,
                  time_active_per_day: e.target.value,
                })
              }
              className="bitfit-input"
            />
          ) : (
            <p className="field-value-highlight">{goals.time_active} hrs</p>
          )}
        </div>

        <div className="field-group">
          <label className="field-label">Workouts / Week</label>
          {isEditing ? (
            <input
              type="number"
              value={goalsForm.workout_days_per_week}
              onChange={(e) =>
                setGoalsForm({
                  ...goalsForm,
                  workout_days_per_week: e.target.value,
                })
              }
              className="bitfit-input"
            />
          ) : (
            <p className="field-value-highlight">
              {goals.workout_days_per_week} days
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const CoachManagementSection = ({ clientId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [coachForm, setCoachForm] = useState({
    pricing: '',
    specialty: '',
    certifications: '',
    availability: '',
    status: ''
  });

  useEffect(() => {
    if (clientId) {
      fetch(`http://127.0.0.1:5000/api/profile/coach/${clientId}`)
        .then(res => res.json())
        .then(data => setCoachForm(data))
        .catch(err => console.error("Error fetching coach info:", err));
    }
  }, [clientId]);

  const handleSave = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/profile/coach/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coachForm)

      });

      if (response.ok) {
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Coach update failed:", err);
    }
  };

  return (
    <div className="section-card">
      <div className="section-header">
        <div>
          <h2 className="section-title">Coach Management</h2>
          <p className="text-zinc-500 text-sm">Update your professional profile and availability.</p>
        </div>
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} className="btn-outline">Edit Management</button>
        ) : (
          <div className="flex gap-2">
            <button onClick={handleSave} className="btn-primary">Save All Changes</button>
            <button onClick={() => setIsEditing(false)} className="btn-secondary">Cancel</button>
          </div>
        )}
      </div>

      <div className="space-y-8">
        <div className="stats-grid">
          <div className="field-group">
            <label className="field-label">Hourly Rate ($)</label>
            {isEditing ? (
              <input type="number" value={coachForm.pricing} onChange={(e) => setCoachForm({ ...coachForm, pricing: e.target.value })} className="bitfit-input" />
            ) : (
              <p className="field-value-highlight">${coachForm.pricing}</p>
            )}
          </div>
          <div className="field-group">
            <label className="field-label">Specialty</label>
            {isEditing ? (
              <select value={coachForm.specialty} onChange={(e) => setCoachForm({ ...coachForm, specialty: e.target.value })} className="bitfit-input">
                <option value="fitness">Fitness</option>
                <option value="nutrition">Nutrition</option>
                <option value="both">Both</option>
              </select>
            ) : (
              <p className="field-value capitalize">{coachForm.specialty}</p>
            )}
          </div>
        </div>

        <hr style={{ borderColor: '#27272a', margin: '2rem 0' }} />

        <div className="field-group">
          <label className="field-label">Certifications & Qualifications</label>
          {isEditing ? (
            <textarea
              value={coachForm.certifications}
              onChange={(e) => setCoachForm({ ...coachForm, certifications: e.target.value })}
              className="bitfit-input"
              rows="3"
            />
          ) : (
            <p className="field-value-highlight">{coachForm.certifications || "No certifications listed."}</p>
          )}
        </div>

        <div className="field-group">
          <label className="field-label">Weekly Availability</label>
          {isEditing ? (
            <input
              type="text"
              placeholder="e.g. Mon-Fri 9am-5pm"
              value={coachForm.availability}
              onChange={(e) => setCoachForm({ ...coachForm, availability: e.target.value })}
              className="bitfit-input"
            />
          ) : (
            <p className="field-value-highlight">{coachForm.availability || "Not set"}</p>
          )}
        </div>
      </div>
    </div>
  );
};

const CoachApplication = ({ clientId }) => {
  const [coachApp, setCoachApp] = useState(false);
  const formikForm = useFormik({
    initialValues: {
      client_id: clientId,
      bio: "",
      specialty: "",
      certifications: "",
      pricing: ""
    },
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: (values) => {
      fetch("/api/api/coach_applications/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            alert(data.error);
          } else {
            console.log("Success:", data);
            setCoachApp(true);
          }
        })
        .catch((err) => console.error("Error:", err));
    },
    validate: (values) => {
      const errors = {};
      if (!values.bio) errors.bio = "Required";
      if (!values.specialty) errors.specialty = "Required";
      if (!values.certifications) errors.certifications = "Required";
      if (!values.pricing) errors.pricing = "Required";
      return errors;
    },
  });

  return (
    <div className="section-card w-100">
      <div className="section-header">
        <div>
          <h2 className="section-title">Coach Application</h2>
        </div>
      </div>

      <Form onSubmit={formikForm.handleSubmit}>
        <Form.Group className="mb-3" controlId="formSpecialty">
          <Form.Label className="text-white">Specialty</Form.Label>
          <Form.Select
            name="specialty"
            onChange={formikForm.handleChange}
            value={formikForm.values.specialty}
          >
            <option value="">Select Specialty</option>
            {["fitness", "nutrition", "both"].map((specialty) => (
              <option key={specialty} value={specialty}>{specialty}</option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBio">
          <Form.Label className="text-white">Bio</Form.Label>
          <Form.Control
            as="textarea"
            rows={5}
            name="bio"
            onChange={formikForm.handleChange}
            value={formikForm.values.bio}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formCertifications">
          <Form.Label className="text-white">Certifications</Form.Label>
          <Form.Control
            type="text"
            name="certifications"
            onChange={formikForm.handleChange}
            value={formikForm.values.certifications}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formPricing">
          <Form.Label className="text-white">Pricing</Form.Label>
          <Form.Control
            type="number"
            name="pricing"
            onChange={formikForm.handleChange}
            value={formikForm.values.pricing}
          />
        </Form.Group>

        {!coachApp ? (
          <Button variant="primary" type="submit" className="w-100">Submit</Button>
        ) : (
          <div>
            <Button variant="primary" className="w-100" disabled>Submit</Button>
            <p>Application Submitted</p>
          </div>
        )}
      </Form>
    </div>
  );
};

export default UserProfile;
