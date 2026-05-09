import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Landingcss.css";
import Sidebar from "../components/Sidebar";

const DAYS_OF_WEEK = {
  1: "Sunday",
  2: "Monday",
  3: "Tuesday",
  4: "Wednesday",
  5: "Thursday",
  6: "Friday",
  7: "Saturday",
};
const LogTodaysMeal = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [assignedMeals, setAssignedMeals] = useState([]);

  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customMeal, setCustomMeal] = useState({
    meal_name: "",
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
    notes: "",
    description: "",
  });

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch(`/api/nutrition_plan/${clientId}`);
        const data = await res.json();
        if (res.ok) {
          setPlans(data);

          if (data.length > 0) setSelectedPlanId(data[0].nutrition_plan_id);
        }
      } catch (err) {
        console.error("Errors fetching plans:", err);
      }
    };
    fetchPlans();
  }, [clientId]);

  useEffect(() => {
    const fetchMeals = async () => {
      if (!selectedPlanId) return;
      try {
        const res = await fetch(
         `/api/nutrition_plan_modifications/meals/${selectedPlanId}`,
        );
        const data = await res.json();
        setAssignedMeals(res.ok ? data : []);
      } catch (err) {
        setAssignedMeals([]);
      }
    };
    fetchMeals();
  }, [clientId, selectedPlanId]);

  const handleLogSubmit = async (mealData, isAssigned = true) => {
    const payload = {
      client_id: clientId,
      meal_id: isAssigned ? mealData.meal_id : null,
      meal_name: isAssigned ? mealData.meal_name : customMeal.meal_name,
      calories: isAssigned ? mealData.calories : customMeal.calories,
      protein: isAssigned ? mealData.protein : customMeal.protein,
      carbs: isAssigned ? mealData.carbs : customMeal.carbs,
      fats: isAssigned ? mealData.fats : customMeal.fats,
      notes: isAssigned
        ? `Followed Plan: ${mealData.meal_name}`
        : customMeal.notes,
    };

    try {
      const res = await fetch("/api/nutrition_plan/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
    const today = new Date().toISOString().split("T")[0];

    if (logDate !== today) {
      alert(
        "Warning: You can only modify or delete logs recorded on the current day.",
      );
      return;
    }

    if (window.confirm("Delete this entry to correct your log?")) {
      try {
        const response = await fetch(`/api/nutrition_plan/log/${mealLogId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setCalorieData((prev) =>
            prev.filter((item) => item.meal_log_id !== mealLogId),
          );
        }
      } catch (error) {
        console.error("Error deleting log:", error);
      }
    }
  };

  const mealsByDay = assignedMeals.reduce((acc, meal) => {
  const day = meal.day_number;
  if (!acc[day]) acc[day] = [];
  acc[day].push(meal);
  return acc;
}, {});


const sortedDayNumbers = Object.keys(mealsByDay).sort((a, b) => a - b);

 return (
    <div className="dashboard-container">
      <Sidebar activePage="logmeal" />

      <div className="main-content">
        <header className="header">
          <h1 style={{ fontSize: "32px", fontWeight: 700, color: "#fbbf24", letterSpacing: "-0.5px" }}>
            Log Today's Intake
          </h1>
          <p style={{ color: "#00ff44", fontSize: "15px", fontWeight: 600, marginTop: "4px" }}>
            {today}
          </p>
        </header>

        {/* Dropdown menu is client have more than one plan */}
        {plans.length > 0 && (
          <div className="card" style={{ marginBottom: "20px" }}>
            <label style={{ color: "#fbbf24", marginBottom: "8px", display: "block" }}>
              Select Nutrition Plan:
            </label>
            <select
              className="bitfit-input"
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              style={{ backgroundColor: "#18181b", color: "white" }}
            >
              {plans.map((plan) => (
                <option key={plan.nutrition_plan_id} value={plan.nutrition_plan_id}>
                  {plan.category} (Created by: {plan.created_by})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* testing the day separation*/}
        <div className="card" style={{ gap: "20px" }}>
          <h3 className="card-title" style={{ color: "#1b9d3e", marginBottom: "16px" }}>
            Weekly Nutrition Plan
          </h3>

          {sortedDayNumbers.length > 0 ? (
            sortedDayNumbers.map((dayNum) => (
              <div key={dayNum} className="day-section" style={{ marginBottom: "25px" }}>
                <p style={{ color: "#91a942", borderBottom: "1px solid #3f3f46", paddingBottom: "5px", marginBottom: "5px" }}>
                  {DAYS_OF_WEEK[dayNum]}
                </p>

                <div className="space-y-4">
                  {mealsByDay[dayNum].map((meal) => (
                    <div
                      key={meal.meal_id}
                      className="meal-plan-row"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px",
                        backgroundColor: "#18181b",
                        borderRadius: "8px",
                        marginBottom: "10px",
                        border: "1px solid #27272a"
                      }}
                    >
                      <div>
                        <h5 style={{ margin: 0, color: "white", fontSize: "16px" }}>{meal.meal_name}</h5>
                        <p style={{ fontSize: "12px", color: "#a1a1aa", margin: "4px 0" }}>
                          {meal.time_of_day} | {meal.calories} kcal
                        </p>
                        <p style={{ fontSize: "11px", color: "#71717a", margin: 0 }}>{meal.description}</p>
                      </div>
                      <button className="meal-log-btn" onClick={() => handleLogSubmit(meal)}>
                        Log Meal
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: "var(--muted)", fontSize: "13px" }}>
              No meals assigned to this plan.
            </p>
          )}
        </div>

        <div className="mt-8">
          <button
            className="meal-custom-toggle"
            onClick={() => setIsCustomMode(!isCustomMode)}
            style={{ border: "1px dashed #52525b", background: "transparent" }}
          >
            {isCustomMode
              ? "Cancel Custom Entry"
              : "+ Log a Custom Meal (Not on Plan)"}
          </button>

          {isCustomMode && (
            <div className="card" style={{ gap: "12px" }}>
              <h4
                className="card-title"
                style={{
                  color: "#00ff44",
                  marginBottom: "16px",
                  fontWeight: 500,
                }}
              >
                Manual Entry
              </h4>
              <div
                className="grid-container"
                style={{ display: "grid", gap: "15px" }}
              >
                <div style={{ display: "flex", gap: "10px" }}>
                  <input
                    type="number"
                    className="bitfit-input"
                    placeholder="Cals"
                    style={{ backgroundColor: "#000" }}
                    onChange={(e) =>
                      setCustomMeal({ ...customMeal, calories: e.target.value })
                    }
                  />
                </div>
                <textarea
                  className="bitfit-input"
                  placeholder="Notes (e.g., custom entry, meal description)"
                  style={{ backgroundColor: "#000", minHeight: "80px" }}
                  onChange={(e) =>
                    setCustomMeal({ ...customMeal, notes: e.target.value })
                  }
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
