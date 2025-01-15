import React, { useEffect, useState } from 'react';
import { getDashboard, logout, clockIn, clockOut } from '../endpoints/api';
import { useNavigate } from "react-router-dom";

import logo from '../assets/images/LaborSynclogo.png'; // Import logo
import UserProfilePage from './UserProfilePage';

const Menu = () => {
  const [notes, setNotes] = useState([]);
  const [note, setNote] = useState("");
  const [shift, setShift] = useState("");
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [isClockedIn, setIsClockedIn] = useState(false);  
  const [clockInDetails, setClockInDetails] = useState(null); 
  const [clockHistory, setClockHistory] = useState([]);
  const navigate = useNavigate();

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
      await clockIn();
      const clockInTime = new Date().toLocaleTimeString();
      setClockInDetails({ shift, note, clockInTime });
      setIsClockedIn(true);
    } catch (error) {
      console.error("Error during clock-in:", error);
    }
  };

  const handleClockOut = async () => {
    try {
      await clockOut();
      const clockOutTime = new Date().toLocaleTimeString();
      const clockRecord = { ...clockInDetails, clockOutTime };
      
      setClockHistory([...clockHistory, clockRecord]); 
      setIsClockedIn(false);
      setClockInDetails(null); 
    } catch (error) {
      console.error("Error during clock-out:", error);
    }
  };

  const handleTakeBreak = () => {
    console.log("Taking a break");
  };

  const formatDateTime = (date) => {
    const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true };
    return date.toLocaleDateString('en-US', options);
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

      {/* Main Content Area */}
      <div className="flex-grow p-8 flex flex-col">
        <div className="bg-[#F4F4F9] p-6 rounded shadow-md mb-6"> 
          <h1 className="text-2xl font-bold mb-2 text-gray-800">Hello John👋 Welcome,</h1>
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
                <th className="px-4 py-2 border border-gray-300">Shift</th>
                <th className="px-4 py-2 border border-gray-300">Clock-in Time</th>
                <th className="px-4 py-2 border border-gray-300">Clock-out Time</th>
                <th className="px-4 py-2 border border-gray-300">Note</th>
              </tr>
            </thead>
            <tbody>
              {clockHistory.map((record, index) => (
                <tr key={index}>
                  <td className="px-4 py-2 border border-gray-300">{record.shift}</td>
                  <td className="px-4 py-2 border border-gray-300">{record.clockInTime}</td>
                  <td className="px-4 py-2 border border-gray-300">{record.clockOutTime}</td>
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

export default Menu;
