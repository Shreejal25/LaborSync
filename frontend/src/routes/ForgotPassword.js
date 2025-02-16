import React, { useState } from 'react';
import { forgotPassword } from '../endpoints/api'; // Import the API service

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        try {
            const response = await forgotPassword(email);
            if (response.success) {
                setMessage('If the email exists, a reset link has been sent.');
            } else {
                setError(response.message || 'Something went wrong.');
            }
        } catch (err) {
            setError('Failed to send reset link. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>
            <form onSubmit={handleSubmit} className="w-80 p-4 bg-white shadow-md rounded">
                {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                {message && <p className="text-green-500 text-sm mb-2">{message}</p>}
                
                <label className="block mb-2">Email Address</label>
                <input
                    type="email"
                    className="w-full p-2 border rounded mb-3"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                    disabled={loading}
                >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
            </form>
        </div>
    );
};

export default ForgotPassword;
