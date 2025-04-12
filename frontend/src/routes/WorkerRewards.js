import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { getRewardsDetails, getUserPoints, redeemReward } from '../endpoints/api';
import { FaCoins } from 'react-icons/fa';
import logo from "../assets/images/LaborSynclogo.png";

const WorkerRewards = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pointsData, setPointsData] = useState({
    total_points: 0,
    available_points: 0,
    redeemed_points: 0
  });
  const [redeemingId, setRedeemingId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rewardsResponse, pointsResponse] = await Promise.all([
          getRewardsDetails(),
          getUserPoints()
        ]);
        setRewards(rewardsResponse.rewards);
        setPointsData(pointsResponse);
      } catch (err) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    navigate('/login');
  };

  const handleRedeem = async (rewardId, rewardName) => {
    try {
      setRedeemingId(rewardId);
      const response = await redeemReward(rewardName);
      
      // Update points data
      const updatedPoints = await getUserPoints();
      setPointsData(updatedPoints);
      
      // Update rewards list to reflect the redemption
      const updatedRewards = await getRewardsDetails();
      setRewards(updatedRewards.rewards);
      
      // Show success message
      alert(response.message || 'Reward redeemed successfully!');
    } catch (error) {
      console.error("Redemption failed:", error);
      alert(error.response?.data?.message || 'Failed to redeem reward');
    } finally {
      setRedeemingId(null);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="w-1/6 bg-white shadow-md"></div>
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">Loading rewards...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="w-1/6 bg-white shadow-md"></div>
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center text-red-500">{error}</div>
        </div>
      </div>
    );
  }

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
                       
                        <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => navigate('/timesheets')}>
                            Timesheets
                        </li>
                        <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => navigate('/view-project')}>
                            View Project
                        </li>
                        <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => navigate('/view-task')}>
                            View Tasks
                        </li>
                        
                        <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => navigate('/worker-rewards')}>
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
      <div className="flex-1 p-8">
      {/* Points Summary Card - Minimalist Design */}
<div className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-gray-100">
  <div className="flex flex-col items-center mb-6">
    <div className="relative mb-4">
      <div className="absolute inset-0 bg-yellow-100 rounded-full opacity-60"></div>
      <FaCoins className="relative text-yellow-500 text-3xl z-10" />
    </div>
    <h2 className="text-xl font-semibold text-gray-800">Your Points Balance</h2>
  </div>
  
  <div className="grid grid-cols-3 gap-5">
    {/* Total Points Card */}
    <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg transition-all hover:shadow-sm">
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Total</span>
      <span className="text-2xl font-bold text-gray-800">{pointsData.total_points}</span>
      <div className="mt-1 w-8 h-1 bg-gray-200 rounded-full"></div>
    </div>
    
    {/* Available Points Card */}
    <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg transition-all hover:shadow-sm">
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Available</span>
      <span className="text-2xl font-bold text-green-600">{pointsData.available_points}</span>
      <div className="mt-1 w-8 h-1 bg-green-200 rounded-full"></div>
    </div>
    
    {/* Redeemed Points Card */}
    <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg transition-all hover:shadow-sm">
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Redeemed</span>
      <span className="text-2xl font-bold text-blue-600">{pointsData.redeemed_points}</span>
      <div className="mt-1 w-8 h-1 bg-blue-200 rounded-full"></div>
    </div>
  </div>
  
  
</div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Available Rewards</h1>
          <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
            <span className="text-sm text-gray-600">Current Points:</span>
            <span className="font-medium text-blue-800">
              {pointsData.available_points}
            </span>
          </div>
        </div>

        {rewards.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <h3 className="text-lg font-medium text-gray-700">No rewards available</h3>
            <p className="text-gray-500 mt-2">Check back later for new reward opportunities</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map((reward) => (
              <div key={reward.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex items-start">
                    <div className={`flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center ${
                      reward.reward_type === 'bonus' ? 'bg-green-100' : 
                      reward.reward_type === 'timeoff' ? 'bg-blue-100' : 'bg-purple-100'
                    }`}>
                      <span className={`text-xl font-medium ${
                        reward.reward_type === 'bonus' ? 'text-green-600' : 
                        reward.reward_type === 'timeoff' ? 'text-blue-600' : 'text-purple-600'
                      }`}>
                        {reward.reward_type === 'bonus' ? '$' : reward.reward_type === 'timeoff' ? '⏳' : '🎁'}
                      </span>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{reward.name}</h3>
                      <p className="text-gray-500 mt-1 text-sm">{reward.description}</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">Cost:</span>
                      <span className={`text-sm font-semibold ${
                        reward.point_cost > pointsData.available_points ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {reward.point_cost} points
                      </span>
                    </div>

                    {reward.reward_type === 'bonus' && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500">Value:</span>
                        <span className="text-sm font-semibold text-green-600">
                          {formatCurrency(parseFloat(reward.cash_value))}
                        </span>
                      </div>
                    )}

                    {reward.reward_type === 'timeoff' && reward.days_off && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500">Time Off:</span>
                        <span className="text-sm font-semibold text-blue-600">
                          {reward.days_off} day{reward.days_off !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}

                    {reward.task_details && (
                      <div className="pt-3 mt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500 mb-1">Associated Task:</p>
                        <p className="text-sm font-medium text-gray-700 truncate">
                          {reward.task_details.description}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={() => handleRedeem(reward.id, reward.name)}
                      disabled={reward.point_cost > pointsData.available_points || redeemingId === reward.id}
                      className={`w-full px-4 py-2 rounded-md text-sm font-medium text-white transition-colors ${
                        reward.point_cost > pointsData.available_points 
                          ? 'bg-gray-300 cursor-not-allowed' 
                          : redeemingId === reward.id
                            ? 'bg-blue-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {redeemingId === reward.id ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </span>
                      ) : reward.point_cost > pointsData.available_points ? (
                        'Need more points'
                      ) : (
                        'Redeem Reward'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerRewards;