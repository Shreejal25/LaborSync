import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import { useNavigate } from 'react-router-dom';
import { getWorkers, getManagerDashboard } from '../../endpoints/api';
import logo from "../../assets/images/LaborSynclogo.png";

const CreateProjectPage = () => {
    const { createNewProject, handleLogout } = useAuth();
    const [workers, setWorkers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchWorkers = async () => {
            try {
                const workerList = await getWorkers();
                if (workerList) {
                    setWorkers(workerList);
                }
            } catch (error) {
                console.error('Error fetching workers:', error);
            }
        };
        fetchWorkers();
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
                        <h1 className="text-2xl font-bold">Project Management</h1>
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
                        >
                            Create New Project
                        </button>
                    </div>

                    {/* Project list or other content can go here */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <p className="text-gray-600">Your projects will appear here.</p>
                        {/* You can add project listing functionality here */}
                    </div>
                </div>

                {/* Create Project Modal */}
                {showModal && (
                    <CreateProjectModal 
                        workers={workers}
                        onClose={() => setShowModal(false)}
                        onProjectCreated={() => {
                            setShowModal(false);
                            // You might want to refresh the project list here
                        }}
                    />
                )}
            </main>
        </div>
    );
};

// Separate modal component
const CreateProjectModal = ({ workers, onClose, onProjectCreated }) => {
    const { createNewProject } = useAuth();
    const [newProjectData, setNewProjectData] = useState({
        name: '',
        workers: [],
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === 'workers') {
            const selectedWorkers = [...newProjectData.workers];
            if (checked) {
                selectedWorkers.push(value);
            } else {
                const index = selectedWorkers.indexOf(value);
                if (index > -1) {
                    selectedWorkers.splice(index, 1);
                }
            }
            setNewProjectData(prev => ({
                ...prev,
                workers: selectedWorkers,
            }));
        } else if (name === 'name') {
            setNewProjectData(prev => ({
                ...prev,
                name: value,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await createNewProject(newProjectData);
        if (result) {
            setNewProjectData({ name: '', workers: [] });
            const dashboardData = await getManagerDashboard();
            onProjectCreated(dashboardData.projects);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Create Project</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Project Name</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Project Name"
                            value={newProjectData.name}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2">Assign Workers</label>
                        <div className="max-h-60 overflow-y-auto border rounded p-2">
                            {workers.map((worker) => (
                                <div key={worker.user.username} className="flex items-center p-2 hover:bg-gray-100">
                                    <input
                                        type="checkbox"
                                        name="workers"
                                        value={worker.user.username}
                                        checked={newProjectData.workers.includes(worker.user.username)}
                                        onChange={handleChange}
                                        className="mr-2"
                                    />
                                    <label>{worker.user.username}</label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                        >
                            Create Project
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProjectPage;