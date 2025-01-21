import React, { useState } from 'react';
import { useAuth } from '../context/useAuth'; // Adjust path as necessary
import { useNavigate } from 'react-router-dom'; // Ensure you have this import for navigation
import logo from '../assets/images/LaborSynclogo.png'; // Import logo

const AssignTaskComponent = () => {
  const { assignTaskToUser, handleLogout } = useAuth();
  

  const [taskData, setTaskData] = useState({
    project_name: '',
    task_title: '',
    description: '',
    estimated_completion_datetime: '',
    assigned_shift: '',
    assigned_to: '', // This should be the username of the user
  });
  const navigate = useNavigate(); // Hook for navigation

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await assignTaskToUser(taskData); // Use the context function

    if (result) {
      alert('Task assigned successfully!');
      // Optionally reset form or perform other actions
      setTaskData({
        project_name: '',
        task_title: '',
        description: '',
        estimated_completion_datetime: '',
        assigned_shift: '',
        assigned_to: '',
      });
    }
  };


  return (
    <div className="flex h-screen bg-gray-50">
      {/* Side Panel */}
      <div className="w-1/6 bg-white shadow-md flex flex-col p-4">
        <div className="flex items-center justify-center py-4 border-b">
          <img src={logo} alt="LaborSync Logo" className="w-36 h-auto" /> {/* Adjust logo path */}
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
      <div className="flex-grow flex items-center justify-center bg-gray-100">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
            Assign Task
          </h2>
          <div className="mb-4">
            <input
              type="text"
              name="project_name"
              placeholder="Project Name"
              value={taskData.project_name}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <div className="mb-4">
            <input
              type="text"
              name="task_title"
              placeholder="Task Title"
              value={taskData.task_title}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <div className="mb-4">
            <textarea
              name="description"
              placeholder="Description"
              value={taskData.description}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            ></textarea>
          </div>
          <div className="mb-4">
            <input
              type="datetime-local"
              name="estimated_completion_datetime"
              value={taskData.estimated_completion_datetime}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <div className="mb-4">
            <input
              type="text"
              name="assigned_shift"
              placeholder="Assigned Shift"
              value={taskData.assigned_shift}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <div className="mb-6">
            <input
              type="text"
              name="assigned_to"
              placeholder="Assign to Username"
              value={taskData.assigned_to}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
          >
            Assign Task
          </button>
        </form>
      </div>
    </div>
  );
};

export default AssignTaskComponent;
