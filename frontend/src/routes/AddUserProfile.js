import React, { useState } from "react";
import { useAuth } from "../context/useAuth"; // Ensure the correct context is imported
import { useNavigate } from "react-router-dom"; // To handle navigation for sidebar
import logo from "../assets/images/LaborSynclogo.png"; // Replace with your logo path

const AddUserProfile = () => {
    const { addUserProfile } = useAuth(); // Assuming you have this function in your context
    const [profileData, setProfileData] = useState({
        phone_number: "",
        gender: "",
        current_address: "",
        permanent_address: "",
        city_town: "",
        state_province: "",
        education_level: "",
        certifications: "",
        skills: "",
        languages_spoken: "",
        work_availability: "",
        work_schedule_preference: ""
    });

    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addUserProfile(profileData); // Ensure this function sends the correct structure
            setSuccessMessage("Profile added successfully!");
            setErrorMessage("");  // Clear any previous error messages
            navigate('/user-profile'); // Redirect to user profile page after successful addition
        } catch (error) {
            console.error("Error adding profile:", error);
            setErrorMessage("Error adding profile. Please try again.");
            setSuccessMessage("");  // Clear any previous success messages
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <div className="w-1/6 bg-white shadow-md flex flex-col p-4">
                <div className="flex items-center justify-center py-4 border-b">
                    <img src={logo} alt="LaborSync Logo" className="w-36 h-auto" />
                </div>
                {/* Add your navigation here */}
            </div>

            {/* Main Content */}
            <div className="flex-grow bg-gray-50 flex items-center justify-center p-6">
                <div className="w-full max-w-xl bg-white shadow-md rounded-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Add Profile Details</h2>

                    {/* Display success or error message */}
                    {successMessage && <div className="text-green-600 mb-4">{successMessage}</div>}
                    {errorMessage && <div className="text-red-600 mb-4">{errorMessage}</div>}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {[
                            { label: "Phone Number", name: "phone_number", type: "text" },
                            { label: "Gender", name: "gender", type: "text" },
                            { label: "Current Address", name: "current_address", type: "text" },
                            { label: "Permanent Address", name: "permanent_address", type: "text" },
                            { label: "City/Town", name: "city_town", type: "text" },
                            { label:"State/Province", name:"state_province", type:"text"},
                            { label:"Education Level", name:"education_level", type:"text"},
                            { label:"Certifications", name:"certifications", type:"text"},
                            { label:"Skills", name:"skills", type:"text"},
                            { label:"Languages Spoken", name:"languages_spoken", type:"text"},
                            { label:"Work Availability", name:"work_availability", type:"text"},
                            { label:"Work Schedule Preference", name:"work_schedule_preference", type:"text"}
                        ].map(({ label, name, type }, index) => (
                            <div key={index}>
                                <label htmlFor={name} className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
                                <input
                                    type={type}
                                    name={name}
                                    value={profileData[name]}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500`}
                                />
                            </div>
                        ))}
                        <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-400"
                        >
                            Add Profile
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddUserProfile;
