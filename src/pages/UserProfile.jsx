import "./UserProfile.css";
import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import { Form, Button } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import Modal from "./ModalPage";

function UserProfile() {
  const { clientId } = useParams();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("personal");
  const [isEditing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();
  const loggedInUserRole = localStorage.getItem("userRole");
  const [isOpen, setIsOpen] = useState(false); 

  const loggedInId = localStorage.getItem("authenticatedClientId");

  useEffect(() => {
    if (!clientId) return;

    fetch(`http://127.0.0.1:5000/api/clients/${clientId}`)
      .then((res) => res.json())
      .then((data) => {
        if (loggedInId !== clientId && loggedInUserRole !== 'coach') {
          navigate(`/UserProfile/${loggedInId}`);
          return;
        }

        setUser(data);
        setFormData({
          first_name: data.first_name,
          last_name: data.last_name,
          phone_number: data.phone_number,
          email: data.email,
        });
      })
      .catch((err) => console.error("Fetch error:", err));
  }, [clientId, navigate, loggedInId, loggedInUserRole]);

  const canEdit = loggedInId === clientId;

  if (!user) return <div className="dashboard-container p-10">Loading BitFit Profile...</div>;

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

  const handleDeleteAccount = async () => {
    try {
      const res = await fetch(`/api/api/clients/${clientId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setIsOpen(false);
        localStorage.clear();
        navigate("/LoginPage");
      }
    } catch (err) {
      console.error("Delete error:", err);
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
        {loggedInId !== clientId && (
          <div className="p-3">
            <Button variant="outline-warning" size="sm" onClick={() => navigate(-1)}>
              ← Back to Roster
            </Button>
          </div>
        )}
        <ul className="nav-list">
          <li onClick={() => setActiveTab("personal")} className={`nav-item ${activeTab === "personal" ? "active" : ""}`}>Personal Info</li>
          <li onClick={() => setActiveTab("physical")} className={`nav-item ${activeTab === "physical" ? "active" : ""}`}> Physical Stats</li>
          <li onClick={() => setActiveTab("goals")} className={`nav-item ${activeTab === "goals" ? "active" : ""}`}> Fitness </li>
          {canEdit && user.role === 'coach' && (
            <>
              <div className="sidebar-divider" style={{ borderTop: '1px solid #27272a', margin: '1rem 0' }}></div>
              <li onClick={() => setActiveTab('coach-management')} className={`nav-item ${activeTab === "coach-management" ? "active" : ""}`}>Coach Management</li>
            </>
          )}
          {canEdit && user.role === 'client' && (
            <>
              <div className="sidebar-divider" style={{ borderTop: '1px solid #27272a', margin: '1rem 0' }}></div>
              <li onClick={() => setActiveTab('coach-application')} className={`nav-item ${activeTab === "coach-application" ? "active" : ""}`}>Coach Application</li>
              <li onClick={() => setActiveTab('payment-methods')} className={`nav-item ${activeTab === "payment-methods" ? "active" : ""}`}>Payment Methods</li>
            </>
          )}
          <li className="nav-item" onClick={() => navigate(`/LandingPage/${loggedInId}`)}>Dashboard</li>
        </ul>
      </nav>

      <main className="main-content">
        <header className="mb-4">
          <h1 className="welcome-text">
            {loggedInId === clientId ? "My Profile" : `${user.first_name}'s Profile`}
          </h1>
        </header>

        {activeTab === "personal" && (
          <PersonalInfoSection
            user={user}
            formData={formData}
            setFormData={setFormData}
            isEditing={isEditing}
            setEditing={setEditing}
            handleSave={handleSave}
            canEdit={canEdit}
            setIsOpen={setIsOpen}
          />

        )}
        {activeTab === "physical" && (
          <PhysicalStatsSection
            user={user}
            clientId={clientId}
            setUser={setUser}
            canEdit={canEdit}
          />
        )}
        {activeTab === "goals" && <FitnessGoalsSection clientId={clientId} canEdit={canEdit} />}
        {activeTab === 'coach-management' && <CoachManagementSection clientId={clientId} />}
        {activeTab === 'coach-application' && <CoachApplication clientId={clientId} />}
        {activeTab === 'payment-methods' && <PaymentMethodsSection clientId={clientId} canEdit={canEdit} />}

        <Modal open={isOpen} onClose={() => setIsOpen(false)}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: '#1a2e1d' }}>Delete BitFit Account?</h2>
            <p style={{ margin: '20px 0', color: '#1a2e1d' }}>
              This will permanently erase your progress, logs, and profile.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={handleDeleteAccount} className="btn-primary" style={{ backgroundColor: '#dc2626' }}>Yes, Delete</button>
              <button onClick={() => setIsOpen(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </Modal>
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
  canEdit,
  setIsOpen
}) => {
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="section-card">
      <div className="section-header">
        <h2 className="section-title">Personal Information</h2>
        {canEdit && (!isEditing ? (
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
        ))}
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

        {canEdit && !isEditing && (
          <div style={{
            marginTop: '40px',
            paddingTop: '20px',
            borderTop: '1px solid #27272a',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ color: '#71717a', fontSize: '14px' }}>
              No longer need your BitFit account?
            </span>
            <button
              onClick={() => setIsOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#dc2626',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Delete Account
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

const PhysicalStatsSection = ({ user, clientId, setUser, canEdit }) => {
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
        {canEdit && (!isEditing ? (
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
        ))}
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

const FitnessGoalsSection = ({ clientId, canEdit }) => {
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
        {canEdit && (!isEditing ? (
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
        ))}
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
    isFitness: false,
    isNutrition: false,
    fitnessData: { certifications: "" },
    nutritionData: { certifications: "" },
    pricing: '',
    availability: '',
    status: ''
  });

  useEffect(() => {
    const fetchCoachData = async () => {
      try {
        const [baseRes, fitRes, nutRes] = await Promise.all([
          fetch(`http://127.0.0.1:5000/api/profile/coach/${clientId}`),
          fetch(`http://127.0.0.1:5000/api/profile/fitness_coach/${clientId}`),
          fetch(`http://127.0.0.1:5000/api/profile/nutrition_coach/${clientId}`)
        ]);

        const baseData = await baseRes.json();
        const fitData = fitRes.ok ? await fitRes.json() : null;
        const nutData = nutRes.ok ? await nutRes.json() : null;

        setCoachForm({
          isFitness: !!fitData,
          isNutrition: !!nutData,
          fitnessData: fitData || { certifications: "" },
          nutritionData: nutData || { certifications: "" },
          availability: baseData.availability || "",
          pricing: baseData.pricing || ""
        });
      } catch (err) {
        console.error("Error fetching split coach data:", err);
      }
    };

    if (clientId) fetchCoachData();
  }, [clientId]);

  const handleSave = async () => {
    try {
      const updates = [];

      updates.push(fetch(`http://127.0.0.1:5000/api/profile/coach/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability: coachForm.availability, pricing: coachForm.pricing })
      }));

      if (coachForm.isFitness) {
        updates.push(fetch(`http://127.0.0.1:5000/api/profile/fitness_coach/${clientId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ certifications: coachForm.fitnessData.certifications })
        }));
      }

      if (coachForm.isNutrition) {
        updates.push(fetch(`http://127.0.0.1:5000/api/profile/nutrition_coach/${clientId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ certifications: coachForm.nutritionData.certifications })
        }));
      }

      await Promise.all(updates);
      setIsEditing(false);
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
        <div>
          <div className="field-group">
            <label className="field-label">Hourly Rate ($)</label>
            {isEditing ? (
              <input type="number" value={coachForm.pricing} onChange={(e) => setCoachForm({ ...coachForm, pricing: e.target.value })} className="bitfit-input" />
            ) : (
              <p className="field-value-highlight">${coachForm.pricing}</p>
            )}
          </div>

        </div>

        <div className="field-group">
          {coachForm.isFitness && (
            <div className="specialty-block" style={{ borderLeft: '4px solid #fbbf24', paddingLeft: '20px' }}>
              <div className="field-group">
                <label className="field-label">Fitness Certifications & Qualifications</label>
                {isEditing ? (
                  <textarea
                    className="bitfit-input"
                    value={coachForm.fitnessData.certifications}
                    onChange={(e) => setCoachForm({
                      ...coachForm,
                      fitnessData: { ...coachForm.fitnessData, certifications: e.target.value }
                    })}
                    rows="3"
                  />
                ) : (
                  <p className="field-value-highlight">
                    {coachForm.fitnessData.certifications || "No fitness certifications listed."}
                  </p>
                )}
              </div>
            </div>
          )}

          {coachForm.isNutrition && (
            <div className="specialty-block" style={{ borderLeft: '4px solid #10b981', paddingLeft: '20px' }}>
              <div className="field-group">
                <label className="field-label">Nutrition Certifications & Qualifications</label>
                {isEditing ? (
                  <textarea
                    className="bitfit-input"
                    value={coachForm.nutritionData.certifications}
                    onChange={(e) => setCoachForm({
                      ...coachForm,
                      nutritionData: { ...coachForm.nutritionData, certifications: e.target.value }
                    })}
                    rows="3"
                  />
                ) : (
                  <p className="field-value-highlight">
                    {coachForm.nutritionData.certifications || "No nutrition certifications listed."}
                  </p>
                )}
              </div>
            </div>
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

const PaymentMethodsSection = ({ clientId, canEdit }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [methods, setMethods] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState({
    card_type: "Visa",
    last4: "",
    expiry_month: "",
    expiry_year: "",
    is_default: false,
  });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    card_type: "",
    last4: "",
    expiry_month: "",
    expiry_year: "",
  });

  const fetchMethods = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`http://127.0.0.1:5000/payment/client/${clientId}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to load payment methods");
        setMethods([]);
      } else {
        setMethods(Array.isArray(data) ? data : []);
      }
    } catch (_e) {
      setError("Failed to load payment methods");
      setMethods([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!clientId) return;
    fetchMethods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  const startEdit = (m) => {
    setEditingId(m.payment_id);
    setEditForm({
      card_type: m.card_type || "",
      last4: m.last4 || "",
      expiry_month: m.expiry_month ?? "",
      expiry_year: m.expiry_year ?? "",
    });
  };

  const saveEdit = async (paymentId) => {
    setError("");
    const payload = {};
    if (editForm.card_type !== "") payload.card_type = editForm.card_type;
    if (editForm.last4 !== "") payload.last4 = editForm.last4;
    if (editForm.expiry_month !== "") payload.expiry_month = Number(editForm.expiry_month);
    if (editForm.expiry_year !== "") payload.expiry_year = Number(editForm.expiry_year);

    try {
      const res = await fetch(`http://127.0.0.1:5000/payment/update/${paymentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Update failed");
        return;
      }
      setEditingId(null);
      await fetchMethods();
    } catch (_e) {
      setError("Update failed");
    }
  };

  const setDefault = async (paymentId) => {
    setError("");
    try {
      const res = await fetch(`http://127.0.0.1:5000/payment/default/${paymentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: clientId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to set default");
        return;
      }
      await fetchMethods();
    } catch (_e) {
      setError("Failed to set default");
    }
  };

  const deleteMethod = async (paymentId) => {
    setError("");
    try {
      const res = await fetch(`http://127.0.0.1:5000/payment/delete/${paymentId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Delete failed");
        return;
      }
      await fetchMethods();
    } catch (_e) {
      setError("Delete failed");
    }
  };

  const addMethod = async () => {
    setError("");
    try {
      const res = await fetch(`http://127.0.0.1:5000/payment/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          card_type: addForm.card_type,
          last4: String(addForm.last4),
          expiry_month: Number(addForm.expiry_month),
          expiry_year: Number(addForm.expiry_year),
          is_default: !!addForm.is_default,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Add failed");
        return;
      }
      setIsAdding(false);
      setAddForm({ card_type: "Visa", last4: "", expiry_month: "", expiry_year: "", is_default: false });
      await fetchMethods();
    } catch (_e) {
      setError("Add failed");
    }
  };

  return (
    <div className="section-card">
      <div className="section-header">
        <div>
          <h2 className="section-title">Payment Methods</h2>
          <p className="text-zinc-500 text-sm">Add, edit, or choose a default payment method.</p>
        </div>
        {canEdit && (!isAdding ? (
          <button className="btn-outline" onClick={() => setIsAdding(true)}>Add Method</button>
        ) : (
          <div className="flex gap-2">
            <button className="btn-primary" onClick={addMethod}>Save</button>
            <button className="btn-secondary" onClick={() => setIsAdding(false)}>Cancel</button>
          </div>
        ))}
      </div>

      {error && (
        <div style={{ marginBottom: 16, color: "#fca5a5" }}>
          {error}
        </div>
      )}

      {isAdding && (
        <div style={{ border: "1px solid #27272a", borderRadius: 12, padding: 16, marginBottom: 24 }}>
          <div className="stats-grid">
            <div className="field-group">
              <label className="field-label">Card Type</label>
              <select
                className="bitfit-input"
                value={addForm.card_type}
                onChange={(e) => setAddForm({ ...addForm, card_type: e.target.value })}
              >
                {["Visa", "Mastercard", "Amex", "Discover", "Other"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="field-group">
              <label className="field-label">Last 4</label>
              <input
                className="bitfit-input"
                value={addForm.last4}
                maxLength={4}
                onChange={(e) => setAddForm({ ...addForm, last4: e.target.value.replace(/\D/g, "").slice(0, 4) })}
              />
            </div>
            <div className="field-group">
              <label className="field-label">Expiry Month</label>
              <input
                className="bitfit-input"
                type="number"
                min={1}
                max={12}
                value={addForm.expiry_month}
                onChange={(e) => setAddForm({ ...addForm, expiry_month: e.target.value })}
              />
            </div>
            <div className="field-group">
              <label className="field-label">Expiry Year</label>
              <input
                className="bitfit-input"
                type="number"
                min={2024}
                max={2100}
                value={addForm.expiry_year}
                onChange={(e) => setAddForm({ ...addForm, expiry_year: e.target.value })}
              />
            </div>
          </div>

          <div style={{ marginTop: 8 }}>
            <label style={{ color: "#a1a1aa", display: "flex", gap: 10, alignItems: "center" }}>
              <input
                type="checkbox"
                checked={addForm.is_default}
                onChange={(e) => setAddForm({ ...addForm, is_default: e.target.checked })}
              />
              Set as default
            </label>
          </div>
        </div>
      )}

      {loading ? (
        <div className="p-4 text-zinc-500">Loading payment methods...</div>
      ) : methods.length === 0 ? (
        <div className="p-4 text-zinc-500">No payment methods yet. Add one to request a coach.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {methods.map((m) => {
            const isEditingRow = editingId === m.payment_id;
            const label = `${m.card_type || "Card"} •••• ${m.last4 || "----"} (exp ${m.expiry_month ?? "--"}/${m.expiry_year ?? "----"})`;
            return (
              <div
                key={m.payment_id}
                style={{
                  border: "1px solid #27272a",
                  borderRadius: 12,
                  padding: 16,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: "#e4e4e7" }}>
                    {label} {m.is_default ? <span style={{ color: "#22c55e" }}>(Default)</span> : null}
                  </div>
                </div>

                {canEdit && (
                  <div className="flex gap-2" style={{ flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {!m.is_default && (
                      <button className="btn-outline" onClick={() => setDefault(m.payment_id)}>Make Default</button>
                    )}
                    {!isEditingRow ? (
                      <>
                        <button className="btn-outline" onClick={() => startEdit(m)}>Edit</button>
                        <button className="btn-secondary" onClick={() => deleteMethod(m.payment_id)}>Delete</button>
                      </>
                    ) : (
                      <>
                        <button className="btn-primary" onClick={() => saveEdit(m.payment_id)}>Save</button>
                        <button className="btn-secondary" onClick={() => setEditingId(null)}>Cancel</button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {editingId !== null && (
            <div style={{ border: "1px solid #27272a", borderRadius: 12, padding: 16 }}>
              <div style={{ color: "#a1a1aa", marginBottom: 10 }}>Editing selected method</div>
              <div className="stats-grid">
                <div className="field-group">
                  <label className="field-label">Card Type</label>
                  <input
                    className="bitfit-input"
                    value={editForm.card_type}
                    onChange={(e) => setEditForm({ ...editForm, card_type: e.target.value })}
                  />
                </div>
                <div className="field-group">
                  <label className="field-label">Last 4</label>
                  <input
                    className="bitfit-input"
                    value={editForm.last4}
                    maxLength={4}
                    onChange={(e) => setEditForm({ ...editForm, last4: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                  />
                </div>
                <div className="field-group">
                  <label className="field-label">Expiry Month</label>
                  <input
                    className="bitfit-input"
                    type="number"
                    min={1}
                    max={12}
                    value={editForm.expiry_month}
                    onChange={(e) => setEditForm({ ...editForm, expiry_month: e.target.value })}
                  />
                </div>
                <div className="field-group">
                  <label className="field-label">Expiry Year</label>
                  <input
                    className="bitfit-input"
                    type="number"
                    min={2024}
                    max={2100}
                    value={editForm.expiry_year}
                    onChange={(e) => setEditForm({ ...editForm, expiry_year: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserProfile;
