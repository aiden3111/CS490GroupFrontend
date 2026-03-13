import React, { useState } from "react";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { GoogleLogin } from "@react-oauth/google";
import { useFormik } from "formik";
import "./Regcss.css";

function RegistrationPage() {
  const formikForm = useFormik({
    initialValues: {
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      dob: "",
      gender: "",
      phone_number: "",
      height: "",
      weight: "",
    },
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: (values) => {
      fetch("/api/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
        .then((res) => res.json())
        .then((data) => console.log("Success:", data))
        .catch((err) => console.error("Error:", err));
    },
    validate: values =>{
        if(!values.email || !values.password || !values.first_name || !values.last_name || !values.dob) {
            alert("All Fields are required.");
            return { error: "Required" };
    }
  },
  });
  return (
    <Container>
    <div style={{ backgroundColor: "#369236", minHeight: "100vh", padding: "20px",}}>
      <h1 className="text-center mb-4">Join here my friend</h1>
      <Form onSubmit={formikForm.handleSubmit}>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            name="email"
            onChange={formikForm.handleChange}
            value={formikForm.values.email}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            onChange={formikForm.handleChange}
            value={formikForm.values.password}
          />
        </Form.Group>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group className="mb-3" controlId="formBasicFName">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                name="first_name"
                onChange={formikForm.handleChange}
                value={formikForm.values.first_name}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="formBasicLName">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                name="last_name"
                onChange={formikForm.handleChange}
                value={formikForm.values.last_name}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group className="mb-3" controlId="formBasicDob">
              <Form.Label>Date of Birth</Form.Label>
              <Form.Control
                type="date"
                name="dob"
                onChange={formikForm.handleChange}
                value={formikForm.values.dob}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="formBasicGender">
              <Form.Label>Gender</Form.Label>
              <Form.Control
                type="text"
                name="gender"
                onChange={formikForm.handleChange}
                value={formikForm.values.gender}
              />
            </Form.Group>
          </Col>
        </Row>
        <Form.Group className="mb-3" controlId="formBasicPhone">
          <Form.Label>Phone Number</Form.Label>
          <Form.Control
            type="text"
            name="phone_number"
            onChange={formikForm.handleChange}
            value={formikForm.values.phone_number}
          />
        </Form.Group>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group className="mb-3" controlId="formBasicHeight">
              <Form.Label>Height</Form.Label>
              <Form.Control
                type="number"
                name="height"
                onChange={formikForm.handleChange}
                value={formikForm.values.height}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="formBasicWeight">
              <Form.Label>Weight</Form.Label>
              <Form.Control
                type="number"
                name="weight"
                onChange={formikForm.handleChange}
                value={formikForm.values.weight}
              />
            </Form.Group>
          </Col>
        </Row>

        <Button variant="primary" type="submit" className="w-100">
          Sign In
        </Button>
      </Form>
      
    </div>
    </Container>
  );
}
//TODO: Add create account with google

//TODO: Terms and conditions
//TODO: if already has account link to login page
export default RegistrationPage;
