import { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  useCallback 
} from "react";
import { 
  isAuthenticated, 
  login, 
  register, 
  getUserProfile, 
  updateUserProfile,
  assignTask,
  getUserTasks
} from "../endpoints/api"; // Import additional info function
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null); // State for user profile
  const [userTasks, setUserTasks] = useState([]); // State for user tasks
  const navigate = useNavigate(); // Initialize navigate

  // Check if the user is authenticated
  const getAuthenticated = useCallback(async () => {
    try {
      const success = await isAuthenticated();
      setIsAuthenticated(success);
      if (success) {
        await fetchUserProfile(); // Fetch user profile if authenticated
      }
    } catch (error) {
      console.error("Authentication check failed:", error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false); // Ensure loading is set to false after check
    }
  }, []);

  useEffect(() => {
    getAuthenticated(); // Call getAuthenticated when the component mounts
  }, [getAuthenticated]);

  // Login user and update authentication state
  const loginUser = async (username, password) => {
    try {
      const success = await login(username, password);
      if (success) {
        setIsAuthenticated(true);
        await fetchUserProfile(); // Fetch user profile on successful login
        navigate('/'); // Redirect to home page on successful login
      } else {
        setIsAuthenticated(false);
        alert("Invalid username or password");
      }
    } catch (error) {
      console.error("Login failed:", error);
      setIsAuthenticated(false);
      alert("Login failed. Please try again.");
    }
  };

  // Register user with personal information
  const registerUser = async (username, email, password, cPassword, first_name, last_name) => {
    if (password === cPassword) {
      try {
        await registerUser(username, email, password, first_name, last_name);
        alert("Successfully registered user");
        navigate('/login'); // Redirect to login page after successful registration
      } catch (error) {
        console.error("Registration failed:", error);
        alert("Error registering user. Please try again.");
      }
    } else {
      alert("Passwords don't match");
    }
  };

  // Fetch user profile
  const fetchUserProfile = useCallback(async () => {
    try {
      const profile = await getUserProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  }, []);

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const updatedProfile = await updateUserProfile(profileData);
      setUserProfile(updatedProfile);
      alert("Profile updated successfully");
    } catch (error) {
      console.error("Error updating user profile:", error);
      alert("Error updating profile. Please try again.");
    }
  };

  //assigning task to user by manager

  const assignTaskToUser = async (taskData) => {
    try {
      const result = await assignTask(taskData); // Call the API function to assign the task
      if (result) {
        alert('Task assigned successfully!');
        return result; // Return the result if needed for further processing
      } else {
        alert('Failed to assign task.');
      }
    } catch (error) {
      console.error('Error assigning task:', error);
      alert('Error assigning task. Please try again.');
    }
  };


  const fetchUserTasks = useCallback(async () => {
    try {
      const tasks = await getUserTasks(); // Call the API function to get tasks
      setUserTasks(tasks); // Update state with fetched tasks
    } catch (error) {
      console.error("Error fetching user tasks:", error);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserTasks(); // Fetch tasks when authenticated
    }
  }, [isAuthenticated, fetchUserTasks]);


  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      loading, 
      loginUser, 
      registerUser, 
      userProfile, 
      fetchUserProfile, 
      updateProfile,
      assignTaskToUser,
      userTasks, // Expose user tasks in context
      fetchUserTasks // Expose fetchUserTasks in context
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);