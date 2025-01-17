import axios from "axios";

const BASE_URL = 'http://127.0.0.1:8000/api/';
const LOGIN_URL = `${BASE_URL}token/`;
const REFRESH_URL = `${BASE_URL}token/refresh/`;
const DASHBOARD_URL = `${BASE_URL}dashboard/`;
const LOGOUT_URL = `${BASE_URL}logout/`;
const AUTH_URL = `${BASE_URL}authenticated/`;
const REGISTER_URL = `${BASE_URL}register/`;
const CLOCK_IN_URL = `${BASE_URL}clock_in/`;
const CLOCK_OUT_URL = `${BASE_URL}clock_out/`;
const USER_PROFILE_URL = `${BASE_URL}user/profile/`;

export const login = async (username, password) => {
    try {
        const response = await axios.post(LOGIN_URL, { username, password }, { withCredentials: true });
        return response.data.success;
    } catch (error) {
        console.error("Error logging in:", error);
        return false;
    }
};

export const refreshToken = async () => {
    try {
        await axios.post(REFRESH_URL, {}, { withCredentials: true });
        return true;
    } catch (error) {
        console.error("Error refreshing token:", error);
        return false;
    }
};

const callRefresh = async (error, func) => {
    if (error.response && error.response.status === 401) {
        const tokenRefreshed = await refreshToken();
        if (tokenRefreshed) {
            const retryResponse = await func();
            return retryResponse.data;
        }
    }
    throw error;
};

export const getDashboard = async () => {
    try {
        const response = await axios.get(DASHBOARD_URL, { withCredentials: true });
        return response.data;
    } catch (error) {
        return callRefresh(error, () => axios.get(DASHBOARD_URL, { withCredentials: true }));
    }
};

export const logout = async () => {
    try {
        await axios.post(LOGOUT_URL, {}, { withCredentials: true });
        return true;
    } catch (error) {
        console.error("Error logging out:", error);
        return false;
    }
};

export const isAuthenticated = async () => {
    try {
        await axios.post(AUTH_URL, {}, { withCredentials: true });
        return true;
    } catch (error) {
        console.error("Error checking authentication:", error);
        return false;
    }
};

export const register = async (username, email, password, first_name, last_name) => {
    try {
        const response = await axios.post(REGISTER_URL, 
            { username, email, password, first_name, last_name },
            { withCredentials: true }
        );
        return response.data; 
    } catch (error) {
        console.error("Error registering user:", error);
        return null;
    }
};

export const getUserProfile = async () => {
    try {
        const response = await axios.get(USER_PROFILE_URL, { withCredentials: true });
        return response.data;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return callRefresh(error, () => axios.get(USER_PROFILE_URL, { withCredentials: true }));
    }
};

export const updateUserProfile = async (profileData) => {
    try {
        const response = await axios.put(USER_PROFILE_URL, profileData, { withCredentials: true });
        return response.data;
    } catch (error) {
        console.error("Error updating user profile:", error);
        return callRefresh(error, () => axios.put(USER_PROFILE_URL, profileData, { withCredentials: true }));
    }
};

export const clockIn = async () => {
    try {
        const response = await axios.post(CLOCK_IN_URL, {}, { withCredentials: true });
        console.log('Clocked in:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error clocking in:', error);
        return callRefresh(error, () => axios.post(CLOCK_IN_URL, {}, { withCredentials: true }));
    }
};

export const clockOut = async () => {
    try {
        const response = await axios.post(CLOCK_OUT_URL, {}, { withCredentials: true });
        console.log('Clocked out:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error clocking out:', error);
        return callRefresh(error, () => axios.post(CLOCK_OUT_URL, {}, { withCredentials: true }));
    }
};