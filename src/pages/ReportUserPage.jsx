import { useNavigate, useParams } from "react-router-dom";
import "./Landingcss.css";
import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import { Form, Button, Container, Table, Row, Col } from "react-bootstrap";
import Sidebar from "../components/Sidebar";

const ReportUserPage = () => {

  const { clientId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInId = localStorage.getItem("authenticatedClientId");
    if (loggedInId !== clientId) {
      navigate(`/UserProfile/${loggedInId}`);
      return;
    }
  }, [clientId, navigate]);

   
    const formik = useFormik({
      initialValues: {
        reason: "",
        details: "",
        reported_user_id: "",
        
      },
      enableReinitialize: true,
      onSubmit: async (values) => {
        try {
          const res = await fetch(`/api/reports`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              reporter_id: clientId,
              reported_user_id: values.reported_user_id,
              reason: values.reason,
              details: values.details,

            }),
          });
  
          if (res.ok) {
            alert("Reported Submited!");
            navigate(`/LandingPage/${clientId}`)
           
          }
        } catch (err) {
          console.error("Report failed:", err);
        }
      },
    });
  


  return (
    <div className="dashboard-container">
      <Sidebar activePage="profile" />

      <main className="main-content">
        <Container
          className="mt-4"
          style={{
            backgroundColor: "#2a472a",
            padding: "20px",
            color: "white",
          }}
        >
            <div>
              <h3>Writing Report </h3>
              <Form onSubmit={formik.handleSubmit}>
                <Form.Group className="mb-3">
                  
                      <Form.Label>Reported user ID</Form.Label>
                      <Form.Control
                        name="reported_user_id"
                        onChange={formik.handleChange}
                        value={formik.values.reported_user_id}
                      />
                   
                  <Row>
                    <Col>
                      <Form.Label>Reason</Form.Label>
                      <Form.Control
                        name="reason"
                        onChange={formik.handleChange}
                        value={formik.values.reason}
                      />
                    </Col>
                    <Col>
                      <Form.Label>Details</Form.Label>
                      <Form.Control
                        name="details"
                        onChange={formik.handleChange}
                        value={formik.values.details}
                      />
                    </Col>
                  </Row>
                </Form.Group>

                <Button variant="success" type="submit">
                  Submit
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
          
        </Container>
      </main>
    </div>
  );
};

export default ReportUserPage;
