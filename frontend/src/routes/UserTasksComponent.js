import React, { useEffect } from 'react';
import { useAuth } from '../context/useAuth'; // Adjust path as necessary

const UserTasksComponent = () => {
  const { userTasks, fetchUserTasks } = useAuth();

  useEffect(() => {
    fetchUserTasks(); // Fetch tasks when component mounts
  }, [fetchUserTasks]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Your Assigned Tasks</h2>

      {userTasks && userTasks.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 px-4">
          {userTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200"
            >
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {task.task_title}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                <span className="font-medium text-gray-600">Project:</span> {task.project_name}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                <span className="font-medium text-gray-600">Description:</span> {task.description}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                <span className="font-medium text-gray-600">Estimated Completion:</span>{' '}
                {new Date(task.estimated_completion_datetime).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">
                <span className="font-medium text-gray-600">Assigned Shift:</span>{' '}
                {task.assigned_shift}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 text-center mt-6">No tasks assigned.</p>
      )}
    </div>
  );
};

export default UserTasksComponent;
