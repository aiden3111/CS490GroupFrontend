import { useNavigate, useParams } from "react-router-dom";
import "./Landingcss.css";
import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const MealTrackPage = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [calorieData, setCalorieData] = useState([]);

  useEffect(() => {
    const loggedInId = localStorage.getItem("authenticatedClientId");
    if (loggedInId !== clientId) {
      navigate(`/UserProfile/${loggedInId}`);
      return;
    }
  }, [clientId, navigate]);

  useEffect(() => {
    const fetchCalorieData = async () => {
      const response = await fetch(`/api/calorie_graph/${clientId}`);
      const data = await response.json();
      const sortedData = [...data].sort(
        (a, b) => new Date(b.log_date) - new Date(a.log_date),
      );
      setCalorieData(sortedData);
    };
    fetchCalorieData();
  }, [clientId]);

   const formatListDate = (dateStr) => {
  const date = new Date(dateStr.replace(/-/g, '\/'));
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  }).replace(/,/g, ''); 
};

const formatGraphDate = (dateStr) => {
  const date = new Date(dateStr.replace(/-/g, '\/'));
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: '2-digit' 
  });
};

  return (
    <div className="dashboard-container">
      <Sidebar activePage="mealtracker" />

      <div className="main-content">
        <h1>Meal Tracker</h1>
        <div className="meal-tracker-header">
          <h2>Meal & Calories</h2>
          {calorieData.map((cal) => (
            <div key={cal.meal_log_id} className="meal-square">
             <p><strong>Date:</strong> {formatListDate(item.log_date)}</p>
              <p>Calories: {cal.actual_calories}</p>
              <p>Notes: {cal.notes}</p>
            </div>
          ))}
        </div>
        <div className="callgraph">
          <div
            className="calorie-graph"
            style={{ width: "100%", height: 300, marginTop: "20px" }}
          >
            <h3>Calorie Trends</h3>
            {calorieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[...calorieData].reverse()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="log_date"
                    tickFormatter={formatGraphDate}
                  />
                  <YAxis />
                  <Tooltip
                   labelFormatter={formatListDate}
                  />
                  <Line
                    type="monotone"
                    dataKey="actual_calories"
                    stroke="#509e54"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p>No calorie data found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealTrackPage;
