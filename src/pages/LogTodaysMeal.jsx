import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Landingcss.css";


const LogTodaysMeal = () => {
    const { clientId } = useParams();
    const navigate = useNavigate();

    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const [assignedMeals, setAssignedMeals] = useState([]);

    const [isCustomMode, setIsCustomMode] = useState(false);
    const [customMeal, setCustomMeal] = useState({
        meal_name: "",
        calories: "",
        protein: "",
        carbs: "",
        fats: "",
        notes: "",
        description: ""
    });

    useEffect(() => {
        const fetchPlanMeals = async () => {
            try {
                const res = await fetch(`http://127.0.0.1:5000/api/nutrition_plan/${clientId}`);
                const plans = await res.json();

                if (res.ok && plans.length > 0) {
                    const latestPlanId = plans[plans.length - 1].nutrition_plan_id;

                    const mealRes = await fetch(`http://127.0.0.1:5000/api/nutrition_plan/${clientId}/${latestPlanId}`);
                    const mealData = await mealRes.json();

                    if (mealRes.ok) {
                        setAssignedMeals(mealData); 
                    }
                }
            } catch (err) {
                console.error("Meal fetch error:", err);
            }
        };
        if (clientId) fetchPlanMeals();
    }, [clientId]);

    const handleLogSubmit = async (mealData, isAssigned = true) => {
        const payload = {
            client_id: clientId,
            meal_id: isAssigned ? mealData.meal_id : null,
            meal_name: isAssigned ? mealData.meal_name : customMeal.meal_name,
            calories: isAssigned ? mealData.calories : customMeal.calories,
            protein: isAssigned ? mealData.protein : customMeal.protein,
            carbs: isAssigned ? mealData.carbs : customMeal.carbs,
            fats: isAssigned ? mealData.fats : customMeal.fats,
            notes: isAssigned ? `Followed Plan: ${mealData.meal_name}` : customMeal.notes
        };

        try {
            const res = await fetch("http://127.0.0.1:5000/api/nutrition_plan/log", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                if (!isAssigned) setIsCustomMode(false);
                navigate(`/MealTrackPage/${clientId}`); 
            }
        } catch (err) {
            alert("Failed to log meal.");
        }
    };

    const deleteLogEntry = async (mealLogId, logDate) => {
        const today = new Date().toISOString().split('T')[0];

        if (logDate !== today) {
            alert("Warning: You can only modify or delete logs recorded on the current day.");
            return; 
        }

        if (window.confirm("Delete this entry to correct your log?")) {
            try {
                const response = await fetch(`http://127.0.0.1:5000/api/nutrition_plan/log/${mealLogId}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    setCalorieData(prev => prev.filter(item => item.meal_log_id !== mealLogId));
                }
            } catch (error) {
                console.error("Error deleting log:", error);
            }
        }
    };

    return (
        <div className="dashboard-container">
            <nav className="sidebar">
                <div className="brand-logo">BitFit</div>
                <ul className="nav-list">
                    <li className="nav-item" onClick={() => navigate(`/LandingPage/${clientId}`)}>Dashboard</li>
                    <li className="nav-item" onClick={() => navigate(`/MealTrackPage/${clientId}`)}>Meal Tracker</li>
                    <ul className="sub-sub-nav">
                        <li className="nav-item active">Log Today's Meals</li>
                        <li className="nav-item" onClick={() => navigate(`/EditTodaysMeal/${clientId}`)}>Edit Today's Meals</li>
                    </ul>
                    <div className="sidebar-bottom">
                        <button className="nav-item" onClick={() => navigate(`/MealTrackPage/${clientId}`)}>← Back to Tracker</button>
                    </div>
                </ul>
            </nav>

            <div className="main-content">
                <header className="header">
                    <h1 style={{ color: "#fbbf24" }}>Log Today's Intake</h1>
                    <p style={{ color: "#00ff44", fontWeight: 'bold', margin: 0 }}>{today}</p>
                    <p className="text-zinc-400">Record your meals.</p>
                </header>

                <section className="section-card mt-6">
                    <h3 style={{ color: "#00ff44", marginBottom: "20px" }}>Your Assigned Plan</h3>
                    {assignedMeals.length > 0 ? (
                        <div className="space-y-4">
                            {assignedMeals.map((meal) => (
                                <div key={meal.meal_id} className="log-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #27272a' }}>
                                    <div>
                                        <h4 style={{ margin: 0, color: "#fff" }}>{meal.meal_name}</h4>
                                        <p style={{ fontSize: "14px", color: "#a1a1aa" }}>{meal.time_of_day} | {meal.calories} calories</p>
                                        <p style={{ fontSize: "14px", color: "#a1a1aa" }}>{meal.description}</p>
                                    </div>
                                    <button className="btn-primary" onClick={() => handleLogSubmit(meal)}>Log Meal</button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-zinc-500 italic">No meals assigned for today. Use custom entry below.</p>
                    )}
                </section>

                <div className="mt-8">
                    <button
                        className="btn-secondary w-100"
                        onClick={() => setIsCustomMode(!isCustomMode)}
                        style={{ border: '1px dashed #52525b', background: 'transparent' }}
                    >
                        {isCustomMode ? "Cancel Custom Entry" : "+ Log a Custom Meal (Not on Plan)"}
                    </button>

                    {isCustomMode && (
                        <div className="section-card mt-4" style={{ backgroundColor: "#111" }}>
                            <h4 style={{ marginBottom: "15px" }}>Manual Entry</h4>
                            <div className="grid-container" style={{ display: 'grid', gap: '15px' }}>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input type="number" className="bitfit-input" placeholder="Cals" style={{ backgroundColor: "#000" }} onChange={(e) => setCustomMeal({ ...customMeal, calories: e.target.value })} />

                                </div>
                                <textarea
                                    className="bitfit-input"
                                    placeholder="Notes (e.g., custom entry, meal description)"
                                    style={{ backgroundColor: "#000", minHeight: "80px" }}
                                    onChange={(e) => setCustomMeal({ ...customMeal, notes: e.target.value })}
                                ></textarea>
                                <button
                                    className="btn-primary"
                                    style={{ backgroundColor: "#509e54", color: "#000" }}
                                    onClick={() => handleLogSubmit(customMeal, false)}
                                >
                                    Save Custom Log
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LogTodaysMeal;