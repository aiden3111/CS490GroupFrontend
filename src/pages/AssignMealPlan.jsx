import { useNavigate, useParams } from "react-router-dom";
import "./Landingcss.css";
import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import { Form, Button, Container } from "react-bootstrap";

const AssignMealPlan = () => {
    
    const { clientId } = useParams();
    const navigate = useNavigate();
    
    const [clients, setClients] = useState([]);
    const [mealPlans, setMealPlans] = useState([]);

    useEffect(() => {
        fetch(`/api/api/clients/coach/${clientId}`)
            .then(res => res.json())
            .then(data => setClients(Array.isArray(data) ? data : []))
            .catch(err => console.error("Error loading clients:", err));
            
        
        fetch(`/api/api/nutrition_plans/coach/${clientId}`)
            .then(res => res.json())
            .then(data => setMealPlans(Array.isArray(data) ? data : []))
            .catch(err => console.error("Error loading meal plans:", err));
    }, [clientId]);
    

    const formik = useFormik({
        initialValues: {
            client_id: "",
            plan_name: "", 
            meals: [
                { meal_name: "", calories: "", time_of_day: "", description: "", protein: "", carbs: "", fats: "", day_number: 1 }
            ]
        },
        onSubmit: async (values) => {
            if (!values.selectedClientId || !values.selectedMealPlanId) {
                alert("Please select both a client and a meal plan.");
                return;
            }

            try {
                
                const res = await fetch(``, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        coach_id: clientId,
                        client_id: values.selectedClientId,
                        nutrition_plan_id: values.selectedMealPlanId
                    })
                });

                if (res.ok) {
                    alert("Meal plan assigned successfully!");
                    navigate(`/LandingPage/${clientId}`);
                } else {
                    const errData = await res.json();
                    alert(`Error: ${errData.error}`);
                }
            } catch (err) {
                console.error("Assignment failed:", err);
            }
        },
    });


    useEffect(() => {
        const loggedInId = localStorage.getItem("authenticatedClientId");
        if (loggedInId !== clientId) {
          navigate(`/UserProfile/${loggedInId}`);
          return;
        }
      }, [clientId, navigate]);

    const handleLogout = () => {
    localStorage.removeItem("authenticatedClientId");
    navigate("/LoginPage/");
  };

 
//TODO: add view restriction based on roles
//TODO: this should be nutritionist only

    return (
        <div className="dashboard-container">
            <nav className="sidebar">
                <div className="brand-logo">BitFit</div>
                <ul className="nav-list">
                    <li className="nav-item" onClick={() => navigate(`/LandingPage/${clientId}`)}>Dashboard</li>
                    <li className="nav-item" onClick={() => navigate(`/MyCoach/${clientId}`)}>My Coach</li>
                    <li className="nav-item" onClick={() => navigate(`/WourkoutPlanPage/${clientId}`)}>Workout Logs</li>
                    <ul className="sub-nav">
                        <li className="nav-item" onClick={() => navigate(`/StepsTracker/${clientId}`)}>Step Tracker</li>
                        <li className="nav-item" onClick={() => navigate(`/CustomExercise/${clientId}`)}>Custom Exercise</li>
                    </ul>
                    <li className="nav-item" onClick={() => navigate(`/MealTrackPage/${clientId}`)}>Meal Tracker</li>
                    <ul className="sub-sub-nav">
                        <li className="nav-item active"> Meal Plan</li>
                    </ul>
                    <li className="nav-item" onClick={() => navigate(`/MoodTrackPage/${clientId}`)}>Mood Tracker</li>
                    <li className="nav-item" onClick={() => navigate(`/MessagingPage/${clientId}`)}>Messages</li>
                    <li className="nav-item">Subscriptions</li>
                    <li className="nav-item">Analytics</li>
                    <li className="nav-item" onClick={() => navigate(`/UserProfile/${clientId}`)}>My Profile</li>
                </ul>
                <div className="sidebar-bottom">
                    <button className="nav-item" onClickCapture={handleLogout}>Logout</button>
                </div>
            </nav>

            <div className="main-content">
                <h1>Assingn Meal Plan</h1>
                <main className="main-content">
                <Container className="mt-5">
                    <div style={{ backgroundColor: "#2a472a", padding: "30px", borderRadius: "15px", color: "white" }}>
                        <Form onSubmit={formik.handleSubmit}>
                            
                            
                            <Form.Group className="mb-4">
                                <Form.Label>Select Client</Form.Label>
                                <Form.Select 
                                    name="selectedClientId"
                                    onChange={formik.handleChange}
                                    value={formik.values.selectedClientId}
                                >
                                    <option value=""> Choose a Client </option>
                                    {clients.map(client => (
                                        <option key={client.client_id} value={client.client_id}>
                                            {client.first_name} {client.last_name} (ID: {client.client_id})
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            
                            <Form.Group className="mb-4">
                                <Form.Label>Select Meal Plan</Form.Label>
                                <Form.Select 
                                    name="selectedMealPlanId"
                                    onChange={formik.handleChange}
                                    value={formik.values.selectedMealPlanId}
                                >
                                    <option value=""> Choose a Plan </option>
                                    {mealPlans.map(plan => (
                                        <option key={plan.nutrition_plan_id} value={plan.nutrition_plan_id}>
                                            {plan.plan_name || `Plan #${plan.nutrition_plan_id}`}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            <Button variant="success" type="submit" className="w-100">
                                Assign Plan
                            </Button>
                        </Form>
                    </div>
                </Container>
            </main>
                
            </div>
        </div>
    );
};



export default AssignMealPlan;