import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Landingcss.css";
import Sidebar from "../components/Sidebar";


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
                const res = await fetch(`/api/nutrition_plan/${clientId}`);
                const plans = await res.json();

                if (res.ok && plans.length > 0) {
                    const latestPlanId = plans[plans.length - 1].nutrition_plan_id;

                    const mealRes = await fetch(`/api/nutrition_plan/${clientId}/${latestPlanId}`);
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
            const res = await fetch("/api/nutrition_plan/log", {
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
                const response = await fetch(`/api/nutrition_plan/log/${mealLogId}`, {
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
            <Sidebar activePage="logmeal" />

            <div className="main-content">
                <header className="header">
                    <h1 style={{ fontSize: "32px", fontWeight: 700, color: "#fbbf24", letterSpacing: "-0.5px" }}>Log Today's Intake</h1>
                    <p style={{ color: "#00ff44", fontSize: "15px", fontWeight: 600, marginTop: "4px" }}>{today}</p>
                    {/* <p style={{ color: "var(--text)", fontSize: "13px", marginTop: "2px" }}>Record your meals.</p> */}
                </header>

                <div className="card" style={{ gap:0}}>
                    <h3 className="card-title" style={{ color: "#00ff44", marginBottom: "16px" }}>Your Assigned Plan</h3>
                    {assignedMeals.length > 0 ? (
                        <div className="space-y-4">
                            {assignedMeals.map((meal) => (
                                <div key={meal.meal_id} className="meal-plan-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #27272a' }}>
                                    <div>
                                        <h4 className="meal-plan-name">{meal.meal_name}</h4>
                                        <p className="meal-plan-meta">{meal.time_of_day} | {meal.calories} calories</p>
                                        <p className="meal-plan-meta">{meal.description}</p>
                                    </div>
                                    <button className="meal-log-btn" onClick={() => handleLogSubmit(meal)}>Log Meal</button>
                                </div>
                            ))}
                        </div>
                    ) : (
                            <p style={{ color: "var(--muted)", fontSize: "13px" }}>No meals assigned for today. Use custom entry below.</p>
                    )}
                </div>

                <div className="mt-8">
                    <button
                        className="meal-custom-toggle"
                        onClick={() => setIsCustomMode(!isCustomMode)}
                        style={{ border: '1px dashed #52525b', background: 'transparent' }}
                    >
                        {isCustomMode ? "Cancel Custom Entry" : "+ Log a Custom Meal (Not on Plan)"}
                    </button>

                    {isCustomMode && (
                        <div className="card" style={{ gap: "12px" }}>
                            <h4 className="card-title" style={{ color: "#00ff44", marginBottom: "16px", fontWeight: 500 }}>Manual Entry</h4>
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
                                    className="meal-save-btn"
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
