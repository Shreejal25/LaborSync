import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { FaCoins, FaGift } from 'react-icons/fa';
import { useAuth } from "../context/useAuth";
import Notification from './Components/Notification';
import {
  logout,
  clockIn,
  clockOut,
  getClockHistory,
  getUserTasks,
  getUserPoints
} from '../endpoints/api';
import logo from '../assets/images/LaborSynclogo.png';
import Welcome from '../assets/images/Welcome .jpg';

const UserDashboard = () => {
  // State declarations
  const [notes, setNotes] = useState([]);
  const [note, setNote] = useState("");
  const [shift, setShift] = useState("");
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInDetails, setClockInDetails] = useState(null);
  const [clockHistory, setClockHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState("");
  const [notification, setNotification] = useState({
    message: "",
    show: false,
  });
  const [pointsData, setPointsData] = useState({
    total_points: 0,
    available_points: 0,
    redeemed_points: 0
  });

  const navigate = useNavigate();
  const { userProfile, fetchUserProfile, isAuthenticated } = useAuth();
  const logoutTimer = useRef(null);

  // Effect hooks
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await Promise.all([
          fetchUserProfile(),
          getUserTasks().then(setTasks),
          getClockHistory().then(setClockHistory),
          getUserPoints().then(setPointsData)
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [fetchUserProfile]);

  useEffect(() => {
    const checkAuth = () => {
      if (!isAuthenticated && !loading) {
        navigate('/menu');
      }
    };
    checkAuth();
  }, [isAuthenticated, navigate, loading]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      startLogoutTimer();
    }
    return () => clearTimeout(logoutTimer.current);
  }, [isAuthenticated]);

  // Timer functions
  const startLogoutTimer = () => {
    clearTimeout(logoutTimer.current);
    logoutTimer.current = setTimeout(async () => {
      try {
        await logout();
        navigate('/login');
      } catch (error) {
        console.error("Error during auto-logout:", error);
      }
    }, 5 * 60 * 1000);
  };

  const resetLogoutTimer = () => {
    if (isAuthenticated) {
      startLogoutTimer();
    }
  };

  // Handler functions
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleClockIn = async () => {
    if (!selectedTask) {
      setNotification({
        message: "Please select a task before clocking in.",
        show: true,
        type: "error",
      });
      setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 5000);
      return;
    }

    try {
      const response = await clockIn(selectedTask);
      const newClockInDetails = {
        shift,
        note,
        clock_in: new Date(response.data.clock_in).toISOString(),
        username: userProfile?.user.username,
        task: response.data.task,
      };
      
      setClockInDetails(newClockInDetails);
      setIsClockedIn(true);
      setClockHistory(prev => [...prev, newClockInDetails]);
      resetLogoutTimer();
    } catch (error) {
      console.error("Error during clock-in:", error);
    }
  };

  const handleClockOut = async () => {
    try {
      await clockOut(selectedTask);
      setIsClockedIn(false);
      setClockInDetails(null);
      const fetchedHistory = await getClockHistory();
      setClockHistory(fetchedHistory);
      resetLogoutTimer();
      
      setNotification({
        message: "Clocked out successfully",
        show: true,
        type: "success"
      });
      setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 5000);
    } catch (error) {
      console.error("Error during clock-out:", error);
      setNotification({
        message: "Error during clock-out",
        show: true,
        type: "error"
      });
      setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 5000);
    }
  };

  const handleTakeBreak = () => {
    console.log("Taking a break");
    resetLogoutTimer();
  };

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  // Utility functions
  const formatDateTime = (isoString) => {
    if (!isoString) return 'Invalid Date';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: 'numeric', 
      hour12: true 
    };
    return date.toLocaleString('en-US', options);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50" onClick={resetLogoutTimer}>
      {/* Side Panel */}
      <div className="w-1/6 bg-white shadow-md flex flex-col p-4">
        <div className="flex items-center justify-center py-4 border-b">
          <img src={logo} alt="LaborSync Logo" className="w-36 h-auto" />
        </div>
        <nav className="flex-grow">
          <ul className="flex flex-col py-4">
            {[
              { path: '/menu', label: 'Dashboard' },
              { path: '/schedule', label: 'Schedule' },
              { path: '/timesheets', label: 'Timesheets' },
              { path: '/view-project', label: 'View Project' },
              { path: '/view-task', label: 'View Tasks' },
              { path: '/reports', label: 'Reports' },
              { path: '/rewards', label: 'Rewards' },
              { path: '/user-profile', label: 'Worker Details' }
            ].map((item) => (
              <li
                key={item.path}
                className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer"
                onClick={() => navigate(item.path)}
              >
                {item.label}
              </li>
            ))}
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
        {/* Full-width Header Section */}
        <div className="bg-[#f3f8f9] p-6 rounded shadow-md mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2 text-gray-800">
              Hello {userProfile?.user.first_name || "Guest"},👋 Welcome,
             
            </h1>
            
            <p className="text-lg text-gray-600">You can Clock In/Out from here</p>
            
          </div>
          
          {/* Points Display - now positioned to the right within the header */}
          <div className="bg-[#f3f8f9] p-4 rounded-lg shadow-md flex flex-col items-center cursor-pointer hover:shadow-lg transition-shadow duration-300 border">
            <div className="flex items-center mb-2">
              <FaCoins className="text-yellow-500 text-2xl mr-2" />
              <span className="font-bold text-gray-700">Your Points</span>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center">
                <span className="text-sm text-gray-500">Total</span>
                <span className="font-bold text-lg">{pointsData.total_points}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-sm text-gray-500">Available</span>
                <span className="font-bold text-lg text-green-500">{pointsData.available_points}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-sm text-gray-500">Redeemed</span>
                <span className="font-bold text-lg text-blue-500">{pointsData.redeemed_points}</span>
              </div>
            </div>
            
            <button 
              onClick={() => navigate('/rewards')}
              className="mt-3 flex items-center justify-center bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm hover:bg-blue-200 transition"
            >
              <FaGift className="mr-1" /> Redeem Points
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex flex-grow">
          {/* Notes Section */}
          <div className="w-2/3 bg-white p-6 rounded shadow-md mb-6 mr-4">
            {notes.length > 0 ? (
              notes.map((note, index) => (
                <p key={index} className="text-gray-800 border-b py-2">
                  {note.description}
                </p>
              ))
            ) : (
              <p className="text-gray-500">No notes available</p>
            )}
          </div>

          {/* Clock In/Out Section */}
          <div className="w-1/3 bg-white p-6 rounded shadow-md flex flex-col">
            <h2 className="text-xl font-bold mb-4">{formatDateTime(currentDateTime)}</h2>
            {notification.show && (
              <Notification 
                message={notification.message} 
                onClose={closeNotification} 
                type={notification.type} 
              />
            )}

            {isClockedIn ? (
              <div>
                <p className="font-bold mb-2 text-gray-700">Shift: {clockInDetails?.shift}</p>
                <p className="font-bold mb-2 text-gray-700">Note: {clockInDetails?.note}</p>
                <button
                  onClick={handleClockOut}
                  className="bg-yellow-200 text-gray-700 w-full px-6 py-2 mb-4 rounded hover:bg-yellow-300 transition duration-200"
                >
                  Clock Out
                </button>
              </div>
            ) : (
              <div>
                <select
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                  className="w-full p-2 mb-4 border border-gray-300 rounded"
                >
                  <option value="" disabled>Select Shift</option>
                  <option value="morning">Morning Shift</option>
                  <option value="afternoon">Afternoon Shift</option>
                  <option value="night">Night Shift</option>
                </select>

                <select
                  value={selectedTask}
                  onChange={(e) => setSelectedTask(e.target.value)}
                  className="w-full p-2 mb-4 border border-gray-300 rounded"
                >
                  <option value="" disabled>Select Task</option>
                  {tasks.map((task) => (
                    <option key={task.id} value={task.id}>
                      {task.task_title}
                    </option>
                  ))}
                </select>

                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded mb-4"
                  placeholder="Enter a note"
                  rows={3}
                />

                <button
                  onClick={handleClockIn}
                  className="bg-green-200 text-gray-700 w-full px-6 py-2 mb-4 rounded hover:bg-green-300 transition duration-200"
                >
                  Clock In
                </button>
                <button
                  onClick={handleTakeBreak}
                  className="bg-blue-200 text-gray-700 w-full px-6 py-2 mb-4 rounded hover:bg-blue-300 transition duration-200"
                >
                  Take a Break
                </button>
              </div>
            )}
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white p-6 rounded shadow-md">
          <h2 className="text-xl font-bold mb-4">Clock-in and Clock-out History</h2>
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 border border-gray-300">Username</th>
                  <th className="px-4 py-2 border border-gray-300">Clock-in Time</th>
                  <th className="px-4 py-2 border border-gray-300">Clock-out Time</th>
                  <th className="px-4 py-2 border border-gray-300">Note</th>
                </tr>
              </thead>
              <tbody>
                {clockHistory.map((record, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-2 border border-gray-300">{record.username}</td>
                    <td className="px-4 py-2 border border-gray-300">{formatDateTime(record.clock_in)}</td>
                    <td className="px-4 py-2 border border-gray-300">
                      {record.clock_out ? formatDateTime(record.clock_out) : 'Pending'}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">{record.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;