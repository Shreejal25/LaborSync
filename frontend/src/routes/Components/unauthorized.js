// src/routes/Unauthorized.js

import React from 'react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/');  // Redirect to the home page or a different page
  };

  const handleLogin = () => {
    navigate('/login');  // Redirect to the login page
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <h1 className="text-3xl font-semibold text-red-600">Unauthorized Access</h1>
      <p className="mt-4 text-lg text-gray-700">You do not have permission to view this page.</p>
      <div className="mt-6 space-x-4">
        <button
          onClick={handleGoBack}
          className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
        >
          Go to Home
        </button>
        <button
          onClick={handleLogin}
          className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
