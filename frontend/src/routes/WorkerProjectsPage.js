import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import { useNavigate } from 'react-router-dom';
import { getProjects } from '../endpoints/api';
import logo from "../assets/images/LaborSynclogo.png";

const WorkerProjectsPage = () => {
    const { userProfile, handleLogout } = useAuth();
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const formatDate = (isoString) => {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        return date.toLocaleDateString();
    };

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                if (userProfile?.user?.username) {
                    const workerProjects = await getProjects(userProfile.user.username);
                    setProjects(workerProjects || []);
                }
            } catch (error) {
                console.error('Error fetching worker projects:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, [userProfile]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center text-gray-600">Loading your projects...</div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
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
            <main className="w-full min-h-screen py-1 md:w-2/3 lg:w-3/4">
                <div className="p-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold">My Projects</h1>
                        <p className="text-gray-600">View all projects you're currently assigned to</p>
                    </div>

                    {projects.length > 0 ? (
                        <div className="bg-white p-6 rounded shadow-md">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {projects.map((project) => (
                                    <div key={project.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-lg mb-2">{project.name}</h3>
                                            <button 
                                                onClick={() => {
                                                    setSelectedProject(project);
                                                    setShowDetailsModal(true);
                                                }}
                                                className="text-blue-500 hover:text-blue-700"
                                                title="View Details"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="flex items-center">
                                                <span className="text-gray-500 mr-2">Status:</span>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    project.status === 'active' ? 'bg-green-100 text-green-800' :
                                                    project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                                                </span>
                                            </p>
                                            <p><span className="text-gray-500">Location:</span> {project.location}</p>
                                            <p><span className="text-gray-500">Start Date:</span> {formatDate(project.start_date)}</p>
                                            <p><span className="text-gray-500">End Date:</span> {formatDate(project.end_date)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white p-8 rounded shadow-md text-center">
                            <p className="text-gray-500 mb-4">You are not currently assigned to any projects</p>
                            <button 
                                onClick={() => navigate('/worker-schedule')} 
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                View My Schedule
                            </button>
                        </div>
                    )}
                </div>

                {/* Project Details Modal */}
                {showDetailsModal && selectedProject && (
                    <ProjectDetailsModal 
                        project={selectedProject}
                        onClose={() => setShowDetailsModal(false)}
                    />
                )}
            </main>
        </div>
    );
};

// Project Details Modal Component
const ProjectDetailsModal = ({ project, onClose }) => {
    const formatDateTime = (isoString) => {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        return date.toLocaleString();
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">{project.name} Details</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-lg mb-2">Project Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p><span className="font-medium">Status:</span> 
                                    <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        project.status === 'active' ? 'bg-green-100 text-green-800' :
                                        project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                                    </span>
                                </p>
                                <p><span className="font-medium">Location:</span> {project.location}</p>
                                <p><span className="font-medium">Start Date:</span> {formatDateTime(project.start_date)}</p>
                                <p><span className="font-medium">End Date:</span> {formatDateTime(project.end_date)}</p>
                            </div>
                            <div>
                                <p><span className="font-medium">Created At:</span> {formatDateTime(project.created_at)}</p>
                                <p><span className="font-medium">Last Updated:</span> {formatDateTime(project.updated_at)}</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-2">Project Description</h3>
                        <div className="bg-gray-50 p-4 rounded">
                            <p className="text-gray-700">{project.description || 'No description available'}</p>
                        </div>
                    </div>

                    <div className="pt-4 border-t">
                        <h3 className="font-semibold text-lg mb-2">Your Tasks</h3>
                        {project.tasks && project.tasks.length > 0 ? (
                            <ul className="space-y-3">
                                {project.tasks.map((task) => (
                                    <li key={task.id} className="border rounded p-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-medium">{task.task_title}</h4>
                                                <p className="text-sm text-gray-600">{task.description}</p>
                                            </div>
                                            <span className={`text-xs px-2 py-1 rounded ${
                                                task.status === 'pending' ? 'bg-red-100 text-red-800' :
                                                task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                                {task.status.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="mt-2 text-sm">
                                            <p><span className="text-gray-500">Due:</span> {formatDateTime(task.estimated_completion_datetime)}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500">No tasks assigned to you in this project</p>
                        )}
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WorkerProjectsPage;