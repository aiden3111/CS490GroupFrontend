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
    }, [clientId]);


    const formik = useFormik({
        initialValues: {
            selectedClientId: "", 
            category: "",
        },
        onSubmit: async (values) => {
            if (!values.selectedClientId || !values.category) {
                alert("Please select a client and enter a category.");
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
                    const data = await res.json();
                    alert("Meal plan assigned successfully!");
                  
                    navigate(`/AddMealstoPlan/${clientId}`);
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


    return (
        <div className="dashboard-container">
            <nav className="sidebar">
                <div className="brand-logo">BitFit</div>
                <ul className="nav-list">
                    <li className="nav-item" onClick={() => navigate(`/LandingPage/${clientId}`)}>Dashboard</li>
                   
        
                    </ul>
                   
                    <ul className="sub-sub-nav">
                        <li className="nav-item active"> Clients Meal Plan</li>
                           <li className="nav-item active"> Assign Meal Plan </li>
                            <li className="nav-item" onClick={() => navigate(`/AddMealstoPlan/${clientId}`)}>Create Meal  </li>
                            <li className="nav-item" onClick={() => navigate(`/CustomExercise/${clientId}`)}> Delete Meal </li>
                            <li className="nav-item" onClick={() => navigate(`/EditMealsfromPlan/${clientId}`)}> Edit Meal </li>
                    </ul>

                    <li className="nav-item" onClick={() => navigate(`/MessagingPage/${clientId}`)}>Messages</li>
                    <li className="nav-item">Subscriptions</li>
               
                <div className="sidebar-bottom">
                    <button className="nav-item" onClickCapture={handleLogout}>Logout</button>
                </div>
            </nav>
            
            <div className="main-content">
                <main className="main-content">
                    <h1>Create Meal Plan</h1>
                <Container className="mt-5">
                    <div style={{ backgroundColor: "#2a472a", padding: "30px", borderRadius: "15px", color: "white" }}>
                        <Form onSubmit={formik.handleSubmit}> 
                            <Form.Group className="mb-4">
                                <Form.Label>Plan Category (e.g., Bulk, Cut, Vegan)</Form.Label>
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
                                Create Meal Plan Header
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