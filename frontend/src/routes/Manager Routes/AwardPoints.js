import React, { useState, useEffect } from 'react';
import { awardPoints, getWorkers,getManagerTasks,getRewardsDetails } from '../../endpoints/api';
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
        <div className="flex min-h-screen bg-gray-50 font-['Poppins']">
                  <div className="w-full md:w-1/6 bg-white shadow-md flex flex-col font-['Poppins'] ">
                              <div className="flex items-center justify-center py-4 border-b">
                                <img src={logo} alt="LaborSync Logo" className="w-28 md:w-36 h-auto" />
                              </div>
                              <nav className="flex-grow overflow-y-auto font-['Poppins']">
                                <ul className="flex flex-col py-4">
                                  {[
                                    { path: '/manager-dashboard', label: 'Dashboard' },
                                    { path: '/create-project', label: 'Project' },
                                    { path: '/assign-task', label: 'Assign Tasks' },
                                    { path: '/manager-rewards', label: 'Rewards',active: true },
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
           

            <div className="flex-1 p-8 flex justify-center items-start">
                <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-0 overflow-hidden">
                    {/* Card Header with Gradient */}
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
                        <h2 className="text-2xl font-bold text-white">Award Points</h2>
                        <p className="text-blue-100 mt-1">Recognize contributions by awarding points</p>
                    </div>
                    
                    {/* Form Content */}
                    <div className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1">
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                    Select Worker
                                </label>
                                <div className="relative">
                                    <select
                                        id="username"
                                        value={selectedWorker}
                                        onChange={(e) => setSelectedWorker(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none bg-white"
                                    >
                                        <option value="">Select a worker</option>
                                        {workers.map((worker) => (
                                            <option key={worker.user.username} value={worker.user.username}>
                                                {worker.user.username} ({worker.user.first_name} {worker.user.last_name})
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                    Reason for Recognition
                                </label>
                                <input
                                    type="text"
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Why are you awarding these points?"
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                                />
                            </div>

                            <div className="space-y-1">
                                <label htmlFor="points" className="block text-sm font-medium text-gray-700">
                                    Points to Award
                                </label>
                                <div className="relative">
                                    <select
                                        id="points"
                                        value={points}
                                        onChange={(e) => setPoints(parseInt(e.target.value))}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none bg-white"
                                    >
                                        <option value="5">5 points</option>
                                        <option value="10">10 points</option>
                                        <option value="15">15 points</option>
                                        <option value="20">20 points</option>
                                        <option value="25">25 points</option>
                                        <option value="50">50 points</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full py-3 px-4 rounded-lg font-medium text-white shadow-md transition duration-200 ${
                                        isLoading ? 'bg-blue-300 cursor-not-allowed' : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                                    }`}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </span>
                                    ) : (
                                        'Award Points'
                                    )}
                                </button>
                            </div>

                            {message && (
                                <div className={`mt-6 p-4 rounded-lg ${
                                    message.includes('Success') 
                                        ? 'bg-green-50 border-l-4 border-green-500 text-green-700' 
                                        : 'bg-red-50 border-l-4 border-red-500 text-red-700'
                                }`}>
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            {message.includes('Success') ? (
                                                <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            ) : (
                                                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm">{message}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default AwardPoints;