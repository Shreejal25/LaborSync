import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resetPasswordConfirm } from '../endpoints/api'; // Import the API service

function ResetPassword() {
    const { uid, token } = useParams();  // Extract uid and token
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        try {
            const response = await resetPasswordConfirm(uid, token, newPassword, confirmPassword);
            if (response.success) {
                setSuccessMessage('Password has been reset successfully. Redirecting...');
                setTimeout(() => navigate('/login'), 3000);
            } else {
                setError(response.message);
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
            <form onSubmit={handleSubmit} className="w-80 p-4 bg-white shadow-md rounded">
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {successMessage && <p className="text-green-500 text-sm">{successMessage}</p>}
                
                <label className="block mb-2">New Password</label>
                <input
                    type="password"
                    className="w-full p-2 border rounded mb-3"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                />

                <label className="block mb-2">Confirm Password</label>
                <input
                    type="password"
                    className="w-full p-2 border rounded mb-3"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />

                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                >
                    Reset Password
                </button>
            </form>
        </div>
    );
}

export default ResetPassword;
