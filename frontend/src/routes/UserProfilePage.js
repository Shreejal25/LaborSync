import React, { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth"; // Ensure the correct context is imported

const UserProfilePage = () => {
  const { userProfile, fetchUserProfile, updateProfile, loading } = useAuth();
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
    // Add other profile fields as needed
  });

  useEffect(() => {
    if (!loading && userProfile) {
      setProfileData(userProfile);
    }
  }, [loading, userProfile]);

  useEffect(() => {
    fetchUserProfile(); // Ensure the profile is fetched when the component mounts
  }, [fetchUserProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile(profileData);
  };

  if (loading) {
    return <div className="text-center text-white">Loading...</div>;
  }

  if (!userProfile) {
    return <div className="text-center text-white">Please log in to view and update your profile.</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-left">Update Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-600">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={profileData.username}
              onChange={handleChange}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-600">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={profileData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium text-gray-600">
              First Name
            </label>
            <input
              type="text"
              name="first_name"
              value={profileData.first_name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="last_name" className="block text-sm font-medium text-gray-600">
              Last Name
            </label>
            <input
              type="text"
              name="last_name"
              value={profileData.last_name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="phone_number" className="block text-sm font-medium text-gray-600">
              Phone Number
            </label>
            <input
              type="text"
              name="phone_number"
              value={profileData.phone_number}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-600">
              Gender
            </label>
            <input
              type="text"
              name="gender"
              value={profileData.gender}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="current_address" className="block text-sm font-medium text-gray-600">
              Current Address
            </label>
            <input
              type="text"
              name="current_address"
              value={profileData.current_address}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="permanent_address" className="block text-sm font-medium text-gray-600">
              Permanent Address
            </label>
            <input
              type="text"
              name="permanent_address"
              value={profileData.permanent_address}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="city_town" className="block text-sm font-medium text-gray-600">
              City/Town
            </label>
            <input
              type="text"
              name="city_town"
              value={profileData.city_town}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex justify-between space-x-4 mt-6">
            <button
              type="button"
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
            >
              Update Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfilePage;
