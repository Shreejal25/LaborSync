import React, { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import logo from "../assets/images/LaborSynclogo.png";

const UserProfilePage = () => {
  const { userProfile, fetchUserProfile, updateProfile, loading, handleLogout } = useAuth();
  const [profileData, setProfileData] = useState({
    user: {
      username: "",
      email: "",
      first_name: "",
      last_name: "",
    },
    phone_number: "",
    gender: "",
    current_address: "",
    permanent_address: "",
    city_town: "",
    state_province: "",
    education_level: "",
    certifications: "",
    skills: "",
    languages_spoken: "",
    work_availability: "",
    work_schedule_preference: ""
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  useEffect(() => {
    if (!loading && userProfile) {
      console.log("userProfile data:", userProfile);
      setProfileData({
        user: {
          username: userProfile.user.username,
          email: userProfile.user.email,
          first_name: userProfile.user.first_name,
          last_name: userProfile.user.last_name,
        },
        phone_number: userProfile.phone_number,
        gender: userProfile.gender,
        current_address: userProfile.current_address,
        permanent_address: userProfile.permanent_address,
        city_town: userProfile.city_town,
        state_province: userProfile.state_province,
        education_level: userProfile.education_level,
        certifications: userProfile.certifications,
        skills: userProfile.skills,
        languages_spoken: userProfile.languages_spoken,
        work_availability: userProfile.work_availability,
        work_schedule_preference: userProfile.work_schedule_preference,
      });
    }
  }, [loading, userProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setProfileData((prevData) => {
      if (["username", "email", "first_name", "last_name"].includes(name)) {
        return {
          ...prevData,
          user: {
            ...prevData.user,
            [name]: value,
          },
        };
      } else {
        return {
          ...prevData,
          [name]: value,
        };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("profileData being sent:", profileData);
    updateProfile(profileData);
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
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/6 bg-white shadow-md flex flex-col p-4">
        <div className="flex items-center justify-center py-4 border-b">
          <img src={logo} alt="LaborSync Logo" className="w-36 h-auto" />
        </div>
        <nav className="flex-grow">
          <ul className="flex flex-col py-4">
            <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => navigate('/menu')}>
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
      <main className="w-full min-h-screen py-1 md:w-2/3 lg:w-3/4">
        <div className="p-2 md:p-4">
          <div className="w-full px-6 pb-8 mt-8 sm:max-w-xl sm:rounded-lg">
            <h2 className="pl-6 text-2xl font-bold sm:text-xl">Public Profile</h2>
            <div className="grid max-w-2xl mx-auto mt-8">
              <div className="flex flex-col items-center space-y-5 sm:flex-row sm:space-y-0">
                <img
                  className="object-cover w-40 h-40 p-1 rounded-full ring-2 ring-indigo-300"
                  src={logo}
                  alt="Profile Avatar"
                />
                <div className="flex flex-col space-y-5 sm:ml-8">
                  <button type="button" className="py-3.5 px-7 text-base font-medium text-indigo-100 bg-[#202142] rounded-lg border border-indigo-200 hover:bg-indigo-900">Change picture</button>
                  <button type="button" className="py-3.5 px-7 text-base font-medium text-indigo-900 bg-white rounded-lg border border-indigo-200 hover:bg-indigo-100 hover:text-[#202142]">Delete picture</button>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="items-center mt-8 sm:mt-14 text-[#202142]">
                {["first_name", "last_name", "email", "phone_number", "city_town","state_province","education_level","certifications", "skills", "languages_spoken", "work_availability","work_schedule_preference"].map((field, index) => (
                  <div key={index} className="mb-2 sm:mb-6 fle">
                    <label htmlFor={field} className="block mb-2 text-sm font-medium text-indigo-900">{field.replace('_', ' ').toUpperCase()}</label>
                    <input
                      type="text"
                      id={field}
                      name={field}
                      value={
                        ["username", "email", "first_name", "last_name"].includes(field)
                          ? profileData.user?.[field] || "" // Access from profileData.user
                          : profileData[field] || "" // Access normally for other fields
                      }
                      onChange={handleChange}
                      className="bg-indigo-50 border border-indigo-300 text-indigo-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                      disabled={["first_name", "last_name", "email"].includes(field)} // Disable fields
                    />
                  </div>
                ))}
                <div className="flex justify-between space-x-4">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                    onClick={() => setProfileData(userProfile)}
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
      </main>
    </div>
  );
};

export default UserProfilePage;