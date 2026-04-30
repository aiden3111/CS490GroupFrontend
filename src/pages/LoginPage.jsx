import React, { useState } from "react";
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

      fetch("/api/login", {
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

            // 1. Determine the correct ID (Admin or Client)
            const userId = data.admin_id || data.client_id;

            // 2. Save to localStorage using a consistent key
            localStorage.setItem("authenticatedClientId", userId);
            localStorage.setItem("userRole", data.role);
            localStorage.setItem("coachSpecialty", data.specialty);

            if (data.admin_id) {
              localStorage.setItem("adminId", data.admin_id);
            } else {
              localStorage.removeItem("adminId");
            }

            // 3. Navigate using the 'userId' variable we just created
            if (data.role === 'admin') {
              navigate(`/LandingPage/${userId}`);
            } else if (data.role === 'coach') {
              navigate(`/CoachLanding/${userId}`);
            } else {
              navigate(`/LandingPage/${userId}`);
            }
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
    fetch("/api/google-login", {
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
    <div className="login-page">
      <div className="login-box">
        <div className="login-box-top">
          <div className="login-brand">BitFit</div>

          <h1 className="login-title">Welcome back</h1>
          <p className="login-sub">Sign in to your account to continue</p>


          <form onSubmit={formikForm.handleSubmit}>
            <div className="login-field">
              <label>Email address</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formikForm.values.email}
                onChange={formikForm.handleChange}
              />
            </div>
            <div className="login-field">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formikForm.values.password}
                onChange={formikForm.handleChange}
              />
            </div>
            <button type="submit" className="login-submit-btn">Sign In</button>
          </form>

          <div className="login-divider">
            <span className="login-divider-line"></span>
            <span className="login-divider-text">or continue with</span>
            <span className="login-divider-line"></span>
          </div>

          <div className="login-google-wrap">
            <GoogleLogin
              onSuccess={HandleGoogleLogin}
              onError={() => console.log("Login failed")}
              theme="filled_black"
              size="large"
              width="348"
            />
          </div>
        </div>

        <div className="login-box-footer">
          New here?{" "}
          <Link to="/RegistrationPage">Create an account</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;