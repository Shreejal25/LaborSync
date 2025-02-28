import React, { useEffect } from 'react';
import { useAuth } from '../context/useAuth'; // Adjust path as necessary
import { useNavigate } from 'react-router-dom'; // Ensure you have this import for navigation
import logo from '../assets/images/LaborSynclogo.png'; // Import log

const UserTasksComponent = () => {
  const { userTasks, fetchUserTasks, handleLogout } = useAuth();
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    fetchUserTasks(); // Fetch tasks when component mounts
  }, [fetchUserTasks]);

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
      <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 w-full">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Your Assigned Tasks</h2>

        {userTasks && userTasks.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 px-4">
            {userTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200"
              >
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {task.task_title}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  <span className="font-medium text-gray-600">Project:</span> {task.project_name}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  <span className="font-medium text-gray-600">Description:</span> {task.description}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  <span className="font-medium text-gray-600">Estimated Completion:</span>{' '}
                  {new Date(task.estimated_completion_datetime).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  <span className="font-medium text-gray-600">Assigned Shift:</span>{' '}
                  {task.assigned_shift}
                </p>
                <p className="text-sm text-gray-500">
                  <span className="font-medium text-gray-600">Assigned by:</span>{' '}
                  {task.assigned_by}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center mt-6">No tasks assigned.</p>
        )}
      </div>
    </div>
  );
};

export default UserTasksComponent;