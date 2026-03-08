import React, { useState } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import { GoogleLogin } from '@react-oauth/google'; 

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Login attempted with:', { email, password });


  };

    const HandleGoogleLogin = (response) => {
        const googleToken = response.credential;
        fetch(`http://127.0.0.1:5000/api/google-login`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
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
    
    <Container>
        <h1 className="text-center mb-4">Login here my friend</h1>
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

            <Button variant="primary" type="submit" className="w-100">
                Login
            </Button>
        </Form>  
        <h2 className="text-center mb-4">Login with Google</h2>
        <GoogleLogin
        onSuccess={HandleGoogleLogin}
        onError={() => console.log('Login Failed')}
        />
    

    </Container>
    
  );
}

export default LoginPage;