import axios from "axios";

const BASE_URL = 'http://127.0.0.1:8000/api/';
const LOGIN_URL = `${BASE_URL}token/`;
const REFRESH_URL = `${BASE_URL}token/refresh/`;
// const DASHBOARD_URL = `${BASE_URL}dashboard/`;
const LOGOUT_URL = `${BASE_URL}logout/`;
const AUTH_URL = `${BASE_URL}authenticated/`;
const REGISTER_URL = `${BASE_URL}register/`;
const CLOCK_IN_URL = `${BASE_URL}clock_in/`;
const CLOCK_OUT_URL = `${BASE_URL}clock_out/`;
const USER_PROFILE_URL = `${BASE_URL}user/profile/`;
const ASSIGN_TASK_URL = `${BASE_URL}assign/task/`;
const GET_TASKS_URL = `${BASE_URL}view/tasks/`;
const LOGIN_URL_MANAGER = `${BASE_URL}login/manager/`;      
const REGISTER_URL_MANAGER = `${BASE_URL}register/manager/`;
const FORGOT_PASSWORD_URL = `${BASE_URL}forgot_password/`; 
const RESET_PASSWORD_URL = `${BASE_URL}reset_password_confirm/`;  
const MANAGER_PROFILE_URL = `${BASE_URL}manager-profile/`;
const MANAGER_DASHBOARD_URL = `${BASE_URL}manager-dashboard/`;
const USER_DASHBOARD_URL = `${BASE_URL}user-dashboard/`;
const USER_ROLE_URL = `${BASE_URL}user-role/`;
const WORKERS_URL = `${BASE_URL}workers/`;
const CLOCK_HISTORY_URL = `${BASE_URL}clock-history/`;
const CREATE_PROJECT_URL = `${BASE_URL}projects/`;
const GET_PROJECT_WORKERS_URL = `${BASE_URL}projects/`;
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

// export const getDashboard = async () => {
//     try {
//         const response = await axios.get(DASHBOARD_URL, { withCredentials: true });
//         return response.data;
//     } catch (error) {
//         return callRefresh(error, () => axios.get(DASHBOARD_URL, { withCredentials: true }));
//     }
// };



export const createProject = async (projectData) => {
    try {
        const response = await axios.post(CREATE_PROJECT_URL, projectData, { withCredentials: true });
        return response.data;
    } catch (error) {
        console.error("Error creating project:", error);
        return null;
    }
};

export const getProjectWorkers = async (projectId) => {
    try {
        const response = await axios.get(`${GET_PROJECT_WORKERS_URL}${projectId}/workers/`, { withCredentials: true });
        return response.data;
    } catch (error) {
        console.error("Error fetching project workers:", error);
        return null;
    }
};




export const getUserRole = async () => {
    try {
        const response = await axios.get(USER_ROLE_URL, { withCredentials: true });
        return response.data.role; // Returns 'manager' or 'user'
    } catch (error) {
        console.error("Error fetching user role:", error);
        return callRefresh(error, () => axios.get(USER_ROLE_URL, { withCredentials: true }));
    }
};



export const getWorkers = async () => {
    try {
        const response = await axios.get(WORKERS_URL, { withCredentials: true });
        return response.data; // Returns the list of workers
    } catch (error) {
        console.error("Error fetching workers:", error);
        return callRefresh(error, () => axios.get(WORKERS_URL, { withCredentials: true }));
    }
};

// Function to get clock-in/clock-out history
export const getClockHistory = async () => {
    try {
        const response = await axios.get(CLOCK_HISTORY_URL, { withCredentials: true });
        return response.data; // Returns clock-in/clock-out history
    } catch (error) {
        console.error("Error fetching clock history:", error);
        return callRefresh(error, () => axios.get(CLOCK_HISTORY_URL, { withCredentials: true }));
    }
};

export const getManagerDashboard = async () => {
    try {
        const response = await axios.get(MANAGER_DASHBOARD_URL, { withCredentials: true });
        return response.data; // Returns manager dashboard data
    } catch (error) {
        console.error("Error fetching manager dashboard:", error);
        return callRefresh(error, () => axios.get(MANAGER_DASHBOARD_URL, { withCredentials: true }));
    }
};

export const getUserDashboard = async () => {
    try {
        const response = await axios.get(USER_DASHBOARD_URL, { withCredentials: true });
        return response.data; // Returns user dashboard data
    } catch (error) {
        console.error("Error fetching user dashboard:", error);
        return callRefresh(error, () => axios.get(USER_DASHBOARD_URL, { withCredentials: true }));
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


export const forgotPassword = async (email) => {
    try {
        const response = await axios.post(FORGOT_PASSWORD_URL, { email }, { withCredentials: true });
        return response.data; // Returns success message or error
    } catch (error) {
        console.error("Error requesting password reset:", error);
        return { success: false, message: error.response?.data?.message || "An error occurred." };
    }
};

// New function: Confirm password reset
export const resetPasswordConfirm = async (uidb64, token, newPassword, confirmPassword) => {
    try {
        const response = await axios.post(
            `${RESET_PASSWORD_URL}${uidb64}/${token}/`, // Append uidb64 and token to the URL
            { new_password: newPassword, confirm_password: confirmPassword },
            { withCredentials: true }
        );
        return response.data; // Returns success message or error
    } catch (error) {
        console.error("Error resetting password:", error);
        return { success: false, message: error.response?.data?.message || "An error occurred." };
    }
};

//register manager

export const registerManager = async (username, email, password, first_name, last_name, company_name,work_location ) => {
    try {
        const response = await axios.post(REGISTER_URL_MANAGER, 
            { username, email, password, first_name, last_name, company_name, work_location },
            { withCredentials: true }
        );
        return response.data; 
    } catch (error) {
        console.error("Error registering Manager:", error);
        return null;
    }


};

export const loginManager = async (username, password) => { 
    try {
        const response = await axios.post(LOGIN_URL_MANAGER, { username, password }, { withCredentials: true });    
        return response.data.success;
    }   catch (error) {
        console.error("Error logging in:", error);
        return false;
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
        // Structure the data to match the expected format for the API
        const dataToUpdate = {
            user: {
                username: profileData.username,
                email: profileData.email,
                first_name: profileData.first_name,
                last_name: profileData.last_name,
            },
            user_profile: {
                phone_number: profileData.phone_number,
                gender: profileData.gender,
                current_address: profileData.current_address,
                permanent_address: profileData.permanent_address,
                city_town: profileData.city_town,
            }
        };

        const response = await axios.put(USER_PROFILE_URL, dataToUpdate, { withCredentials: true });
        return response.data;
    } catch (error) {
        console.error("Error updating user profile:", error);
        return callRefresh(error, () => axios.put(USER_PROFILE_URL, dataToUpdate, { withCredentials: true }));
    }
};


export const getManagerProfile = async () => {
    try {
        const response = await axios.get(MANAGER_PROFILE_URL, { withCredentials: true });
        return response.data;
    } catch (error) {
        console.error("Error fetching manager profile:", error);
        return callRefresh(error, () => axios.get(MANAGER_PROFILE_URL, { withCredentials: true }));
    }
};

export const updateManagerProfile = async (profileData) => {
    try {
        const dataToUpdate = {
            user: {
                username: profileData.username,
                email: profileData.email,
                first_name: profileData.first_name,
                last_name: profileData.last_name,
            },
            company_name: profileData.company_name, // Move to top level
            work_location: profileData.work_location, // Move to top level
        };

        const response = await axios.put(MANAGER_PROFILE_URL, dataToUpdate, { withCredentials: true });

       
        return response.data;
    } catch (error) {
        console.error("Error updating manager profile:", error);
        return callRefresh(error, () => axios.put(MANAGER_PROFILE_URL, dataToUpdate, { withCredentials: true }));
    }
};

export const clockIn = async (taskId) => {
    try {
        const response = await axios.post(CLOCK_IN_URL, { task_id: taskId }, { withCredentials: true });
        console.log('Clocked in:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error clocking in:', error);
        return callRefresh(error, () => axios.post(CLOCK_IN_URL, { task_id: taskId }, { withCredentials: true }));
    }
};

export const clockOut = async (taskId) => {
    try {
        const response = await axios.post(CLOCK_OUT_URL, { task_id: taskId }, { withCredentials: true });
        console.log('Clocked out:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error clocking out:', error);
        return callRefresh(error, () => axios.post(CLOCK_OUT_URL, { task_id: taskId }, { withCredentials: true }));
    }
};



export const assignTask = async (taskData) => {
    try {
        const response = await axios.post(ASSIGN_TASK_URL, taskData, { withCredentials: true });
        return response.data; // Return success message or task details
    } catch (error) {
        console.error("Error assigning task:", error);
        return null; // Handle error appropriately
    }
};

export const getUserTasks = async () => {
    try {
        const response = await axios.get(GET_TASKS_URL, { withCredentials: true });
        return response.data; // Return the list of tasks assigned to the user
    } catch (error) {
        console.error("Error fetching user tasks:", error);
        throw error; // Rethrow error for handling in context or component
    }
};
