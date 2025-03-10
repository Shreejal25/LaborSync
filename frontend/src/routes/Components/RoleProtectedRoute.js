// src/components/RoleProtectedRoute.js

import React from 'react';
import { useNavigate } from 'react-router-dom';
import useRole from './userRole';

const RoleProtectedRoute = ({ role, children }) => {
  const { userRole, loading } = useRole();  // Get the user's role and loading state
  const navigate = useNavigate();

  // If the role is still loading
  if (loading) {
    return <div>Loading...</div>;
  }

  // Check if the user role matches the required role
  if (userRole !== role) {
    // Redirect to unauthorized or home page if the user role doesn't match
    navigate('/unauthorized');  // You can create an Unauthorized page for better UX
    return null;  // Don't render the protected route
  }

  return children;  // Render the protected route if the role matches
};

export default RoleProtectedRoute;
