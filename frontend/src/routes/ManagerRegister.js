import React, { useState } from "react";
import { formInput, formButton } from "../Style/tailwindStyles"; // Adjust import based on your styles
import { useAuth } from "../context/useAuth"; // Adjust import based on your context
import logo from "../assets/images/LaborSynclogo.png"; // Import logo

const RegisterManager = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [CPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [workLocation, setWorkLocation] = useState("");

  const { registerNewManager } = useAuth(); // Use the register function from context

  const handleRegister = (e) => {
    e.preventDefault();
    registerNewManager(username, email, password, CPassword, firstName, lastName, companyName, workLocation);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-white">
      {/* Left Section for Logo */}
      <div className="w-1/3 flex flex-col items-center justify-center">
        <img src={logo} alt="LaborSync Logo" className="w-80 h-auto mb-8 ml-52" /> {/* Increased logo size */}
      </div>

      {/* Right Section for Form */}
      <div className="w-2/3 flex flex-col items-center">
        <h2 className="text-4xl font-bold mb-6">Manager Sign Up</h2> {/* Increased text size and margin */}
        <p className="text-lg text-gray-600 mb-10"> {/* Increased text size and margin */}
          Let's get you all set up so you can access your management account.
        </p>
        <form
          className="w-full max-w-lg grid grid-cols-2 gap-6" 
          onSubmit={handleRegister}
        >
          <input
            name="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            type="text"
            className={`${formInput} text-base py-3`} // Increased input fields size
            placeholder="First Name"
            required
          />
          <input
            name="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            type="text"
            className={`${formInput} text-base py-3`} // Increased input fields size
            placeholder="Last Name"
            required
          />
          <input
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            type="text"
            className={`${formInput} text-base py-3`} // Increased input fields size
            placeholder="Username"
            required
          />
          <input
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className={`${formInput} text-base py-3`} // Increased input fields size
            placeholder="Email"
            required
          />
          <input
            name="Company Name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            type="companyName"
            className={`${formInput} text-base py-3`} // Increased input fields size
            placeholder="Company Name"
            required
          />
          <input
            name="Work Location"
            value={workLocation}
            onChange={(e) => setWorkLocation(e.target.value)}
            type="workLocation"
            className={`${formInput} text-base py-3`} // Increased input fields size
            placeholder="Work Location"
            required
          />
          <input
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className={`${formInput} text-base py-3`} // Increased input fields size
            placeholder="Password"
            required
          />
          <input
            name="confirmPassword"
            value={CPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            type="password"
            className={`${formInput} text-base py-3`} // Increased input fields size
            placeholder="Confirm Password"
            required
          />
          <div className="col-span-2 text-center mt-6"> {/* Increased margin */}
            <button
              type="submit"
              className={`${formButton} w-1/2 mx-auto`}> {/* Increased button width */}
              Sign Up as Manager
            </button>
          </div>
        </form>
        <p className="mt-6 text-lg text-gray-600"> {/* Increased text size and margin */}
          Already have an account?{" "}
          <a href="/login" className="text-red-500 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegisterManager;
