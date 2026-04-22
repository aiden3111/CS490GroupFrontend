import React, { useState } from "react";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { GoogleLogin } from "@react-oauth/google";
import { useFormik } from "formik";
import "./Regcss.css";
import { useNavigate, Link } from "react-router-dom";

const Field = ({ label, name, type = "text", placeholder, value, onChange }) => (
  <div className="reg-field">
    <label>{label}</label>
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value || ""}
      onChange={onChange}
    />
  </div>
);
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
    <div className="reg-page">
      <div className="reg-left">
        <div className="reg-left-logo">BitFit</div>
        <h1 className="reg-left-headline">
          Join 10,000+<br />members reaching<br />their goals today
        </h1>
        <div className="reg-steps">
          {["Create your account", "Fill out your entry survey", "Start your fitness journey"].map((text, i) => (
            <div className="reg-step" key={i}>
              <div className="reg-step-num">{i + 1}</div>
              <div className="reg-step-text">{text}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="reg-right">
        <div className="reg-brand">BitFit</div>
        <h2 className="reg-title">Create an account</h2>
        <p className="reg-sub">Get started! It only takes a minute.</p>

        <div className="reg-google-wrap">
          <GoogleLogin
            onSuccess={handleGoogleSignup}
            onError={() => console.log("Signup failed")}
            theme="filled_black"
            size="large"
            width="100%"
          />
        </div>

        <div className="reg-divider">
          <span className="reg-divider-line"></span>
          <span className="reg-divider-text">or fill in your details</span>
          <span className="reg-divider-line"></span>
        </div>

        <form onSubmit={formikForm.handleSubmit}>
          <div className="reg-field-row">
            <Field label="First Name" name="first_name" placeholder="John" value={formikForm.values.first_name}
              onChange={formikForm.handleChange} />
            <Field label="Last Name" name="last_name" placeholder="Smith" value={formikForm.values.last_name}
              onChange={formikForm.handleChange} />
          </div>
          <Field label="Email" name="email" type="email" placeholder="name@example.com" value={formikForm.values.email}
            onChange={formikForm.handleChange} />
          <Field label="Password" name="password" type="password" placeholder="••••••••" value={formikForm.values.password}
            onChange={formikForm.handleChange}/>
          <div className="reg-field-row">
            <Field label="Date of Birth" name="dob" type="date" value={formikForm.values.dob}
              onChange={formikForm.handleChange} />
            <div className="reg-field">
              <label>Gender</label>
              <select name="gender" value={formikForm.values.gender} onChange={formikForm.handleChange}>
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>
          <Field label="Phone Number" name="phone_number" placeholder="+1 (555) 000-0000" value={formikForm.values.phone_number}
            onChange={formikForm.handleChange} />
          <div className="reg-field-row">
            <Field label="Height (in)" name="height" type="number" placeholder="70" value={formikForm.values.height} 
      onChange={formikForm.handleChange}/>
            <Field label="Weight (lbs)" name="weight" type="number" placeholder="160" value={formikForm.values.weight}
              onChange={formikForm.handleChange} />
          </div>

          <button type="submit" className="reg-submit-btn">Create Account</button>
        </form>

        <p className="reg-footer">
          Already have an account? <Link to="/LoginPage">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default RegistrationPage;
