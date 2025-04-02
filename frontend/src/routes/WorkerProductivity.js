import React, { useState, useEffect } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, 
         CategoryScale, 
         LinearScale, 
         BarElement, 
         Title, 
         Tooltip, 
         Legend,
         ArcElement } from 'chart.js';
import { getProjectStats, getProjects } from '../endpoints/api';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/images/LaborSynclogo.png';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const WorkerProductivityCharts = () => {
  const [productivityData, setProductivityData] = useState([]);
  const [projectStats, setProjectStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodData, projectsData] = await Promise.all([
          getProjectStats(),
          getProjects()
        ]);
        
        setProductivityData(prodData);
        
        const stats = { 'not_started': 0, 'in_progress': 0, 'completed': 0 };
        projectsData.forEach(project => {
          stats[project.status] += 1;
        });
        
        setProjectStats(stats);
      } catch (err) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const productivityChartData = {
    labels: productivityData.map(worker => worker.username),
    datasets: [
      {
        label: 'Productivity %',
        data: productivityData.map(worker => worker.productivity),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }
    ]
  };

  const projectStatusChartData = {
    labels: Object.keys(projectStats),
    datasets: [
      {
        data: Object.values(projectStats),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Side Panel */}
      <div className="w-1/6 bg-white shadow-md flex flex-col p-4">
        <div className="flex items-center justify-center py-4 border-b">
          <img src={logo} alt="LaborSync Logo" className="w-36 h-auto" />
        </div>
        <nav className="flex-grow">
          <ul className="flex flex-col py-4">
          <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => navigate('/manager-dashboard')}>
              Dashboard
            </li>
            <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => navigate('/manage-schedule')}>
              Manage Schedule
            </li>
            <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => navigate('/create-project')}>
              Project
            </li>
            <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => navigate('/assign-task')}>
              Assign Tasks
            </li>
            <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => navigate('/worker-productivity')}>
              Reports
            </li>
            <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => navigate('/manager-profile')}>
              Worker Details
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="p-6 w-full">
        <h2 className="text-2xl font-bold mb-6">Performance Dashboard</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Worker Productivity</h3>
            <div className="h-80">
              <Bar data={productivityChartData} options={{ responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 100, title: { display: true, text: 'Percentage' }}}}} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Project Status Distribution</h3>
            <div className="h-80">
              <Doughnut data={projectStatusChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
        <div className="mt-8 bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Worker Productivity Data</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Worker</th>
                  <th className="px-4 py-2 text-left">Completed Tasks</th>
                  <th className="px-4 py-2 text-left">Total Tasks</th>
                  <th className="px-4 py-2 text-left">Productivity</th>
                </tr>
              </thead>
              <tbody>
                {productivityData.map((worker, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="px-4 py-2">{worker.username}</td>
                    <td className="px-4 py-2">{worker.completed_tasks}</td>
                    <td className="px-4 py-2">{worker.total_tasks}</td>
                    <td className={`px-4 py-2 font-medium ${worker.productivity >= 75 ? 'text-green-600' : worker.productivity >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>{worker.productivity}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerProductivityCharts;
