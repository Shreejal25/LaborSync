import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import { useNavigate } from 'react-router-dom';
import { getWorkers, getManagerDashboard } from '../../endpoints/api';
import logo from "../../assets/images/LaborSynclogo.png";

const CreateProject = ({ onClose, onProjectCreated }) => {
    const { createNewProject, handleLogout } = useAuth();
    const [worker, setWorker] = useState([]);
    const [newProjectData, setNewProjectData] = useState({
        name: '',
        workers: [],
    });

    const navigate = useNavigate();

    useEffect(() => {
        const fetchWorkers = async () => {
            try {
                const workerList = await getWorkers();
                if (workerList) {
                    setWorker(workerList);
                }
            } catch (error) {
                console.error('Error fetching workers:', error);
            }
        };
        fetchWorkers();
    }, []);

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
            setNewProjectData((prevData) => ({
                ...prevData,
                workers: selectedWorkers,
            }));
        } else if (name === 'name') {
            setNewProjectData((prevData) => ({
                ...prevData,
                name: value,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await createNewProject(newProjectData);
        if (result) {
            setNewProjectData({ name: '', workers: [] });
            onClose();
            const dashboardData = await getManagerDashboard();
            onProjectCreated(dashboardData.projects);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="flex w-full max-w-4xl h-[80vh]">
                {/* Side Panel */}
                <div className="w-1/4 bg-white shadow-md flex flex-col p-4 overflow-y-auto">
                    <div className="flex items-center justify-center py-4 border-b">
                        <img src={logo} alt="LaborSync Logo" className="w-36 h-auto" />
                    </div>
                    <nav className="flex-grow">
                        <ul className="flex flex-col py-4">
                            <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => navigate('/manager-dashboard ')}>Dashboard</li>
                            <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => navigate('/schedule')}>Schedule</li>
                            <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => navigate('/timesheets')}>Timesheets</li>
                            <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => navigate('/reports')}>Reports</li>
                            <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => navigate('/rewards')}>Rewards</li>
                            <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => navigate('/user-profile')}>Worker Details</li>
                        </ul>
                    </nav>
                    <button onClick={handleLogout} className="bg-gray-200 text-gray-600 mx-6 my-4 px-4 py-2 rounded hover:bg-gray-300">Logout</button>
                </div>

                {/* Main Content */}
                <div className="w-3/4 bg-white p-8 rounded-lg shadow-md overflow-y-auto">
                    <h2 className="text-2xl font-bold mb-6 text-center">Create Project</h2>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            name="name"
                            placeholder="Project Name"
                            value={newProjectData.name}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border rounded mb-4"
                        />
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Workers:</label>
                            {worker.map((w) => (
                                <div key={w.user.username} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="workers"
                                        value={w.user.username}
                                        checked={newProjectData.workers.includes(w.user.username)}
                                        onChange={handleChange}
                                        className="mr-2"
                                    />
                                    <label>{w.user.username}</label>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between">
                            <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">Create Project</button>
                            <button type="button" onClick={onClose} className="bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateProject;