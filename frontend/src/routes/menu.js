import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { FaCoins, FaGift, FaBars, FaTimes } from 'react-icons/fa';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <div className="flex flex-col md:flex-row  bg-gray-50" onClick={resetLogoutTimer}>
      {/* Mobile Menu Button */}
      <div className="md:hidden bg-white p-4 flex justify-between items-center shadow-md">
        <img src={logo} alt="LaborSync Logo" className="w-28 h-auto" />
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-gray-700 focus:outline-none"
        >
          {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* Side Panel - Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-md z-10 absolute w-full">
          <nav className="flex-grow">
            <ul className="flex flex-col py-4">
              <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => { navigate('/menu'); setMobileMenuOpen(false); }}>
                Dashboard
              </li>
              <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => { navigate('/timesheets'); setMobileMenuOpen(false); }}>
                Timesheets
              </li>
              <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => { navigate('/view-project'); setMobileMenuOpen(false); }}>
                View Project
              </li>
              <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => { navigate('/view-task'); setMobileMenuOpen(false); }}>
                View Tasks
              </li>
              <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => { navigate('/worker-rewards'); setMobileMenuOpen(false); }}>
                Rewards
              </li>
              <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => { navigate('/user-profile'); setMobileMenuOpen(false); }}>
                Worker Details
              </li>
            </ul>
          </nav>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-black mx-6 my-4 px-4 py-2 rounded hover:bg-gray-300 transition duration-200 w-auto"
          >
            Logout
          </button>
        </div>
      )}

  {/* Side Panel - Desktop */}
<div className="hidden md:flex md:flex-col md:w-1/6 bg-white shadow-md h-screen sticky top-0">
  <div className="flex flex-col h-full">
    {/* Logo Section */}
    <div className="flex items-center justify-center py-4 border-b">
      <img src={logo} alt="LaborSync Logo" className="w-36 h-auto" />
    </div>

    {/* Navigation Links - Takes remaining space */}
    <nav className="flex-grow">
      <ul className="flex flex-col py-4">
        <li className="flex items-center px-6 py-2 bg-gray-200 cursor-pointer font-medium" onClick={() => navigate('/menu')}>
          Dashboard
        </li>
        <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => navigate('/timesheets')}>
          Timesheets
        </li>
        <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => navigate('/view-project')}>
          View Project
        </li>
        <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => navigate('/view-task')}>
          View Tasks
        </li>
        <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => navigate('/worker-rewards')}>
          Rewards
        </li>
        <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => navigate('/user-profile')}>
          Worker Details
        </li>
      </ul>
    </nav>

    {/* Logout Button - Fixed at bottom */}
    <div className="mt-auto p-4">
      <button
        onClick={handleLogout}
        className="w-full bg-red-500 text-black py-2 rounded hover:bg-gray-300 transition duration-200"
      >
        Logout
      </button>
    </div>
  </div>
</div>

      {/* Main Content Area */}
      <div className="flex-grow p-4 md:p-8 flex flex-col">
        {/* Full-width Header Section */}
        <div className="bg-[#f3f8f9] p-4 md:p-6 rounded shadow-md mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="mb-4 md:mb-0">
            <h1 className="text-xl md:text-2xl font-bold mb-2 text-gray-800 font-['Poppins']">
              Hello {userProfile?.user.first_name || "Guest"},👋 Welcome,
            </h1>
            <p className="text-base md:text-lg text-gray-600 font-['Poppins']">You can Clock In/Out from here</p>
          </div>
          
          {/* Points Display */}
          <div className="bg-[#f3f8f9] p-3 md:p-4 rounded-lg shadow-md flex flex-col items-center cursor-pointer hover:shadow-lg transition-shadow duration-300 border font-['Poppins'] w-full md:w-auto">
            <div className="flex items-center mb-2">
              <FaCoins className="text-yellow-500 text-xl md:text-2xl mr-2" />
              <span className="font-bold text-gray-700 text-sm md:text-base">Your Points</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 md:gap-4 text-center w-full">
              <div className="flex flex-col items-center">
                <span className="text-xs md:text-sm text-gray-500">Total</span>
                <span className="font-bold text-sm md:text-lg">{pointsData.total_points}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs md:text-sm text-gray-500">Available</span>
                <span className="font-bold text-sm md:text-lg text-green-500">{pointsData.available_points}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs md:text-sm text-gray-500">Redeemed</span>
                <span className="font-bold text-sm md:text-lg text-blue-500">{pointsData.redeemed_points}</span>
              </div>
            </div>
            
            <button 
              onClick={() => navigate('/worker-rewards')}
              className="mt-2 md:mt-3 flex items-center justify-center bg-blue-100 text-blue-600 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm hover:bg-blue-200 transition"
            >
              <FaGift className="mr-1" /> Redeem Points
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex flex-col lg:flex-row flex-grow">
          {/* Notes Section - Hidden on small screens */}
          <div className="hidden lg:block w-full lg:w-2/3 bg-white p-4 md:p-6 rounded shadow-md mb-6 lg:mr-4">
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
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm lg:ml-5 border border-gray-200 w-full lg:w-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-800 font-['Poppins'] mb-2 md:mb-0">
                {formatDateTime(currentDateTime)}
              </h2>
              <div className="flex items-center space-x-2 pl-8">
                <span className={`h-3 w-3 rounded-full ${
                  isClockedIn ? 'bg-green-500 animate-pulse' : 'bg-gray-200'
                }`}></span>
                <span className={`text-xs md:text-sm pl-2 font-['Poppins'] ${
                  isClockedIn ? 'text-green-600' : 'text-red-500'
                }`}>
                  {isClockedIn ? 'Currently Clocked In' : 'Currently Clocked Out'}
                </span>
              </div>
            </div>

            {notification.show && (
              <Notification 
                message={notification.message} 
                onClose={closeNotification} 
                type={notification.type} 
              />
            )}

            {isClockedIn ? (
              <div className="space-y-4">
                <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                  <h3 className="font-medium text-gray-700 mb-2 font-['Poppins']">Current Shift Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <p className="text-xs md:text-sm text-gray-500 font-['Poppins']">Shift</p>
                      <p className="font-medium text-gray-800 text-sm md:text-base font-['Poppins']">{clockInDetails?.shift || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-gray-500 font-['Poppins']">Task</p>
                      <p className="font-medium text-gray-800 text-sm md:text-base font-['Poppins']">
                        {tasks.find(t => t.id === clockInDetails?.task)?.task_title || 'N/A'}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs md:text-sm text-gray-500 font-['Poppins']">Note</p>
                      <p className="font-medium text-gray-800 text-sm md:text-base font-['Poppins']">{clockInDetails?.note || 'No note provided'}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleClockOut}
                  className="w-full bg-gradient-to-r from-yellow-400 to-red-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium hover:shadow-md transition-all duration-200 text-sm md:text-base font-['Poppins']"
                >
                  Clock Out
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 font-['Poppins']">Shift</label>
                    <select
                      value={shift}
                      onChange={(e) => setShift(e.target.value)}
                      className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base font-['Poppins']"
                    >
                      <option value="" disabled>Select Shift</option>
                      <option value="morning">Morning Shift</option>
                      <option value="afternoon">Afternoon Shift</option>
                      <option value="night">Night Shift</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 font-['Poppins']">Task</label>
                    <select
                      value={selectedTask}
                      onChange={(e) => setSelectedTask(e.target.value)}
                      className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base font-['Poppins']"
                    >
                      <option value="" disabled>Select Task</option>
                      {tasks.map((task) => (
                        <option key={task.id} value={task.id}>
                          {task.task_title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 font-['Poppins']">Note</label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base font-['Poppins']"
                      placeholder="Enter a note (optional)"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
                  <button
                    onClick={handleClockIn}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium hover:shadow-md transition-all duration-200 text-sm md:text-base font-['Poppins']"
                  >
                    Clock In
                  </button>
                  <button
                    onClick={handleTakeBreak}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium hover:shadow-md transition-all duration-200 text-sm md:text-base font-['Poppins']"
                  >
                    Take Break
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Attendance History Section */}
        <div className="bg-white p-4 md:p-6 my-4 md:my-5 rounded-lg shadow-lg">
          <h2 className="text-lg md:text-xl font-medium text-gray-800 font-['Poppins'] mb-4 md:mb-6">Attendance History</h2>
          <div className="overflow-hidden border border-gray-200 rounded-lg">
            <div className="overflow-x-auto">
              <div className="relative">
                {/* Table container with fixed height and scroll */}
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-200 sticky top-0 z-10">
                      <tr>
                        <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-900 uppercase tracking-wider font-['Poppins']">Employee</th>
                        <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-900 uppercase tracking-wider font-['Poppins']">Clock-in</th>
                        <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-900 uppercase tracking-wider font-['Poppins']">Clock-out</th>
                        <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-900 uppercase tracking-wider font-['Poppins']">Status</th>
                        <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-900 uppercase tracking-wider font-['Poppins']">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {clockHistory.map((record, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-3 md:px-6 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="ml-0 md:ml-4">
                                <div className="text-xs md:text-sm font-medium text-gray-900 font-['Poppins']">{record.username}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 md:px-6 py-3 whitespace-nowrap">
                            <div className="text-xs md:text-sm text-gray-900 font-['Poppins']">{formatDateTime(record.clock_in)}</div>
                          </td>
                          <td className="px-3 md:px-6 py-3 whitespace-nowrap">
                            <div className={`text-xs md:text-sm font-['Poppins'] ${record.clock_out ? 'text-gray-900' : 'text-amber-500'}`}>
                              {record.clock_out ? formatDateTime(record.clock_out) : 'Pending'}
                            </div>
                          </td>
                          <td className="px-3 md:px-6 py-3 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full font-['Poppins']
                              ${record.clock_out ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                              {record.clock_out ? 'Completed' : 'Active'}
                            </span>
                          </td>
                          <td className="px-3 md:px-6 py-3 text-xs md:text-sm text-gray-500 max-w-xs truncate font-['Poppins']" title={record.note}>
                            {record.note || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;