import React, { useState, useEffect } from 'react';
import { awardPoints, getWorkers } from '../../endpoints/api';
import logo from "../../assets/images/LaborSynclogo.png";
import { useNavigate } from 'react-router-dom';

const AwardPoints = () => {
    const [workers, setWorkers] = useState([]);
    const [selectedWorker, setSelectedWorker] = useState('');
    const [points, setPoints] = useState(5);
    const [description, setDescription] = useState('Task completion');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const workerList = await getWorkers();
                if (workerList) setWorkers(workerList);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        try {
            await awardPoints({
                points,
                description,
                username: selectedWorker,
            });
            setMessage(`Successfully awarded ${points} points to ${selectedWorker}!`);
            setSelectedWorker('');
        } catch (error) {
            setMessage('Failed to award points. Please try again.');
            console.error('Award points error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        navigate('/login');
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
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

            <div className="flex-1 p-8 flex justify-center items-start">
                <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-2xl font-semibold text-gray-800">Award Points</h2>
                    <p className="text-gray-500 text-sm mb-6">Recognize contributions by awarding points</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                                Worker
                            </label>
                            <select
                                id="username"
                                value={selectedWorker}
                                onChange={(e) => setSelectedWorker(e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            >
                                <option value="">Select a worker</option>
                                {workers.map((worker) => (
                                    <option key={worker.user.username} value={worker.user.username}>
                                        {worker.user.username} ({worker.user.first_name} {worker.user.last_name})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <input
                                type="text"
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter description"
                                required
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                        </div>

                        <div>
                            <label htmlFor="points" className="block text-sm font-medium text-gray-700 mb-1">
                                Points to Award
                            </label>
                            <select
                                id="points"
                                value={points}
                                onChange={(e) => setPoints(parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            >
                                <option value="5">5 points</option>
                                <option value="10">10 points</option>
                                <option value="15">15 points</option>
                                <option value="20">20 points</option>
                                <option value="25">25 points</option>
                                <option value="50">50 points</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-2 px-4 rounded-lg font-medium text-white transition ${isLoading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
                        >
                            {isLoading ? 'Processing...' : 'Award Points'}
                        </button>

                        {message && (
                            <div className={`mt-4 p-3 rounded-lg text-sm text-center ${message.includes('Success') ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                                {message}
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AwardPoints;