import React, { useState } from "react";
import { formInput, formButton, formContainer } from "../Style/tailwindStyles";
import { useAuth } from "../context/useAuth";

const Register = () => {
  // Create individual useState hooks for each form field
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [CPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const { register_user } = useAuth();

  // Handle change for each input field
  
  

  // Handle form submission
  const handleRegister = (e) => {
   
    register_user(username, email, password, CPassword, firstName, lastName);
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <div className={formContainer}>
        <form  className="space-y-4">
          <div>
            <input
              name="username"
              value={username}
              onChange={(e)=> setUsername(e.target.value)}// Add onChange to update state
              type="text"
              className={formInput}
              placeholder="Username"
            />
          </div>
          <div>
            <input
              name="email"
              value={email}
              onChange={(e)=> setEmail(e.target.value)} // Add onChange to update state
              type="email"
              className={formInput}
              placeholder="Email"
            />
          </div>
          <div>
            <input
              name="password"
              value={password}
              onChange={(e)=> setPassword(e.target.value)}// Add onChange to update state
              type="password"
              className={formInput}
              placeholder="Password"
            />
          </div>
          <div>
            <input
              name="confirmPassword"
              value={CPassword}
              onChange={(e)=> setConfirmPassword(e.target.value)} // Add onChange to update state
              type="password"
              className={formInput}
              placeholder="Confirm Password"
            />
          </div>
          <div>
            <input
              name="firstName"
              value={firstName}
              onChange={(e)=> setFirstName(e.target.value)} // Add onChange to update state
              type="text"
              className={formInput}
              placeholder="First Name"
            />
          </div>
          <div>
            <input
              name="lastName"
              value={lastName}
              onChange={(e)=> setLastName(e.target.value)} // Add onChange to update state
              type="text"
              className={formInput}
              placeholder="Last Name"
            />
          </div>
          <button type="submit" className={formButton} onClick={handleRegister}>
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
