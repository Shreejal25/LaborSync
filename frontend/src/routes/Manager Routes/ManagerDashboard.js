import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { logout, getManagerDashboard, getWorkers, getClockHistory, getProjects } from '../../endpoints/api';
import logo from '../../assets/images/LaborSynclogo.png';

const ManagerDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [clockHistory, setClockHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);

  const navigate = useNavigate();
  const { userProfile, fetchUserProfile } = useAuth();

  const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        await fetchUserProfile();
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
        setTasks(dashboardData.recent_tasks);
        const workersData = await getWorkers();
        setWorkers(workersData);
        const historyData = await getClockHistory();
        setClockHistory(historyData);
        const projectsData = await getProjects();
        setProjects(projectsData);
      } catch (error) {
        console.error("Error fetching manager dashboard data:", error);
      }
    };
    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
      const success = await logout();
      if (success) navigate('/login');
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen font-['Poppins']">Loading...</div>;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 font-['Poppins']">
      {/* Side Panel */}
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
                className={`flex items-center px-4 md:px-6 py-2 hover:bg-gray-200 cursor-pointer transition-colors duration-200 ${window.location.pathname === item.path ? 'bg-gray-100 font-medium' : ''}`}
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

      {/* Main Content Area */}
      <div className="flex-grow p-4 md:p-8 overflow-y-auto">
        {/* Welcome Banner */}
        <div className="bg-[#F4F4F9] p-4 md:p-6 rounded shadow-md mb-6">
          <h1 className="text-xl md:text-2xl font-bold mb-2 text-gray-800">
            Hello {userProfile?.user.first_name || "Manager"},👋 Welcome,
          </h1>
          <p className="text-base md:text-lg text-gray-600">Manage your team and tasks from here</p>
        </div>

        {/* Recent Tasks */}
        <div className="bg-white p-4 md:p-6 rounded shadow-md mb-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Recent Project and Tasks</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Project Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Task Title</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Assigned Workers</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Created</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Updated</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tasks.length > 0 ? (
                  tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {projects.find(p => p.id === task.project)?.name || 'No Project'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{task.task_title}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {projects.find(p => p.id === task.project)?.workers?.join(', ') || 'Not Assigned'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {formatDateTime(projects.find(p => p.id === task.project)?.created_at)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {formatDateTime(projects.find(p => p.id === task.project)?.updated_at)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <span className={`h-3 w-3 rounded-full ${
                            task.status === 'pending' ? 'bg-red-500' :
                            task.status === 'in_progress' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}></span>
                          <span>{task.status.replace('_', ' ').toUpperCase()}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-4 py-3 text-sm text-gray-500 text-center">No tasks available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Worker Details */}
        <div className="bg-white p-4 md:p-6 rounded shadow-md mb-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Worker Details</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Username</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Full Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {workers.length > 0 ? (
                  workers.map((worker) => (
                    <tr key={worker.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">{worker.user.username}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{worker.user.first_name} {worker.user.last_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{worker.user.email}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-4 py-3 text-sm text-gray-500 text-center">No workers available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Clock-in/Clock-out History */}
        <div className="bg-white p-4 md:p-6 rounded shadow-md">
          <h2 className="text-lg md:text-xl font-bold mb-4">Clock-in/Clock-out History</h2>
          <div className="overflow-x-auto">
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full min-w-max">
                <thead>
                  <tr className="bg-gray-100 sticky top-0">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Worker</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Clock-in</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Clock-out</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {clockHistory.length > 0 ? (
                    clockHistory.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-700">{record.username}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{formatDateTime(record.clock_in)}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{formatDateTime(record.clock_out) || 'Pending'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-4 py-3 text-sm text-gray-500 text-center">No clock history available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;