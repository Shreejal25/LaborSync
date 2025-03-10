// Notification.js
import React, { useEffect } from 'react';

const Notification = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Close after 3 seconds

    return () => clearTimeout(timer); // Clear timeout on unmount
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded shadow-md">
      {message}
      <button onClick={onClose} className="ml-2">
        &times;
      </button>
    </div>
  );
};

export default Notification;