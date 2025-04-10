import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRewards, getWorkers,getRewardsDetails } from '../../endpoints/api';
import logo from "../../assets/images/LaborSynclogo.png";

const CreateReward = () => {
  const navigate = useNavigate();
  const [workers, setWorkers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    point_cost: '',
    reward_type: 'bonus',
    cash_value: '',
    is_active: true,
    eligible_users: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const workerList = await getWorkers();
        setWorkers(workerList);
      } catch (error) {
        console.error('Error fetching workers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkers();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleUserSelect = (e) => {
    const options = [...e.target.selectedOptions];
    const selectedUsernames = options.map(option => option.value);
    setSelectedUsers(selectedUsernames);
    setFormData(prev => ({
      ...prev,
      eligible_users: selectedUsernames
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submissionData = {
        ...formData,
        point_cost: Number(formData.point_cost),
        cash_value: formData.reward_type === 'bonus' ? Number(formData.cash_value) : null
      };
      
      await createRewards(submissionData);
      navigate('/manager-rewards');
    } catch (error) {
      console.error('Error creating reward:', error);
      alert('Failed to create reward');
    }
  };

  const handleLogout = () => {
    navigate('/login');
  };

  if (loading) {
    return <div className="text-center p-8">Loading workers...</div>;
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
            <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => navigate('/manager-dashboard')}>
              Dashboard
            </li>
        
            <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => navigate('/create-project')}>
              Project
            </li>
            <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => navigate('/assign-task')}>
              Assign Tasks
            </li>
            <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => navigate('/award-points')}>
              Rewards
            </li>
            <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => navigate('/reports')}>
              Reports
            </li>
            <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => navigate('/manager-profile')}>
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
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-gray-800">Create New Reward</h2>
          <p className="text-gray-500 text-sm mb-6">Create reward options for workers</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Information */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Point Cost</label>
                <input
                  type="number"
                  name="point_cost"
                  value={formData.point_cost}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Reward Type</label>
                <select
                  name="reward_type"
                  value={formData.reward_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="bonus">Cash Bonus</option>
                  <option value="timeoff">Paid Time Off</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {formData.reward_type === 'bonus' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Cash Value</label>
                <input
                  type="number"
                  name="cash_value"
                  value={formData.cash_value}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required={formData.reward_type === 'bonus'}
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="text-sm text-gray-700">Active Reward</label>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Eligible Workers</label>
              <select
                multiple
                name="eligible_users"
                value={selectedUsers}
                onChange={handleUserSelect}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition h-auto min-h-[100px]"
              >
                {workers.map((worker) => (
                  <option 
                    key={worker.user.username} 
                    value={worker.user.username}
                    className="p-2 hover:bg-blue-50"
                  >
                    {worker.user.username} ({worker.user.first_name} {worker.user.last_name})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500">
                {selectedUsers.length > 0 
                  ? `Selected: ${selectedUsers.join(', ')}`
                  : 'Hold Ctrl/Cmd to select multiple workers'
                }
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('/manager-rewards')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={() => navigate('/manager-rewards')}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600"
              >
                Create Reward
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateReward;