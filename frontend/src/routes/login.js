import React, { useState } from 'react';
import { formInput, formButton, formContainer } from '../Style/tailwindStyles'; // Import the styles
import { useAuth } from '../context/useAuth';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Loading state
  const nav = useNavigate(); // Initialize navigate
  const { loginUser } = useAuth(); // Correct function name

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent form submission from reloading the page
    setLoading(true);
    try {
      await loginUser(username, password);
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleNav = () => {
    nav('/register/'); // Navigate to the register page
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <div className={formContainer}>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              onChange={(e) => setUsername(e.target.value)}
              value={username}
              type="text"
              id="username"
              className={formInput}
              placeholder="Username"
            />
          </div>
          <div>
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="password"
              id="password"
              className={formInput}
              placeholder="Password"
            />
          </div>
          <button type="submit" className={formButton} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
          <span onClick={handleNav} className="cursor-pointer text-blue-500">
            Don't have an account? Sign up
          </span>
        </form>
      </div>
    </div>
  );
};

export default Login;
