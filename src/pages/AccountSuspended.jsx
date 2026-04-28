import React from "react";
import { useNavigate } from "react-router-dom";
import "./Landingcss.css";

const AccountSuspended = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        navigate("/LoginPage");
    };

    return (
        <div className="dashboard-container" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
            <div className="card" style={{ maxWidth: '500px', padding: '40px', borderTop: '5px solid #ef4444' }}>
                <h1 style={{ color: '#fff', marginBottom: '10px' }}>Access Restricted</h1>
                <p style={{ color: '#a1a1aa', lineHeight: '1.6' }}>
                    Your BitFit account has been disabled or suspended due to a violation of our
                    community guidelines or terms of service.
                </p>

                <div style={{ margin: '30px 0', padding: '15px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
                    <p style={{ color: '#ef4444', fontSize: '14px', margin: 0 }}>
                        <strong>Status:</strong> Suspended / Inactive
                    </p>
                </div>

                <p style={{ color: '#71717a', fontSize: '13px' }}>
                    If you believe this is a mistake, please contact our support team at
                    <br /><strong>admin@fitapp.com</strong>
                </p>

                <button
                    className="btn-primary"
                    style={{ marginTop: '20px', width: '100%', background: '#3f3f46' }}
                    onClick={handleLogout}
                >
                    Back to Login
                </button>
            </div>
        </div>
    );
};

export default AccountSuspended;