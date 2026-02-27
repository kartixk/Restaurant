import React from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";

/**
 * ProtectedRoute - blocks access based on user role.
 * - Not authenticated → redirect to /login
 * - Wrong role → redirect to own dashboard
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, role } = useAuthStore();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const userRole = role?.toUpperCase();

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        // Redirect to the user's own dashboard
        if (userRole === "ADMIN") return <Navigate to="/admin" replace />;
        if (userRole === "MANAGER") return <Navigate to="/manager/dashboard" replace />;
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
