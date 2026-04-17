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
    const [currentMeals, setCurrentMeals] = useState([]);

    useEffect(() => {
        fetch(`/api/api/clients/coach/${clientId}`)
            .then(res => res.json())
            .then(data => setClients(Array.isArray(data) ? data : []))
            .catch(err => console.error("Error loading clients:", err));
            
        
        fetch(`/api/api/nutrition_plan_modifications/${clientId}`) 
        .then(res => res.json())
        .then(data => {
            console.log("Plans found:", data);
            setMealPlans(Array.isArray(data) ? data : []);
        })
        .catch(err => console.error("Fetch error:", err));
    }, [clientId]);

    const handlePlanChange = (e) => {
        const planId = e.target.value;
        formik.setFieldValue("selectedMealPlanId", planId);
        if (planId) {
            fetch(`/api/nutrition_plan/${clientId}/${planId}`)
                .then(res => res.json())
                .then(data => setCurrentMeals(Array.isArray(data) ? data : []));
        }
    };

    const deleteMeal = async (mealId) => {
        const res = await fetch(`/api/nutrition_plan_modifications/${clientId}/${formik.values.selectedClientId}/${formik.values.selectedMealPlanId}/meals/${mealId}`, {
            method: 'DELETE'
        });
        if (res.ok) {
            setCurrentMeals(prev => prev.filter(m => m.meal_id !== mealId));
        }
    };
    

    const formik = useFormik({
        initialValues: {
            client_id: "",
            created_by: "", 
            category: "",
        },
        onSubmit: async (values) => {
            if (!values.selectedClientId) {
                alert("Please select both a client.");
                return;
            }

            try {
                
                const res = await fetch(`/api/api/nutrition_plan_modifications/create_plan`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        coach_id: clientId, 
                        client_id: values.selectedClientId,
                        plan_name: values.category
                        
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
                                <Form.Label>New Plan Category Name</Form.Label>
                                <Form.Control 
                                    type="text"
                                    name="category"
                                    placeholder="e.g., Maintenance"
                                    onChange={formik.handleChange}
                                    value={formik.values.category}
                                />
                            </Form.Group>
            
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
                                                {client.first_name} {client.last_name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                             <Button variant="primary" type="submit" className="w-100">
                                            Create Meal Plan
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