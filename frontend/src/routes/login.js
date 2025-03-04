import React, { useState } from 'react';
import { formButton } from '../Style/tailwindStyles';
import { useAuth } from '../context/useAuth';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/images/LaborSynclogo.png';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await loginUser(username, password);
      if (response && response.data && response.data.dashboard_type) {
        if (response.data.dashboard_type === 'Managers') {
          navigate('/manager-dashboard'); // Navigate to manager dashboard
        } else {
          navigate('/menu'); // Navigate to user dashboard
        }
      } else {
        // Handle case where dashboard_type is missing
        console.error('Dashboard type missing from login response');
        alert('Login successful, but dashboard type could not be determined.');
        navigate('/menu'); // Default to user dashboard
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleNav = () => {
    navigate('/register');
  };

  return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="flex w-full max-w-4xl items-center">
        <div className="hidden md:block w-1/2 h-full flex items-center justify-center">
          <img
            src={logo}
            alt="Logo"
            className="w-full max-w-[300px] object-contain"
          />
        </div>

        <div className="w-full md:w-1/2 px-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <h2 className="text-left text-4xl font-bold font-poppins mb-4">
              Log In
            </h2>
            <p className="text-left text-sm font-poppins text-gray-600 mb-6">
              Please enter your contact details to connect.
            </p>
            <div>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Username"
                required
              />
            </div>
            <div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Password"
                required
              />
            </div>

            <div className="text-right mb-4">
              <span
                className="text-blue-500 hover:underline cursor-pointer"
                onClick={() => navigate('/forgot-password')}
              >
                Forgot Password?
              </span>
            </div>

            <button
              type="submit"
              className={`${formButton} w-1/2 mx-auto`}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <div className="text-center mt-4">
              <span className="text-black">
                Don't have an account?{' '}
              </span>
              <span
                onClick={handleNav}
                className="cursor-pointer text-red-500 hover:underline"
              >
                Sign up
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;