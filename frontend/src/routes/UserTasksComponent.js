import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/useAuth';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/images/LaborSynclogo.png';
import { logout, getProjects } from '../endpoints/api';

const UserTasksComponent = () => {
  const { userTasks, fetchUserTasks } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [tasksWithProjectNames, setTasksWithProjectNames] = useState([]);

  useEffect(() => {
    fetchUserTasks();
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsData = await getProjects();
        console.log('Fetched projects:', projectsData);
        setProjects(projectsData || []);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    console.log('User Tasks:', userTasks);
    console.log('Projects:', projects);
    if (userTasks.length > 0 && projects.length > 0) {
      const updatedTasks = userTasks.map((task) => {
        const project = projects.find((p) => p.id === task.project);
        return {
          ...task,
          projectName: project ? project.name : 'Unknown Project',
        };
      });
      console.log('Updated Tasks:', updatedTasks);
      setTasksWithProjectNames(updatedTasks);
    }
  }, [userTasks, projects]);

  const handleLogout = async () => {
    try {
      const success = await logout();
      if (success) {
        navigate('/login');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Side Panel */}
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
            <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => navigate('/view-project')}>
              View Project
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

      {/* Main Content */}
      <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 w-full">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Your Assigned Tasks</h2>

        {tasksWithProjectNames.length > 0 ? (
          tasksWithProjectNames.map((task) => (
            <div key={task.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200 w-3/4 mb-4">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">{task.task_title}</h3>
              <p className="text-sm text-gray-500 mb-4">
                <span className="font-medium text-gray-600">Project:</span> {task.projectName}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                <span className="font-medium text-gray-600">Description:</span> {task.description}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                <span className="font-medium text-gray-600">Estimated Completion:</span>{' '}
                {task.estimated_completion_datetime
                  ? new Date(task.estimated_completion_datetime).toLocaleString()
                  : 'N/A'}
              </p>
              <p className="text-sm text-gray-500">
                <span className="font-medium text-gray-600">Assigned Shift:</span> {task.assigned_shift}
              </p>
              <p className="text-sm text-gray-500">
                <span className="font-medium text-gray-600">Assigned by:</span> {task.assigned_by}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-600 text-center mt-6">No tasks assigned.</p>
        )}
      </div>
    </div>
  );
};

export default UserTasksComponent;
