import React, { useEffect, useState } from 'react';
import { logout, clockIn, clockOut, getClockHistory } from '../endpoints/api';  // Assuming getClockHistory is available to fetch clock history
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

import logo from '../assets/images/LaborSynclogo.png'; // Import logo

const UserDashboard = () => {
  const [notes, setNotes] = useState([]);
  const [note, setNote] = useState("");
  const [shift, setShift] = useState("");
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [isClockedIn, setIsClockedIn] = useState(false);  
  const [clockInDetails, setClockInDetails] = useState(null); 
  const [clockHistory, setClockHistory] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const navigate = useNavigate();
  const { userProfile, fetchUserProfile, isAuthenticated } = useAuth();
  

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        await fetchUserProfile(); // Fetch user profile when component mounts
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchProfile();
  }, [fetchUserProfile]);


  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated && !loading) {
        navigate('/menu');
      }
    };
    checkAuth();
  }, [isAuthenticated, navigate, loading]);


  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const fetchedNotes = await get_dashboard();
        setNotes(fetchedNotes);
      } catch (error) {
        console.error("Error fetching notes:", error);
      }
    };

    fetchNotes();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchClockHistory = async () => {
      try {
        const history = await getClockHistory();  // Fetch previous clock-in/out history
        setClockHistory(history);  // Set previous history to state
      } catch (error) {
        console.error("Error fetching clock history:", error);
      }
    };

    fetchClockHistory();  // Fetch clock history when the component mounts
  }, []);

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

  const handleNoteChange = (e) => {
    setNote(e.target.value);
  };

  const handleShiftChange = (e) => {
    setShift(e.target.value);
  };

  const handleClockIn = async () => {
    try {
      const response = await clockIn();
      const clockInTime = new Date(response.data.clock_in).toISOString();
      const newClockInDetails = {
        shift,
        note,
        clock_in: clockInTime,
        username: userProfile?.user.username,
      };
      setClockInDetails(newClockInDetails);
      setIsClockedIn(true);
      setClockHistory(prevHistory => [...prevHistory, newClockInDetails]);
    } catch (error) {
      console.error("Error during clock-in:", error);
    }
  };
  
  const handleClockOut = async () => {
    try {
      const response = await clockOut();
      const clockOutTime = new Date(response.data.clock_out).toISOString();
      const updatedClockHistory = clockHistory.map((record) => {
        if (record.clock_in === clockInDetails.clock_in) {
          return { ...record, clock_out: clockOutTime };
        }
        return record;
      });
      setClockHistory(updatedClockHistory);
      setIsClockedIn(false);
      setClockInDetails(null);
    } catch (error) {
      console.error("Error during clock-out:", error);
    }
  };
  
  const handleTakeBreak = () => {
    console.log("Taking a break");
  };

  const formatDateTime = (isoString) => {
    if (!isoString) {
      return 'Invalid Date';
    }
    const date = new Date(isoString);
    if (isNaN(date.getTime())) { // Check if the date is valid
      return 'Invalid Date';
    }
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
    return date.toLocaleString('en-US', options);
  };
  

  if (loading) {
    return <div>Loading...</div>; // Display loading state
  }

  

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Side Panel */}
      <div className="w-1/6 bg-white shadow-md flex flex-col p-4">
        <div className="flex items-center justify-center py-4 border-b">
          <img src={logo} alt="LaborSync Logo" className="w-36 h-auto" /> {/* Logo */}
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
            <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => navigate('/view-task')}>
              View Tasks
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

      {/* Main Content Area */}
      <div className="flex-grow p-8 flex flex-col">
        <div className="bg-[#F4F4F9] p-6 rounded shadow-md mb-6"> 
          <h1 className="text-2xl font-bold mb-2 text-gray-800">
            Hello {userProfile?.user.first_name || "Guest"},👋 Welcome,</h1>

          <p className="text-lg text-gray-600">You can Clock In/Out from here</p>
        </div>
        <div className="flex flex-grow">
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

          {/* Clock In/Out Box */}
          <div className="w-1/3 bg-white p-6 rounded shadow-md flex flex-col">
            <h2 className="text-xl font-bold mb-4">{formatDateTime(currentDateTime)}</h2>

            {isClockedIn ? (
              <div>
                <p className="font-bold mb-2 text-gray-700">Shift: {clockInDetails.shift}</p>
                <p className="font-bold mb-2 text-gray-700">Note: {clockInDetails.note}</p>
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
                  onChange={handleShiftChange}
                  className="w-full p-2 mb-4 border border-gray-300 rounded"
                >
                  <option value="" disabled>Select Shift</option>
                  <option value="morning">Morning Shift</option>
                  <option value="afternoon">Afternoon Shift</option>
                  <option value="night">Night Shift</option>
                </select>
                <textarea
                  value={note}
                  onChange={handleNoteChange}
                  className="w-full p-2 border border-gray-300 rounded mb-4"
                  placeholder="Enter a note"
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

        {/* Clock-in/Clock-out History Table */}
        <div className="bg-white p-6 rounded shadow-md">
          <h2 className="text-xl font-bold mb-4">Clock-in and Clock-out History</h2>
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr>
                <th className="px-4 py-2 border border-gray-300">Username</th>
                <th className="px-4 py-2 border border-gray-300">Clock-in Time</th>
                <th className="px-4 py-2 border border-gray-300">Clock-out Time</th>
                <th className="px-4 py-2 border border-gray-300">Note</th>
              </tr>
            </thead>
            <tbody>
              {clockHistory.map((record) => (
                <tr key={record.clock_in}>
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
  );
};

export default UserDashboard;
