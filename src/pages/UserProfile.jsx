import "./UserProfile.css";
import React, { useState, useEffect } from 'react';
import {useParams} from 'react-router-dom';

function UserProfile() {
    const {clientId} = useParams();
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('personal');
    const [isEditing, setEditing] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (clientId) {
            fetch(`http://127.0.0.1:5000/api/clients/${clientId}`)
                .then(res => res.json())
                .then(data => {
                    setUser(data);
                    setFormData({
                        first_name: data.first_name,
                        last_name: data.last_name,
                        phone_number: data.phone_number,
                        email: data.email
                    });
                })
                .catch(err => console.error("Fetch error:", err));
        }
    }, [clientId]);

    const handleSave = async () => {
        const res = await fetch(`http://127.0.0.1:5000/api/clients/${clientId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        if (res.ok) {
            setUser({ ...user, ...formData });
            setEditing(false);
        }
    };

    if (!clientId) return <div className="dashboard-container p-10">No Client ID found. Please log in again.</div>;

    if (!user) return <div className="dashboard-container p-10">Loading BitFit Profile...</div>;

    return (
        <div className="dashboard-container">
            <nav className="sidebar">
                <div className="brand-logo">BitFit</div>
                <ul className="nav-list">
                    <li
                        onClick={() => setActiveTab('personal')}
                        className={`nav-item ${activeTab === 'personal' ? 'active' : ''}`}
                    >
                        Personal Info
                    </li>
                    <li
                        onClick={() => setActiveTab('physical')}
                        className={`nav-item ${activeTab === 'physical' ? 'active' : ''}`}
                    >
                        Physical Stats
                    </li>
                    <li
                        onClick={() => setActiveTab('goals')}
                        className={`nav-item ${activeTab === 'goals' ? 'active' : ''}`}
                    >
                        Fitness Goals
                    </li>
                </ul>
            </nav>

            <main className="main-content">
                {activeTab === 'personal' && (
                    <PersonalInfoSection
                        user={user}
                        formData={formData}
                        setFormData={setFormData}
                        isEditing={isEditing}
                        setEditing={setEditing}
                        handleSave={handleSave}
                    />
                )}
                {activeTab === 'physical' && (
                    <PhysicalStatsSection
                        user={user}
                        clientId={clientId}
                        setUser={setUser}
                    />
                )}
                {activeTab === 'goals' && (
                    <FitnessGoalsSection clientId={clientId} />
                )}
            </main>
        </div>
    );
}

const PersonalInfoSection = ({ user, formData, setFormData, isEditing, setEditing, handleSave }) => {
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="section-card">
            <div className="section-header">
                <h2 className="section-title">Personal Information</h2>
                {!isEditing ? (
                    <button onClick={() => setEditing(true)} className="btn-outline">Edit Profile</button>
                ) : (
                    <div className="flex gap-2">
                        <button onClick={handleSave} className="btn-primary">Save Changes</button>
                        <button onClick={() => setEditing(false)} className="btn-secondary">Cancel</button>
                    </div>
                )}
            </div>

            <div className="stats-grid">
                <div className="field-group">
                    <label className="field-label">First Name</label>
                    {isEditing ? (
                        <input name="first_name" className="bitfit-input" value={formData.first_name || ""} onChange={handleChange} />
                    ) : (
                        <p className="field-value-highlight">{user.first_name}</p>
                    )}
                </div>

                <div className="field-group">
                    <label className="field-label">Last Name</label>
                    {isEditing ? (
                        <input name="last_name" className="bitfit-input" value={formData.last_name || ""} onChange={handleChange} />
                    ) : (
                        <p className="field-value-highlight">{user.last_name}</p>
                    )}
                </div>

                <div className="field-group">
                    <label className="field-label">Email</label>
                    {isEditing ? (
                        <input name="email" className="bitfit-input" value={formData.email || ""} onChange={handleChange} />
                    ) : (
                        <p className="field-value-highlight">{user.email}</p>
                    )}
                </div>

                <div className="field-group">
                    <label className="field-label">Phone Number</label>
                    {isEditing ? (
                        <input name="phone_number" className="bitfit-input" value={formData.phone_number || ""} onChange={handleChange} />
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
        height: user.height
    });

    const handleSavePhysical = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/profile/physical`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    client_id: clientId,
                    weight: statsForm.weight,
                    height: statsForm.height
                })
            });

            if (response.ok) {
                setUser({ ...user, weight: statsForm.weight, height: statsForm.height });
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
                    <button onClick={() => setIsEditing(true)} className="btn-outline">Update Stats</button>
                ) : (
                    <div className="flex gap-2">
                        <button onClick={handleSavePhysical} className="btn-primary">Save</button>
                        <button onClick={() => setIsEditing(false)} className="btn-secondary">Cancel</button>
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
                            onChange={(e) => setStatsForm({ ...statsForm, weight: e.target.value })}
                            className="bitfit-input"
                        />
                    ) : (
                        <p className="field-value-highlight">{user.weight} <span className="text-zinc-500 text-sm">lbs</span></p>
                    )}
                </div>

                <div className="field-group">
                    <label className="field-label">Height (inches)</label>
                    {isEditing ? (
                        <input
                            type="number"
                            value={statsForm.height}
                            onChange={(e) => setStatsForm({ ...statsForm, height: e.target.value })}
                            className="bitfit-input"
                        />
                    ) : (
                        <p className="field-value-highlight">{user.height} <span className="text-zinc-500 text-sm">in</span></p>
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
        workout_days_per_week: ""
    });

    useEffect(() => {
        if (clientId) {
            fetch(`http://127.0.0.1:5000/api/profile/goals/${clientId}`)
                .then(res => res.json())
                .then(data => {
                    setGoals(data);
                    setGoalsForm({
                        goal_weight: data.goal_weight,
                        steps_per_day: data.steps,
                        time_active_per_day: data.time_active,
                        workout_days_per_week: data.workout_days_per_week
                    });
                })
                .catch(err => console.error("Error fetching goals:", err));
        }
    }, [clientId]);

    const handleSaveGoals = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/profile/goals`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    client_id: clientId,
                    ...goalsForm
                })
            });

            if (response.ok) {
                setGoals({
                    ...goals,
                    goal_weight: goalsForm.goal_weight,
                    steps: goalsForm.steps_per_day,
                    time_active: goalsForm.time_active_per_day,
                    workout_days_per_week: goalsForm.workout_days_per_week
                });
                setIsEditing(false);
            }
        } catch (err) {
            console.error("Goals update failed:", err);
        }
    };

    if (!goals) return <div className="p-4 text-zinc-500">Loading BitFit Goals...</div>;

    return (
        <div className="section-card">
            <div className="section-header">
                <h2 className="section-title">Fitness Goals</h2>
                {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="btn-outline">Edit Goals</button>
                ) : (
                    <div className="flex gap-2">
                        <button onClick={handleSaveGoals} className="btn-primary">Save</button>
                        <button onClick={() => setIsEditing(false)} className="btn-secondary">Cancel</button>
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
                            onChange={(e) => setGoalsForm({ ...goalsForm, goal_weight: e.target.value })}
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
                            onChange={(e) => setGoalsForm({ ...goalsForm, steps_per_day: e.target.value })}
                            className="bitfit-input"
                        />
                    ) : (
                        <p className="field-value-highlight">{goals.steps.toLocaleString()}</p>
                    )}
                </div>

                <div className="field-group">
                    <label className="field-label">Active Time (hrs/day)</label>
                    {isEditing ? (
                        <input
                            type="number"
                            step="0.25"
                            value={goalsForm.time_active_per_day}
                            onChange={(e) => setGoalsForm({ ...goalsForm, time_active_per_day: e.target.value })}
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
                            onChange={(e) => setGoalsForm({ ...goalsForm, workout_days_per_week: e.target.value })}
                            className="bitfit-input"
                        />
                    ) : (
                        <p className="field-value-highlight">{goals.workout_days_per_week} days</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;