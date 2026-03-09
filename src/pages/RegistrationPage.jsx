import React, { useState } from "react";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { GoogleLogin } from "@react-oauth/google";
import './Regcss.css';

function RegistrationPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [phone_number, setPhoneNumber] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Login attempted with:", { email, password });
  };

  const HandleGoogleLogin = (response) => {
    const googleToken = response.credential;
    fetch(`http://127.0.0.1:5000/api/google-login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: googleToken }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Backend Response:", data);
      })
      .catch((err) => console.error("Errorrrrrrr:", err));
  };
  return (
    <div style={{ backgroundColor: '#308b1a', minHeight: '100vh', padding: '20px' }}>
    <Container>
      <h1 className="text-center mb-4">Join here my friend</h1>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group className="mb-3" controlId="formBasicFName">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="First Name"
                value={first_name}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="formBasicLName">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Last Name"
                value={last_name}
                onChange={(e) => setLastName(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group className="mb-3" controlId="formBasicDob">
              <Form.Label>Date of Birth</Form.Label>
              <Form.Control
                type="number"
                placeholder="Date of Birth"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="formBasicDob">
              <Form.Label>Gender</Form.Label>
              <Form.Control
                type="text"
                placeholder="Gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
        <Form.Group className="mb-3" controlId="formBasicPhone">
          <Form.Label>Phone Number</Form.Label>
          <Form.Control
            type="text"
            placeholder="Phone Number"
            value={phone_number}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </Form.Group>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group className="mb-3" controlId="formBasicHeight">
              <Form.Label>Height</Form.Label>
              <Form.Control
                type="number"
                placeholder="Height"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="formBasicWeight">
              <Form.Label>Weight</Form.Label>
              <Form.Control
                type="text"
                placeholder="Weight"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>

        <Button variant="primary" type="submit" className="w-100">
          Sign In
        </Button>
      </Form>
      <h2 className="text-center mb-4">Login with Google</h2>
      <GoogleLogin
        onSuccess={HandleGoogleLogin}
        onError={() => console.log("Login Failed")}
      />
    </Container>
    </div>
  );
}

export default RegistrationPage;
