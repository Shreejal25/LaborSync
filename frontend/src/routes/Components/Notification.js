// Notification.js
import React, { useEffect } from 'react';

const Notification = ({ message, onClose, type }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    console.log("Notification type:", type); // Log the type
    console.log("Typeof type:", typeof type); // Log the type

    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';

    console.log("bgColor:", bgColor); //log the bgColor
    return (
        <div className={`fixed top-4 right-4 ${bgColor} text-white p-4 rounded shadow-md`}>
            {message}
            <button onClick={onClose} className="ml-2">
                &times;
            </button>
        </div>
    );
};

export default Notification;