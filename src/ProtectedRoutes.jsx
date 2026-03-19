import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoutes({children}){
    const isAuthenticated = localStorage.getItem("authenticatedClientId");
    return isAuthenticated ? children : <Navigate to = "/LoginPage" />
};

export default ProtectedRoutes;