import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import { useNavigate } from 'react-router-dom';
import { getWorkers, getManagerDashboard, getProjects, assignTask } from '../endpoints/api';
import logo from "../assets/images/LaborSynclogo.png";

const AssignTaskPage = () => {
    const { handleLogout } = useAuth();
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [workers, setWorkers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch initial data when component mounts
    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                const [dashboardData, workerList, projectsList] = await Promise.all([
                    getManagerDashboard(),
                    getWorkers(),
                    getProjects()
                ]);
                setProjects(dashboardData?.projects || projectsList || []);
                setWorkers(workerList || []);
            } catch (error) {
                console.error('Error fetching initial data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <div className="w-1/6 bg-white shadow-md flex flex-col p-4">
                <div className="flex items-center justify-center py-4 border-b">
                    <img src={logo} alt="LaborSync Logo" className="w-36 h-auto" />
                </div>
                <nav className="flex-grow">
                    <ul className="flex flex-col py-4">
                        <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => navigate('/manager-dashboard')}>
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

            {/* Main Content */}
            <main className="w-full min-h-screen py-1 md:w-2/3 lg:w-3/4">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-2xl font-bold">Task Management</h1>
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
                        >
                            Assign New Task
                        </button>
                    </div>

                    {/* Task list or other content can go here */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <p className="text-gray-600">Your tasks and assignments will appear here.</p>
                        {/* You can add task listing functionality here */}
                    </div>
                </div>

                {/* Assign Task Modal */}
                {showModal && (
                    <AssignTaskModal 
                        projects={projects}
                        workers={workers}
                        onClose={() => setShowModal(false)}
                        onTaskAssigned={() => {
                            setShowModal(false);
                            // You might want to refresh the task list here
                        }}
                    />
                )}
            </main>
        </div>
    );
};

// Separate modal component
const AssignTaskModal = ({ projects, workers, onClose, onTaskAssigned }) => {
    const [taskData, setTaskData] = useState({
        project: '',
        task_title: '',
        description: '',
        estimated_completion_datetime: '',
        assigned_shift: '',
        assigned_to: [],
    });
    const [selectedProject, setSelectedProject] = useState('');
    const [projectWorkers, setProjectWorkers] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (selectedProject) {
            const projectData = projects.find(p => p.id === parseInt(selectedProject));
            setProjectWorkers(projectData?.workers || []);
        } else {
            setProjectWorkers([]);
        }
    }, [selectedProject, projects]);

    const handleChange = (e) => {
        const { name, value, options } = e.target;

        if (name === 'project') {
            setSelectedProject(value);
            const projectName = projects.find(p => p.id === parseInt(value))?.name || '';
            setTaskData(prev => ({
                ...prev,
                project: projectName,
                assigned_to: [],
            }));
        } else if (name === 'assigned_to') {
            const selected = Array.from(options).filter(option => option.selected).map(option => option.value);
            setTaskData(prev => ({ ...prev, assigned_to: selected }));
        } else {
            setTaskData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const payload = {
                ...taskData,
                estimated_completion_datetime: new Date(taskData.estimated_completion_datetime).toISOString(),
            };

            const response = await assignTask(payload);
            
            if (response.message) {
                setTaskData({
                    project: '',
                    task_title: '',
                    description: '',
                    estimated_completion_datetime: '',
                    assigned_shift: '',
                    assigned_to: [],
                });
                
                onTaskAssigned();
            }
        } catch (error) {
            console.error('Error assigning task:', error);
            setError(error.response?.data?.message || 'Failed to assign task');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Assign Task</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Project</label>
                        <select 
                            name="project" 
                            value={selectedProject} 
                            onChange={handleChange} 
                            required 
                            className="w-full p-2 border rounded"
                        >
                            <option value="" disabled>Select a project</option>
                            {projects.map((project) => (
                                <option key={project.id} value={project.id}>{project.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Task Title</label>
                        <input 
                            type="text" 
                            name="task_title" 
                            placeholder="Task Title" 
                            value={taskData.task_title} 
                            onChange={handleChange} 
                            required 
                            className="w-full p-2 border rounded" 
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Description</label>
                        <textarea 
                            name="description" 
                            placeholder="Description" 
                            value={taskData.description} 
                            onChange={handleChange} 
                            required 
                            className="w-full p-2 border rounded"
                            rows="3"
                        ></textarea>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Estimated Completion</label>
                        <input 
                            type="datetime-local" 
                            name="estimated_completion_datetime" 
                            value={taskData.estimated_completion_datetime} 
                            onChange={handleChange} 
                            required 
                            className="w-full p-2 border rounded" 
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Assigned Shift</label>
                        <input 
                            type="text" 
                            name="assigned_shift" 
                            placeholder="Assigned Shift" 
                            value={taskData.assigned_shift} 
                            onChange={handleChange} 
                            required 
                            className="w-full p-2 border rounded" 
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2">Assign To</label>
                        <select 
                            name="assigned_to" 
                            multiple 
                            value={taskData.assigned_to} 
                            onChange={handleChange} 
                            required 
                            className="w-full p-2 border rounded min-h-[100px]"
                        >
                            {!selectedProject ? (
                                <option disabled>Select a project first</option>
                            ) : projectWorkers.length === 0 ? (
                                <option disabled>No workers in this project</option>
                            ) : (
                                projectWorkers.map((worker) => (
                                    <option key={worker} value={worker}>{worker}</option>
                                ))
                            )}
                        </select>
                        <p className="text-sm text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple workers</p>
                    </div>

                    <div className="flex justify-end space-x-4">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400" 
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600" 
                            disabled={isLoading}
                        >
                            {isLoading ? 'Assigning...' : 'Assign Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AssignTaskPage;