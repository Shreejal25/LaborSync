import React from 'react';

const RecentTasks = ({ tasks, projects, formatDateTime }) => {
    return (
        <div className="bg-white p-6 my-24 rounded shadow-md mb-6">
            <h2 className="text-xl font-bold mb-4">Project Details</h2>
            {tasks.length > 0 ? (
                <table className="w-full table-auto border-collapse">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 border border-gray-300">Project Name</th>
                            <th className="px-4 py-2 border border-gray-300">Task Title</th>
                            <th className="px-4 py-2 border border-gray-300">Assigned Workers</th>
                            <th className="px-4 py-2 border border-gray-300">Created At</th>
                            <th className="px-4 py-2 border border-gray-300">Updated At</th>
                            <th className="px-4 py-2 border border-gray-300">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map((task) => (
                            <tr key={task.id}>
                                <td className="px-4 py-2 border border-gray-300">
                                    {projects && projects.find((project) => project.id === task.project)?.name || 'No Project'}
                                </td>
                                <td className="px-4 py-2 border border-gray-300">{task.task_title}</td>
                                <td className="px-4 py-2 border border-gray-300">
                                    {projects &&
                                        projects.find((project) => project.id === task.project)?.workers?.length > 0
                                        ? projects
                                            .find((project) => project.id === task.project)
                                            .workers.map((worker, index) => (
                                                <span key={index}>
                                                    {worker}
                                                    {index <
                                                        projects.find(
                                                            (project) => project.id === task.project
                                                        ).workers.length -
                                                        1 && ', '}
                                                </span>
                                            ))
                                        : 'Not Assigned'}
                                </td>
                                <td className="px-4 py-2 border border-gray-300">
                                    {projects.find((project) => project.id === task.project)?.created_at ? (
                                        formatDateTime(projects.find((project) => project.id === task.project).created_at)
                                    ) : (
                                        'N/A'
                                    )}
                                </td>
                                <td className="px-4 py-2 border border-gray-300">
                                    {projects.find((project) => project.id === task.project)?.updated_at ? (
                                        formatDateTime(projects.find((project) => project.id === task.project).updated_at)
                                    ) : (
                                        'N/A'
                                    )}
                                </td>
                                <td className="px-4 py-2 border border-gray-300 flex items-center gap-2">
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
    );
};

export default RecentTasks;