import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { logout, getManagerDashboard, getWorkers, getClockHistory, getProjects, addWorkers } from '../../endpoints/api';
import logo from '../../assets/images/LaborSynclogo.png';
import Notification from "../Components/Notification";

const ManagerDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [clockHistory, setClockHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [workerEmail, setWorkerEmail] = useState("");
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [showAddWorkerPopup, setShowAddWorkerPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const popupRef = useRef(null);
  const buttonRef = useRef(null);

  const navigate = useNavigate();
  const { managerProfile,  fetchManagerProfile, } = useAuth();

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setShowAddWorkerPopup(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
        await fetchManagerProfile();
      } catch (error) {
        console.error("Error fetching manager profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [fetchManagerProfile]);

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

  const handleAddWorker = async (e) => {
    e.preventDefault();
    if (!workerEmail.trim()) {
      setNotification({
        show: true,
        message: "Please enter a valid email address",
        type: "error"
      });
      return;
    }
  
    setIsSubmitting(true);
    try {
      await addWorkers({ email: workerEmail });
      setNotification({
        show: true,
        message: "Invitation sent successfully!",
        type: "success"
      });
      setWorkerEmail("");
      setShowAddWorkerPopup(false);
      const workersData = await getWorkers();
      setWorkers(workersData);
    } catch (error) {
      setNotification({
        show: true,
        message: error.response?.data?.message || "Failed to send invitation",
        type: "error"
      });
    } finally {
      setIsSubmitting(false);
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
            Hello {managerProfile?.user.first_name || "Manager"},👋 Welcome,
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
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 relative">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Workers Information</h2>
              </div>
              <button
                ref={buttonRef}
                onClick={() => setShowAddWorkerPopup(!showAddWorkerPopup)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-150"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                <span>Add Worker</span>
              </button>
            </div>

            {/* Add Worker Popup */}
            {showAddWorkerPopup && (
              <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30 backdrop-blur-sm">
                <div
                  ref={popupRef}
                  className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-200 p-6 mx-4"
                >
                  <div className="flex items-start mb-6">
                    <div className="mr-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Invite Workers</h3>
                      <p className="text-sm text-gray-500 mt-1">Send an invitation to join your team</p>
                    </div>
                  </div>
                  
                  <form onSubmit={handleAddWorker} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={workerEmail}
                        onChange={(e) => setWorkerEmail(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="worker@gmail.com"
                      />
                    </div>

                    <div className="flex justify-end space-x-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowAddWorkerPopup(false)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          disabled={isSubmitting}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center min-w-[100px]"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Sending...
                            </>
                          ) : (
                            'Send Invite'
                          )}
                        </button>
                      </div>
                    </form>

                  {/* Footer Note with Hero Icon */}
                  <div className="mt-6 pt-5 border-t border-gray-100 flex items-start">
                    <svg className="flex-shrink-0 w-5 h-5 text-gray-400 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p className="text-xs text-gray-500">
                      The worker will receive an email with registration instructions. They'll need to register using this email address.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full min-w-max divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {workers.length > 0 ? (
                    workers.map((worker) => (
                      <tr key={worker.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{worker.user.username}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{worker.user.first_name} {worker.user.last_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{worker.user.email}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                        No team members yet
                      </td>
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

      {/* Notification */}
      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ ...notification, show: false })}
        />
      )}
    </div>
  );
};

export default ManagerDashboard;