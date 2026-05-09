import { useNavigate, useParams } from "react-router-dom";
import "./Landingcss.css";
import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import { Form, Button, Container, Table, Row, Col } from "react-bootstrap";
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

const EditMealsfromPlan = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [plans, setPlans] = useState([]);
  const [meals, setMeals] = useState([]);

  useEffect(() => {
    fetch(`/api/clients/coach/${clientId}`)
      .then((res) => res.json())
      .then((data) => setClients(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error loading clients:", err));
  }, [clientId]);

  const mealsByDay = planMeals.reduce((acc, meal) => {
    const day = meal.day_number;
    if (!acc[day]) acc[day] = [];
    acc[day].push(meal);
    return acc;
  }, {});

  const sortedDays = Object.keys(mealsByDay).sort((a, b) => a - b);

  const formik = useFormik({
    initialValues: {
      selectedClientId: "",
      selectedPlanId: "",
      meal_id: "",
      meal_name: "",
      description: "",
      calories: "",
      protein: "",
      carbs: "",
      fats: "",
      time_of_day: "",
      day_number: "",
    },
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const res = await fetch(
          `/api/nutrition_plan_modifications/${clientId}/${values.selectedClientId}/${values.selectedPlanId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              meals: [values],
            }),
          },
        );

        if (res.ok) {
          alert("Meal updated successfully!");
          fetchMeals(values.selectedPlanId);
        }
      } catch (err) {
        console.error("Update failed:", err);
      }
    },
  });

  const fetchMeals = (planId) => {
    fetch(`/api/nutrition_plan_modifications/meals/${planId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Help!");
        return res.json();
      })
      .then((data) => setMeals(data))
      .catch((err) => console.error("Error fetching meals:", err));
  };

  const handleClientChange = (e) => {
    const selectedId = e.target.value;
    formik.setFieldValue("selectedClientId", selectedId);
    setPlans([]);
    setMeals([]);
    if (selectedId) {
      fetch(`/api/nutrition_plan_modifications/${clientId}`)
        .then((res) => res.json())
        .then((data) => {
          const clientPlans = Array.isArray(data)
            ? data.filter((p) => p.client_id === selectedId)
            : [];
          setPlans(clientPlans);
        });
    }
  };

  const handlePlanChange = (e) => {
    const planId = e.target.value;
    formik.setFieldValue("selectedPlanId", planId);
    if (planId) fetchMeals(planId);
  };

  const handleEditClick = (meal) => {
    formik.setValues({
      ...formik.values,
      ...meal,
    });
  };

  const handleDeleteMeal = async (mealId) => {
    if (!window.confirm("Are you sure you want to delete this meal?")) return;

    try {
      const res = await fetch(
        `/api/nutrition_plan_modifications/${clientId}/${formik.values.selectedClientId}/${formik.values.selectedPlanId}/meals/${mealId}`,
        {
          method: "DELETE",
        },
      );

      if (res.ok) {
        alert("Meal deleted!");
        setMeals((prev) => prev.filter((m) => m.meal_id !== mealId));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  useEffect(() => {
    const loggedInId = localStorage.getItem("authenticatedClientId");
    if (loggedInId !== clientId) {
      navigate(`/UserProfile/${loggedInId}`);
    }
  }, [clientId, navigate]);

  return (
    <div className="dashboard-container">
      <Sidebar activePage="editmealsfromplan" />

      <div className="main-content">
        <h1>Edit & Delete Meals</h1>
        <Container className="mt-4">
          <div
            className="section-card mb-4"
            style={{
              backgroundColor: "#2a472a",
              padding: "20px",
              color: "white",
            }}
          >
            <Form.Group className="mb-3">
              <Form.Label>Select Client</Form.Label>
              <Form.Select
                onChange={handleClientChange}
                value={formik.values.selectedClientId}
              >
                <option value="">Choose Client</option>
                {clients.map((c) => (
                  <option key={c.client_id} value={c.client_id}>
                    {c.first_name} {c.last_name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Select Plan</Form.Label>
              <Form.Select
                onChange={handlePlanChange}
                value={formik.values.selectedPlanId}
                disabled={!formik.values.selectedClientId}
              >
                <option value="">Choose Plan</option>
                {plans.map((p) => (
                  <option key={p.nutrition_plan_id} value={p.nutrition_plan_id}>
                    {p.category}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </div>

          {sortedDayNumbers.length > 0
            ? sortedDayNumbers.map((dayNum) => (
                <div key={dayNum} className="mb-5">
                  <h3
                    style={{
                      color: "#fbbf24",
                      borderBottom: "2px solid #2a472a",
                      paddingBottom: "10px",
                      marginTop: "20px",
                    }}
                  >
                    {DAYS_OF_WEEK[dayNum]}
                  </h3>
                  <Table striped bordered hover variant="dark" responsive>
                    <thead>
                      <tr>
                        <th>Meal Name</th>
                        <th>Calories</th>
                        <th>Macros (P/C/F)</th>
                        <th>Time</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mealsByDay[dayNum].map((m) => (
                        <tr key={m.meal_id}>
                          <td>
                            <strong>{m.meal_name}</strong>
                            <br />
                            <small className="text-muted">
                              {m.description}
                            </small>
                          </td>
                          <td>{m.calories} kcal</td>
                          <td>
                            {m.protein}g / {m.carbs}g / {m.fats}g
                          </td>
                          <td>{m.time_of_day}</td>
                          <td>
                            <Button
                              variant="warning"
                              size="sm"
                              className="me-2"
                              onClick={() => handleEditClick(m)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDeleteMeal(m.meal_id)}
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ))
            : formik.values.selectedPlanId && (
                <p className="text-muted">No meals found for this plan.</p>
              )}

          {formik.values.meal_id && (
            <div
              className="section-card mt-4"
              style={{
                backgroundColor: "#1a2e1a",
                padding: "20px",
                color: "white",
              }}
            >
              <h3>Editing: {formik.values.meal_name}</h3>
              <Form onSubmit={formik.handleSubmit}>
                <Form.Group className="mb-3">
                  <Row>
                    <Col>
                      <Form.Label>Meal Name</Form.Label>
                      <Form.Control
                        name="meal_name"
                        onChange={formik.handleChange}
                        value={formik.values.meal_name}
                      />
                    </Col>
                    <Col>
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        name="meal_name"
                        onChange={formik.handleChange}
                        value={formik.values.description}
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Form.Label>Calories</Form.Label>
                      <Form.Control
                        name="meal_name"
                        onChange={formik.handleChange}
                        value={formik.values.calories}
                      />
                    </Col>
                    <Col>
                      <Form.Label>Protein</Form.Label>
                      <Form.Control
                        name="meal_name"
                        onChange={formik.handleChange}
                        value={formik.values.protein}
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Form.Label>Carbs</Form.Label>
                      <Form.Control
                        name="meal_name"
                        onChange={formik.handleChange}
                        value={formik.values.carbs}
                      />
                    </Col>
                    <Col>
                      <Form.Label>Fats</Form.Label>
                      <Form.Control
                        name="meal_name"
                        onChange={formik.handleChange}
                        value={formik.values.fats}
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Form.Group className="mb-3">
                      <Form.Label>Day of the Week (1-7)</Form.Label>
                      <Form.Control
                        type="number"
                        name="day_number"
                        min="1"
                        max="7"
                        placeholder="1=Mon, 7=Sun"
                        onChange={formik.handleChange}
                        value={formik.values.day_number}
                        onInput={(e) => {
                          if (e.target.value > 7) e.target.value = 7;
                          if (e.target.value < 0) e.target.value = 1;
                        }}
                      />
                    </Form.Group>
                    <Col>
                      <Form.Label>Time of the Day</Form.Label>
                      <Form.Control
                        name="meal_name"
                        onChange={formik.handleChange}
                        value={formik.values.time_of_day}
                      />
                    </Col>
                  </Row>
                </Form.Group>

                <Button variant="success" type="submit">
                  Save Changes
                </Button>
                <Button
                  variant="secondary"
                  className="ms-2"
                  onClick={() => formik.resetForm()}
                >
                  Cancel
                </Button>
              </Form>
            </div>
          )}
        </Container>
      </div>
    </div>
  );
};

export default EditMealsfromPlan;
