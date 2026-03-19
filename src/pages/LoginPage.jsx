import React, { useState } from "react";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { GoogleLogin } from "@react-oauth/google";
import { useFormik } from "formik";
import { useNavigate, Link } from "react-router-dom";
import "./Regcss.css";

function LoginPage() {
  const navigate = useNavigate();
  const formikForm = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: (values) => {
      const creds = {
        clientEmail: values.email,
        password: values.password,
      };

      fetch("/api/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(creds),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            alert(data.error);
          } else {
            console.log("Success:", data);
            localStorage.setItem("authenticatedClientId", data.client_id);
            navigate(`/LandingPage/${data.client_id}`);
            //navigate("/LandingPage");
          }
        })
        .catch((err) => console.error("Errorrrrrrr:", err));
    },
    validate: (values) => {
      if (values.email.length === 0 || values.password.length === 0) {
        alert("All Fields are required.");
        return { error: "Required" };
      }
    },
  });


  const HandleGoogleLogin = (response) => {
    const googleToken = response.credential;
    fetch("/api/api/google-login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: googleToken }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Backend Response:", data);
        if (data.client_id) {
            navigate(`/UserProfile/${data.client_id}`);
        } else if (data["needs registration"]) {
            alert("Account not found.");
            navigate("/RegistrationPage");
        }
      })
      .catch((err) => console.error("Errorrrrrrr:", err));
  };
  return (
    <Container>
      <div
        style={{
          backgroundColor: "#385e38",
          padding: "20px",
          borderRadius: "15px",
        }}
      >
        <h1 className="text-center mb-4">Login here my friend</h1>
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

          <Button variant="primary" type="submit" className="w-100">
            Login
          </Button>
        </Form>
        <h2 className="text-center mb-4">Login with Google</h2>
        <GoogleLogin
          onSuccess={HandleGoogleLogin}
          onError={() => console.log("Login Failed")}
        />
      </div>
      <div
        className="text-center mt-3"
        style={{
          backgroundColor: "#385e38",
          marginBottom: 50,
        }}
      >
        <p>
          New Here? Create an account:
          <Link
            to="/RegistrationPage"
            style={{ color: "#1d271d", fontWeight: "bold" }}
          >
            Register here
          </Link>
        </p>
      </div>
    </Container>
  );
}
export default LoginPage;
