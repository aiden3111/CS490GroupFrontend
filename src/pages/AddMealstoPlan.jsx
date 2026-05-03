import { useNavigate, useParams } from "react-router-dom";
import "./Landingcss.css";
import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import Sidebar from "../components/Sidebar";

const AddMealstoPlan = () => {
    const { clientId } = useParams(); 
    const navigate = useNavigate();
    
    
    const [clients, setClients] = useState([]);
    const [plans, setPlans] = useState([]);

  
    useEffect(() => {
        fetch(`/api/clients/coach/${clientId}`)
            .then(res => res.json())
            .then(data => setClients(Array.isArray(data) ? data : []))
            .catch(err => console.error("Error loading clients:", err));
    }, [clientId]);

   
    useEffect(() => {
        const loggedInId = localStorage.getItem("authenticatedClientId");
        if (loggedInId !== clientId) {
          navigate(`/UserProfile/${loggedInId}`);
        }
    }, [clientId, navigate]);

    const formik = useFormik({
        initialValues: {
            selectedClientId: "", 
            selectedPlanId: "",   
            meal_name: "",
            description: "",
            calories: "",
            protein: "",
            carbs: "",
            fats: "",             
            time_of_day: "",
            day_number: "",
        },
        onSubmit: async (values) => {
            if (!values.selectedPlanId) {
                alert("Please select a meal plan first.");
                return;
            }

            try {
                
                const res = await fetch(`/api/nutrition_plan_modifications/${clientId}/${values.selectedClientId}/${values.selectedPlanId}/meals`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        meals: [{
                            meal_name: values.meal_name,
                            description: values.description,
                            calories: values.calories,
                            protein: values.protein,
                            carbs: values.carbs,
                            fats: values.fats,
                            time_of_day: values.time_of_day,
                            day_number: values.day_number 
                        }]
                    })
                });

                if (res.ok) {
                    alert("Meal added to the plan!");
                    formik.resetForm({ values: { ...formik.initialValues, selectedClientId: values.selectedClientId, selectedPlanId: values.selectedPlanId } });
                } else {
                    const err = await res.json();
                    alert(`Error: ${err.error}`);
                }
            } catch (err) {
                console.error("Failed to add meal:", err);
            }
        }
    });

    
    const handleClientChange = (e) => {
        const selectedId = e.target.value;
        formik.setFieldValue("selectedClientId", selectedId);
        
        if (selectedId) {
            
            fetch(`/api/nutrition_plan_modifications/${clientId}`) 
                .then(res => res.json())
                .then(data => {
                    
                    const clientPlans = Array.isArray(data) ? data.filter(p => p.client_id === selectedId) : [];
                    setPlans(clientPlans);
                })
                .catch(err => console.error("Fetch error:", err));
        }
    };

    return (
        <div className="dashboard-container">
        <Sidebar activePage="assignmealplan" />

            <div className="main-content">
                <h1>Add Meals to Plan</h1>
                <Container className="mt-5">
                    <div style={{ backgroundColor: "#2a472a", padding: "30px", borderRadius: "15px", color: "white" }}>
                        <Form onSubmit={formik.handleSubmit}> 
                            <Form.Group className="mb-4">
                                <Form.Label>Select Client</Form.Label>
                                <Form.Select 
                                    name="selectedClientId"
                                    onChange={handleClientChange}
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

                            <Form.Group className="mb-4">
                                <Form.Label>Select Meal Plan</Form.Label>
                                <Form.Select 
                                    name="selectedPlanId"
                                    onChange={formik.handleChange}
                                    value={formik.values.selectedPlanId}
                                    disabled={!formik.values.selectedClientId}
                                >
                                    <option value=""> Choose a Plan </option>
                                    {plans.map(plan => (
                                        <option key={plan.nutrition_plan_id} value={plan.nutrition_plan_id}>
                                            Plan #{plan.nutrition_plan_id} - {plan.category}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            <hr />

                            <Form.Group className="mb-3">
                                <Form.Label>Meal Name</Form.Label>
                                <Form.Control 
                                name="meal_name" 
                                onChange={formik.handleChange} 
                                value={formik.values.meal_name} 
                                placeholder="e.g. Grilled Chicken" />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Description</Form.Label>
                                <Form.Control 
                                name="description" 
                                onChange={formik.handleChange} 
                                value={formik.values.description} />
                            </Form.Group>

                            <Row>
                                <Col>
                                <Form.Group className="mb-3 flex-fill">
                                    <Form.Label>Calories</Form.Label>
                                    <Form.Control 
                                    type="number" 
                                    name="calories" 
                                    onChange={formik.handleChange} 
                                    value={formik.values.calories} />
                                </Form.Group>
                                </Col>
                                <Col>
                                <Form.Group className="mb-3 flex-fill">
                                    <Form.Label>Protein (g)</Form.Label>
                                    <Form.Control 
                                        type="number" 
                                        name="protein" 
                                        onChange={formik.handleChange} 
                                        value={formik.values.protein} />
                                </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col>
                                <Form.Group className="mb-3 flex-fill">
                                    <Form.Label>Carbs (g)</Form.Label>
                                    <Form.Control 
                                        type="number" 
                                        name="carbs" 
                                        onChange={formik.handleChange} 
                                        value={formik.values.carbs} />
                                </Form.Group>
                                </Col>
                                <Col>
                                <Form.Group className="mb-3 flex-fill">
                                    <Form.Label>Fats (g)</Form.Label>
                                    <Form.Control 
                                        type="number" 
                                        name="fats" 
                                        onChange={formik.handleChange} 
                                        value={formik.values.fats} />
                                </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label>Time of Day</Form.Label>
                                    <Form.Control 
                                        name="time_of_day" 
                                        onChange={formik.handleChange} 
                                        value={formik.values.time_of_day} 
                                        placeholder="e.g. 10:35" />
                                </Form.Group>
                                </Col>
                                <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label>Day</Form.Label>
                                    <Form.Control 
                                        name="day_number" 
                                        onChange={formik.handleChange} 
                                        value={formik.values.day_number} 
                                        placeholder="Day" />
                                </Form.Group>
                                </Col>
                                    </Row>
                            <Button variant="primary" type="submit" className="w-100 mt-3">
                                Add Meal to Plan
                            </Button>
                        </Form>
                    </div>
                </Container>
            </div>
        </div>
    );
};

export default AddMealstoPlan;