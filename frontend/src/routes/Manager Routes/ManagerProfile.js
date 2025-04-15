import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/useAuth";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/LaborSynclogo.png";

const ManagerProfilePage = () => {
  const { managerProfile, fetchManagerProfile, updateManagerProfileData, loading, handleLogout } = useAuth();
  const [profileData, setProfileData] = useState({
    user: {
      username: "",
      email: "",
      first_name: "",
      last_name: ""
    },
    company_name: "",
    work_location: ""
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchManagerProfile();
  }, [fetchManagerProfile]);

  useEffect(() => {
    if (!loading && managerProfile) {
      setProfileData({
        user: {
          username: managerProfile.user?.username || "",
          email: managerProfile.user?.email || "",
          first_name: managerProfile.user?.first_name || "",
          last_name: managerProfile.user?.last_name || ""
        },
        company_name: managerProfile.company_name || "",
        work_location: managerProfile.work_location || ""
      });
    }
  }, [loading, managerProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        await updateManagerProfileData(profileData);
        alert("Profile updated successfully!");
    } catch (error) {
        console.error("Error updating profile:", error);
        if(error.response && error.response.data && error.response.data.user && error.response.data.user.username){
            alert(error.response.data.user.username[0]); //display the backend error.
        } else {
            alert("Error updating profile. Please try again.");
        }
    }
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('user.')) {
      const userField = name.split('.')[1];
      setProfileData(prev => ({
        ...prev,
        user: {
          ...prev.user,
          [userField]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
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
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 font-['Poppins']">
      {/* Sidebar */}
      <div className="w-full md:w-1/6 bg-white shadow-md flex flex-col">
        <div className="flex items-center justify-center py-4 border-b">
          <img src={logo} alt="LaborSync Logo" className="w-28 md:w-36 h-auto" />
        </div>
        <nav className="flex-grow overflow-y-auto">
          <ul className="flex flex-col py-4">
            {[
              { path: '/manager-dashboard', label: 'Dashboard' },
              { path: '/manage-schedule', label: 'Manage Schedule' },
              { path: '/create-project', label: 'Project' },
              { path: '/assign-task', label: 'Assign Tasks' },
              { path: '/manager-rewards', label: 'Rewards' },
              { path: '/reports', label: 'Reports' },
              { path: '/manager-profile', label: 'Worker Details' }
            ].map((item, index) => (
              <li 
                key={index}
                className={`px-4 md:px-6 py-2 hover:bg-gray-200 cursor-pointer transition-colors duration-200 ${
                  window.location.pathname === item.path ? 'bg-gray-100 font-medium' : ''
                }`}
                onClick={() => navigate(item.path)}
              >
                {item.label}
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full bg-gray-200 text-gray-600 py-2 rounded hover:bg-gray-300 transition duration-200 font-medium"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow p-6 md:p-10">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Manager Profile</h2>
            <p className="text-gray-500 mb-6">Update your personal and company information</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: "Username", name: "user.username", type: "text"},
                  { label: "Email", name: "user.email", type: "email" },
                  { label: "First Name", name: "user.first_name", type: "text" },
                  { label: "Last Name", name: "user.last_name", type: "text" },
                  { label: "Company Name", name: "company_name", type: "text" },
                  { label: "Work Location", name: "work_location", type: "text" }
                ].map((field, index) => (
                  <div key={index}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={
                        field.name.startsWith('user.') 
                          ? profileData.user[field.name.split('.')[1]]
                          : profileData[field.name]
                      }
                      onChange={handleChange}
                      disabled={field.disabled}
                      className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                        field.disabled ? "bg-gray-50 text-gray-500 cursor-not-allowed" : "hover:border-gray-400"
                      }`}
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                  onClick={() => setProfileData({
                    user: {
                      username: managerProfile.user.username,
                      email: managerProfile.user.email,
                      first_name: managerProfile.user.first_name,
                      last_name: managerProfile.user.last_name,
                    },
                    company_name: managerProfile.company_name,
                    work_location: managerProfile.work_location,
                  })}
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerProfilePage;