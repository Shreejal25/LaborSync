import React, { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth"; // Ensure the correct context is imported
import { useNavigate } from "react-router-dom"; // To handle navigation for sidebar
import logo from "../assets/images/LaborSynclogo.png"; // Replace with your logo path

const UserProfilePage = () => {
  const { userProfile, fetchUserProfile, updateProfile, loading, handleLogout } = useAuth();
  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    gender: "",
    current_address: "",
    permanent_address: "",
    city_town: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile(); // Fetch user profile when component mounts
  }, [fetchUserProfile]);

  useEffect(() => {
    if (!loading && userProfile) {
      // Set profile data only when userProfile is available
      setProfileData({
        username: userProfile.user.username,
        email: userProfile.user.email,
        first_name: userProfile.user.first_name,
        last_name: userProfile.user.last_name,
        phone_number: userProfile.phone_number,
        gender: userProfile.gender,
        current_address: userProfile.current_address,
        permanent_address: userProfile.permanent_address,
        city_town: userProfile.city_town,
      });
    }
  }, [loading, userProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile(profileData); // Ensure this function sends the correct structure
  };

  if (loading) {
    return <div className="text-center text-gray-600">Loading...</div>;
  }

  if (!userProfile) {
    return (
      <div className="text-center text-gray-600">
        Please log in to view and update your profile.
      </div>
    );
  }

  return (
    <div className="flex h-90 bg-gray-50">
         {/* Side Panel */}
         <div className="w-1/6 bg-white shadow-md flex flex-col p-4">
           <div className="flex items-center justify-center py-4 border-b">
             <img src={logo} alt="LaborSync Logo" className="w-36 h-auto" /> {/* Logo */}
           </div>
           <nav className="flex-grow">
             <ul className="flex flex-col py-4">
               <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => navigate('/')}>
                 Dashboard
               </li>
               <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => navigate('/schedule')}>
                  Schedule
               </li>
               <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => navigate('/timesheets')}>
                 Timesheets
               </li>
               <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => navigate('/reports')}>
                 Reports
               </li>
               <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => navigate('/rewards')}>
                  Rewards
               </li>
               <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => navigate('/user-profile')}>
                 Worker Details
               </li>
             </ul>
           </nav>
           <button
             onClick={handleLogout}
             className="bg-gray-200 text-gray-600 mx-6 my-4 px-4 py-2 rounded hover:bg-gray-300 transition duration-200"
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
              { label: "Phone Number", name: "phone_number", type: "text" },
              { label: "Gender", name: "gender", type: "text" },
              { label: "Current Address", name: "current_address", type: "text" },
              { label: "Permanent Address", name: "permanent_address", type: "text" },
              { label: "City/Town", name: "city_town", type: "text" },
            ].map(({ label, name, type, disabled }, index) => (
              <div key={index}>
                <label htmlFor={name} className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
                <input
                  type={type}
                  name={name}
                  value={profileData[name]}
                  onChange={handleChange}
                  disabled={disabled}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-md ${
                    disabled ? "bg-gray-100 cursor-not-allowed" : "focus:ring-indigo-500 focus:border-indigo-500"
                  }`}
                />
              </div>
            ))}
            <div className="flex justify-between space-x-4">
              <button
                type="button"
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                onClick={() => setProfileData(userProfile)} // Reset to original profile data
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

export default UserProfilePage;
