import React, { useEffect, useState } from 'react';
import { dashboard, logout} from '../endpoints/api';
import { useNavigate } from "react-router-dom";

const Menu = () => {
  const [notes, setNotes] = useState([]);
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const fetchedNotes = await get_notes(); // Await the API call
        setNotes(fetchedNotes); // Update state with the notes
      } catch (error) {
        console.error("Error fetching notes:", error);
      }
    };

    fetchNotes();
  }, []); // Empty dependency array ensures it runs only once

  const handleLogout = async () => {
    try {
      const success = await logout(); // Await logout API call
      if (success) {
        navigate('/login'); // Redirect to login page
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">Welcome Back, User</h1>
      <div className="w-full max-w-md bg-white p-6 rounded shadow-md mb-6">
        {notes.length > 0 ? (
          notes.map((note, index) => (
            <p key={index} className="text-gray-800 border-b py-2">
              {note.description}
            </p>
          ))
        ) : (
          <p className="text-gray-500">No notes available</p>
        )}
      </div>
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition duration-200"
      >
        Logout
      </button>
    </div>
  );
};

export default Menu;
