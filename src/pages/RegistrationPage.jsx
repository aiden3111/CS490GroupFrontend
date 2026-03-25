import React, { useState } from "react";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { GoogleLogin } from "@react-oauth/google";
import { useFormik } from "formik";
import "./Regcss.css";
import { useNavigate, Link } from "react-router-dom";


function RegistrationPage() {
  const navigate = useNavigate();
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
        .then((data) => {
          if (data.error) {
            alert(data.error);
          } else {
            console.log("Success:", data);
            navigate(`/OnboardingSurvey/${data.client_id}`);
            //navigate(`/UserProfile/${data.client_id}`);
            //navigate("/LandingPage");
          }
        })
        .catch((err) => console.error("Error:", err));
    },
    validate: (values) => {
      if (
        values.email.length === 0 ||
        values.password.length === 0 ||
        values.first_name.length === 0 ||
        values.last_name.length === 0 ||
        values.dob.length === 0 ||
        values.phone_number.length === 0 ||
        values.height.length === 0 ||
        values.weight.length === 0
      )
        return alert("All fields are required");
    },
  });
  const handleGoogleSignup = (response) => {
    const googleToken = response.credential;

    fetch("/api/api/google-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: googleToken }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data["needs registration"]) {
          formikForm.setValues({
            ...formikForm.values,
            email: data.email,
            first_name: data.first_name,
            last_name: data.last_name,
          });
          alert(
            "Google information imported! Fill in blank fields to finish.",
          );
        } else if (data.client_id) {
          navigate(`/UserProfile/${data.client_id}`);
        }
      })
      .catch((err) => console.error("Google Auth Error:", err));
  };

  return (
    <Container>
      <Row>
        <Col>
          <div className="singup-instructions">
            <h1>Join 10,0000 members reaching theis goals today</h1>
            <div className="step-list">
              <div className="step-item">
                <span className="step-num">1 - </span>
                <span className="step-text">Sign up</span>
              </div>

              <div className="step-item">
                <span className="step-num">2 - </span>
                <span className="step-text">Fill out entry survey</span>
              </div>

              <div className="step-item">
                <span className="step-num">3 - </span>
                <span className="step-text"> Start your fitness journey</span>
              </div>
            </div>
          </div>
        </Col>
        <Col>
          <div
            className="containerdiv"
            style={{
              backgroundColor: "#376337",
              padding: "20px",
              borderRadius: "15px",
            }}
          >
            <h1 className="text-center mb-4">Join here my friend</h1>

            <div className="GoogleButton">
              <h2 className="text-center mb-4">Sign up with Google</h2>
              <GoogleLogin
                onSuccess={handleGoogleSignup}
                onError={() => console.log("Login Failed")}
              />
            </div>
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
          <div
            className="text-center mt-3"
            style={{
              backgroundColor: "#385e38",
              marginBottom: 50,
            }}
          ></div>

          <div
            className="text-center mt-3"
            style={{
              backgroundColor: "#385e38",
              marginBottom: 50,
            }}
          >
            <p>
              Already have an account?
              <Link
                to="/LoginPage"
                style={{ color: "#1d271d", fontWeight: "bold" }}
              >
                Login here
              </Link>
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
//TODO: Add create account with google
//TODO: check unitos for height and weight
//TODO: Terms and conditions


export default RegistrationPage;
