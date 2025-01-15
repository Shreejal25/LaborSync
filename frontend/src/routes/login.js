import React, { useState } from 'react';
import { formButton } from '../Style/tailwindStyles'; // Import styles
import { useAuth } from '../context/useAuth'; // Import authentication context
import { useNavigate } from 'react-router-dom'; // React Router for navigation
import logo from '../assets/images/LaborSynclogo.png'; // Import logo

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // State for loading indicator
  const navigate = useNavigate(); // Hook for navigation
  const { loginUser } = useAuth(); // Access loginUser function from Auth context

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent form reload on submit
    setLoading(true); // Start loading state

    try {
      await loginUser(username, password); // Call login function
      navigate('/'); // Navigate to dashboard after successful login
    } catch (error) {
      console.error('Login error:', error); // Log errors
      alert('Login failed. Please check your credentials.'); // Alert user of errors
    } finally {
      setLoading(false); // End loading state
    }
  };

  const handleNav = () => {
    navigate('/register'); // Navigate to register page
  };

  return (
    <div className="h-screen flex items-center justify-center bg-white"> {/* Set background to white */}
      <div className="flex w-full max-w-4xl items-center">
        {/* Logo Section */}
        <div className="hidden md:block w-1/2 h-full flex items-center justify-center">
          <img
            src={logo} // Replace with your logo path
            alt="Logo"
            className="w-full max-w-[300px] object-contain" // Ensures the logo is responsive
          />
        </div>

        {/* Login Form Section */}
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
                className="w-full p-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" // Larger padding and font size
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
                className="w-full p-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" // Larger padding and font size
                placeholder="Password"
                required
              />
            </div>

            {/* Forgot Password Link */}
            <div className="text-right mb-4">
              <span
                className="text-blue-500 hover:underline cursor-pointer"
                onClick={() => navigate('/forgot-password')} // Adjust the path as necessary
              >
                Forgot Password?
              </span>
            </div>

            <button
              type="submit"
              className={`${formButton} w-1/2 mx-auto`} // Updated styling for half-width and centered button
              disabled={loading} // Disable button while loading
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            {/* Sign Up Link */}
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
