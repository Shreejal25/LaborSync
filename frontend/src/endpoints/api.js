import axios from "axios";

const BASE_URL  = 'http://127.0.0.1:8000/api/';
const LOGIN_URL = `${BASE_URL}token/`;
const REFRESH_URL = `${BASE_URL}token/refresh/`;
const NOTES_URL = `${BASE_URL}dashboard/`;
const LOGOUT_URL =`${BASE_URL}logout/`;
const AUTH_URL = `${BASE_URL}authenticated/`;
const REGISTER = `${BASE_URL}register/`;


export const login = async (username, password) => {
    const response = await axios.post(LOGIN_URL, { username, password }, { withCredentials: true });
    return response.data.success;
};

export const refresh_token = async () => {
    try {
        await axios.post(REFRESH_URL, {}, { withCredentials: true });
        return true;
    } catch (error) {
        return false;
    }
};

export const get_dashboard = async () => {
    try {
        const response = await axios.get(NOTES_URL, { withCredentials: true });
        return response.data;
    } catch (error) {
        return call_refresh(error, () => axios.get(NOTES_URL, { withCredentials: true }));
    }
};

const call_refresh = async (error, func) => {
    if (error.response && error.response.status === 401) {
        const tokenRefreshed = await refresh_token();
        if (tokenRefreshed) {
            const retryResponse = await func();
            return retryResponse.data;
        }
    }
    throw error;
};

export const logout = async () => {
    try {
        await axios.post(LOGOUT_URL, {}, { withCredentials: true });
        return true;
    } catch (error) {
        return false;
    }
};

export const is_authenticated = async () => {
    try {
        await axios.post(AUTH_URL, {}, { withCredentials: true });
        return true;
    } catch (error) {
        return false;
    }
};

export const register = async (username, email, password, first_name, last_name) => {
    try {
        const response = await axios.post(REGISTER, 
            { username: username, email:email, password:password, first_name:first_name, last_name:last_name },
            { withCredentials: true }
        );
        return response.data; 
    } catch (error) {
        console.error("Error registering user:", error);
        return null;
    }
};


