import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/images/LaborSynclogo.png';
import { getWorkers, getManagerDashboard, getProjects, getProjectWorkers } from '../endpoints/api';

const AssignTaskComponent = () => {
    const { assignTaskToUser, handleLogout, createNewProject, fetchProjectWorkers } = useAuth();
    const [taskData, setTaskData] = useState({
        project: '',
        task_title: '',
        description: '',
        estimated_completion_datetime: '',
        assigned_shift: '',
        assigned_to: '',
    });
    const [worker, setWorker] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [projectWorkers, setProjectWorkers] = useState([]);
    const [createProjectModalOpen, setCreateProjectModalOpen] = useState(false);
    
    const [newProjectData, setNewProjectData] = useState({
        name: '',
        workers: [],
    });

    const navigate = useNavigate();

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const dashboardData = await getManagerDashboard();
                if (dashboardData && dashboardData.projects) {
                    setProjects(dashboardData.projects);
                }
            } catch (error) {
                console.error('Error fetching projects:', error);
            }
        };

        fetchProjects();

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

    useEffect(() => {
        const fetchProjects = async () => {
            const projects = await getProjects();
            if (projects) {
                setProjects(projects);
            }
        };

        fetchProjects();
    }, []);

    useEffect(() => {
        const fetchProjectWorkersData = async () => {
            if (selectedProject) {
                try {
                    const workers = await getProjectWorkers(selectedProject);
                    console.log("Fetched workers:", workers); // Debugging
                    if (workers) {
                        setProjectWorkers(workers);
                    }
                } catch (error) {
                    console.error('Error fetching project workers:', error);
                }
            }
        };

        fetchProjectWorkersData();
    }, [selectedProject, getProjectWorkers]); // Add fetchProjectWorkers to dependency array

    useEffect(() => {
        const fetchData = async () => {
            try {
                const dashboardData = await getManagerDashboard();
                console.log('Dashboard Data:', dashboardData);
                setTasks(dashboardData.recent_tasks);

                const workersData = await getWorkers();
                console.log('Workers Data:', workersData);
                setWorker(workersData);
            } catch (error) {
                console.error('Error fetching manager dashboard data:', error);
            }
        };

        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'selectedProject') {
            setSelectedProject(value);
            setTaskData((prevData) => ({
                ...prevData,
                project: value,
            }));
        } else if (name === 'workers') {
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
        } else {
            setTaskData((prevData) => ({
                ...prevData,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await assignTaskToUser(taskData);
        if (result) {
            setTaskData({
                project: '',
                task_title: '',
                description: '',
                estimated_completion_datetime: '',
                assigned_shift: '',
                assigned_to: '',
            });
            setIsModalOpen(false);
        }
    };

    const handleCreateProjectSubmit = async (e) => {
        e.preventDefault();
        const result = await createNewProject(newProjectData);
        if (result) {
            setNewProjectData({ name: '', workers: [] });
            setCreateProjectModalOpen(false);
            const dashboardData = await getManagerDashboard();
            setProjects(dashboardData.projects);
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <div className="w-1/6 bg-white shadow-md flex flex-col p-4">
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

            <div className="flex-grow p-8 relative">
                <div className="absolute top-6 left-6">
                    <button
                        onClick={() => setCreateProjectModalOpen(true)}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 shadow-md"
                    >
                        + Create Project
                    </button>
                </div>
                <div className="absolute top-6 right-6">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 shadow-md"
                    >
                        + Assign Task
                    </button>
                </div>

                <div className="bg-white p-6 rounded shadow-md mb-6">
                    <h2 className="text-xl font-bold mb-4">Recent Tasks</h2>
                    {tasks.length > 0 ? (
                        <table className="w-full table-auto border-collapse">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 border border-gray-300">Task Title</th>
                                    <th className="px-4 py-2 border border-gray-300">Assigned To</th>
                                    <th className="px-4 py-2 border border-gray-300">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                            {tasks.map((task) => (
                                <tr key={task.id}>
                                    <td className="px-4 py-2 border border-gray-300">{task.task_title}</td>
                                    <td className="px-4 py-2 border border-gray-300">
                                        {/* Display project workers */}
                                        {projects
                                            .find((project) => project.id === task.project)?.workers?.length > 0
                                            ? projects
                                                .find((project) => project.id === task.project)
                                                .workers.map((worker, index) => (
                                                    <span key={index}>
                                                        {worker}
                                                        {index < projects.find((project) => project.id === task.project).workers.length - 1 && ', '}
                                                    </span>
                                                ))
                                            : 'Not Assigned'}
                                    </td>
                                    <td className="px-4 py-2 border border-gray-300 flex items-center gap-2">
                                        {/* Display task status */}
                                        <span
                                            className={`h-3 w-3 rounded-full ${
                                                task.status === 'pending'
                                                    ? 'bg-red-500'
                                                    : task.status === 'in_progress'
                                                    ? 'bg-yellow-500'
                                                    : 'bg-green-500'
                                            }`}
                                        ></span>
                                        {task.status.replace('_', ' ').toUpperCase()}
                                    </td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-gray-500">No tasks available</p>
                    )}
                </div>

                {isModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg">
                            <h2 className="text-2xl font-bold mb-6 text-center">Assign Task</h2>
                            <form onSubmit={handleSubmit}>
                                <select name="project" value={taskData.project} onChange={handleChange} required className="w-full p-2 border rounded mb-4">
                                    <option value="" disabled>Select a project</option>
                                    {projects && projects.map((project) => (
                                        <option key={project.id} value={project.id}>{project.name}</option>
                                    ))}
                                </select>

                                <input type="text" name="task_title" placeholder="Task Title" value={taskData.task_title} onChange={handleChange} required className="w-full p-2 border rounded mb-4" />
                                <textarea name="description" placeholder="Description" value={taskData.description} onChange={handleChange} required className="w-full p-2 border rounded mb-4"></textarea>
                                <input type="datetime-local" name="estimated_completion_datetime" value={taskData.estimated_completion_datetime} onChange={handleChange} required className="w-full p-2 border rounded mb-4" />
                                <input type="text" name="assigned_shift" placeholder="Assigned Shift" value={taskData.assigned_shift} onChange={handleChange} required className="w-full p-2 border rounded mb-4" />
                                <select name="assigned_to" value={taskData.assigned_to} onChange={handleChange} required className="w-full p-2 border rounded mb-4">
                                    <option value="" disabled>Select a user</option>
                                    {projectWorkers && projectWorkers.map((worker) => (
                                        <option key={worker.username} value={worker.username}>{worker.username}</option>
                                    ))}
                                </select>
                                <div className="flex justify-between">
                                    <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">Assign Task</button>
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400">Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {createProjectModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg">
                            <h2 className="text-2xl font-bold mb-6 text-center">Create Project</h2>
                            <form onSubmit={handleCreateProjectSubmit}>
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
                                    <button type="button" onClick={() => setCreateProjectModalOpen(false)} className="bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400">Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssignTaskComponent;