import React, { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import logo from "../assets/images/LaborSynclogo.png";

const ManagerProfilePage = () => {
  const { managerProfile, fetchManagerProfile, updateManagerProfileData, loading, handleLogout } = useAuth();
  const [profileData, setProfileData] = useState({
        "user": {  // Nested user object
          "username": "...",
          "email": "...",
          "first_name": "...",
          "last_name": "..."
        },
        "company_name": "...", // Company name at the top level
        "work_location": "..."  // Work location at the top level
      
  });
  const navigate = useNavigate();

  // Fetch profile on mount
  useEffect(() => {
    fetchManagerProfile();
  }, [fetchManagerProfile]);

  // Update form data when profile loads
  useEffect(() => {
    if (!loading && managerProfile) {
      setProfileData({
        username: managerProfile.user.username,
        email: managerProfile.user.email,
        first_name: managerProfile.user.first_name,
        last_name: managerProfile.user.last_name,
        company_name: managerProfile.company_name,
        work_location: managerProfile.work_location,
      });
    }
  }, [loading, managerProfile]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const profileDataToUpdate = { // Correctly structured data
        user: {
          username: profileData.username,
          email: profileData.email,
          first_name: profileData.first_name,
          last_name: profileData.last_name,
        },
        company_name: profileData.company_name, // At the top level
        work_location: profileData.work_location, // At the top level
      };
  
      
    

    try {
      await updateManagerProfileData(profileDataToUpdate); // Pass the correct object to update
      alert("Profile updated successfully!");
      navigate('/manager-profile');  // Redirect to dashboard or any page after update
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile. Please try again.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) return <div className="text-center text-gray-600">Loading...</div>;
  if (!managerProfile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 max-w-md w-full rounded-md shadow-md">
          <p className="font-semibold text-center">
            Please log in as Manager to View.
          </p>
        </div>
      </div>
    );
  }
  

  return (
    <div className="flex h-90 bg-gray-50">
      {/* Sidebar */}
      <div className="w-1/6 bg-white shadow-md flex flex-col p-4">
        <div className="flex items-center justify-center py-4 border-b">
          <img src={logo} alt="Logo" className="w-36 h-auto" />
        </div>
        <nav className="flex-grow">
          <ul className="flex flex-col py-4">
            <li className="px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => navigate('/manager-dashboard')}>Dashboard</li>
            <li className="px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => navigate('/schedule')}>Schedule</li>
            <li className="px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => navigate('/timesheets')}>Timesheets</li>
            <li className="px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => navigate('/reports')}>Reports</li>
            <li className="px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => navigate('/rewards')}>Rewards</li>
            <li className="px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => navigate('/manager-profile')}>Worker Details</li>
          </ul>
        </nav>
        <button
          onClick={handleLogout}
          className="bg-gray-200 text-gray-600 mx-6 my-4 px-4 py-2 rounded hover:bg-gray-300"
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-grow bg-gray-50 flex items-center justify-center p-6">
        <div className="w-full max-w-xl bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Update Profile</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { label: "Username", name: "username", type: "text" },
              { label: "Email", name: "email", type: "email" },
              { label: "First Name", name: "first_name", type: "text" },
              { label: "Last Name", name: "last_name", type: "text" },
              { label: "Company Name", name: "company_name", type: "text" },
              { label: "Work Location", name: "work_location", type: "text" },
            ].map((field, index) => (
              <div key={index}>
                <label className="block text-sm font-medium text-gray-600 mb-1">{field.label}</label>
                <input
                  type={field.type}
                  name={field.name}
                  value={profileData[field.name]}
                  onChange={handleChange}
                  disabled={field.disabled}
                  className={`w-full px-4 py-2 border rounded-md ${
                    field.disabled ? "bg-gray-100 cursor-not-allowed" : "focus:ring-indigo-500 focus:border-indigo-500"
                  }`}
                />
              </div>
            ))}
            <div className="flex justify-between space-x-4">
              <button
                type="button"
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                onClick={() => setProfileData({
                  username: managerProfile.user.username,
                  email: managerProfile.user.email,
                  first_name: managerProfile.user.first_name,
                  last_name: managerProfile.user.last_name,
                  company_name: managerProfile.company_name,
                  work_location: managerProfile.work_location,
                })}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-400"
              >
                Update Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManagerProfilePage;
