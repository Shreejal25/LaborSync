import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { logout, getManagerDashboard, getWorkers, getClockHistory } from '../endpoints/api'; // Add manager-specific API functions

import logo from '../assets/images/LaborSynclogo.png'; // Import logo

const ManagerDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [workers, setWorkers] = useState([]);  // Local state for workers
  const [clockHistory, setClockHistory] = useState([]);  // Local state for clock history
  const [loading, setLoading] = useState(true);


  const navigate = useNavigate();
  const { userProfile, fetchUserProfile} = useAuth();
  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString(); // Adjust format as needed
  };

  useEffect(() => {
  const fetchProfile = async () => {
    try {
      await fetchUserProfile(); // Fetch manager profile
      console.log("User Profile:", userProfile); // Log the user profile
    } catch (error) {
      console.error("Error fetching manager profile:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchProfile();
}, [fetchUserProfile]);



  useEffect(() => {
    const fetchData = async () => {
        try {
          const dashboardData = await getManagerDashboard();
          console.log("Dashboard Data:", dashboardData); // Log dashboard data
          setTasks(dashboardData.recent_tasks);
      
          const workersData = await getWorkers();
          console.log("Workers Data:", workersData); // Log workers data
          setWorkers(workersData);
      
          const historyData = await getClockHistory();
          console.log("Clock History Data:", historyData); // Log clock history data
          setClockHistory(historyData);
        } catch (error) {
          console.error("Error fetching manager dashboard data:", error);
        }
      };

    fetchData();
  }, []); // Only run once on component mount

  
  const handleLogout = async () => {
    try {
      const success = await logout();
      if (success) {
        navigate('/login');
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  


  return (
    <div className="flex h-screen bg-gray-50">
      {/* Side Panel */}
      <div className="w-1/6 bg-white shadow-md flex flex-col p-4">
        <div className="flex items-center justify-center py-4 border-b">
          <img src={logo} alt="LaborSync Logo" className="w-36 h-auto" /> {/* Logo */}
        </div>
        <nav className="flex-grow">
          <ul className="flex flex-col py-4">
            <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => navigate('/manager-dashboard')}>
              Dashboard
            </li>
            <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => navigate('/manage-schedule')}>
              Manage Schedule
            </li>
            <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => navigate('/assign-task')}>
              Assign Tasks
            </li>
            <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => navigate('/reports')}>
              Reports
            </li>
            <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => navigate('/manager-profile')}>
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

      {/* Main Content Area */}
      <div className="flex-grow p-8 flex flex-col">
        <div className="bg-[#F4F4F9] p-6 rounded shadow-md mb-6">
            
          <h1 className="text-2xl font-bold mb-2 text-gray-800">
            Hello {userProfile?.user.first_name || "Manager"},👋 Welcome,
          </h1>
          <p className="text-lg text-gray-600">Manage your team and tasks from here</p>
        </div>

        {/* Recent Tasks */}
<div className="bg-white p-6 rounded shadow-md mb-6">
  <h2 className="text-xl font-bold mb-4">Recent Tasks</h2>
  {tasks.length > 0 ? (
    <table className="w-full table-auto border-collapse">
      <thead>
        <tr>
          <th className="px-4 py-2 border border-gray-300">Task Title</th>
          <th className="px-4 py-2 border border-gray-300">Assigned To</th>
          <th className="px-4 py-2 border border-gray-300">Status</th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((task) => (
          <tr key={task.id}>
            <td className="px-4 py-2 border border-gray-300">{task.task_title}</td>
            <td className="px-4 py-2 border border-gray-300">{task.assigned_to}</td>
            <td className="px-4 py-2 border border-gray-300 flex items-center gap-2">
              <span
                className={`h-3 w-3 rounded-full ${
                  task.status === 'pending'
                    ? 'bg-red-500'
                    : task.status === 'in_progress'
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
              ></span>
              {task.status.replace('_', ' ').toUpperCase()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  ) : (
    <p className="text-gray-500">No tasks available</p>
  )}
</div>


        {/* Worker Details */}
        <div className="bg-white p-6 rounded shadow-md mb-6">
          <h2 className="text-xl font-bold mb-4">Worker Details</h2>
          {workers.length > 0 ? (
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr>
                <th className="px-4 py-2 border border-gray-300">UserName</th>
                  <th className="px-4 py-2 border border-gray-300">Full Name</th>
                  <th className="px-4 py-2 border border-gray-300">Email</th>
                  
                </tr>
              </thead>
              <tbody>
                {workers.map((worker) => (
                  <tr key={worker.id}>
                    <td className="px-4 py-2 border border-gray-300">{worker.user.username}</td>
                    <td className="px-4 py-2 border border-gray-300">{worker.user.first_name} {worker.user.last_name}</td>
                    <td className="px-4 py-2 border border-gray-300">{worker.user.email}</td>
                   
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500">No workers available</p>
          )}
        </div>

        {/* Clock-in/Clock-out History */}
        <div className="bg-white p-6 rounded shadow-md">
          <h2 className="text-xl font-bold mb-4">Clock-in and Clock-out History</h2>
          {clockHistory.length > 0 ? (
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr>
                  <th className="px-4 py-2 border border-gray-300">Worker</th>
                  <th className="px-4 py-2 border border-gray-300">Clock-in Time</th>
                  <th className="px-4 py-2 border border-gray-300">Clock-out Time</th>
                </tr>
              </thead>
              <tbody>
                {clockHistory.map((record) => (
                  <tr key={record.id}>
                    <td className="px-4 py-2 border border-gray-300">{record.username}</td>
                    <td className="px-4 py-2 border border-gray-300">{formatDateTime(record.clock_in)}</td>
                    <td className="px-4 py-2 border border-gray-300">{formatDateTime(record.clock_out)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500">No clock history available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
