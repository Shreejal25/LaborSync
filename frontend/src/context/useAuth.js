import { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  useCallback 
} from "react";
import { 
  
  login, 
  register, 
  getUserProfile, 
  updateUserProfile,
  assignTask,
  getUserTasks,
  registerManager,
  loginManager,
  getManagerProfile,
  updateManagerProfile,
  getClockHistory,
  getWorkers,
  getUserRole
} from "../endpoints/api"; // Import additional info function
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null); // State for user profile
  const [managerProfile, setManagerProfile] = useState(null); // State for manager profile
  const [userTasks, setUserTasks] = useState([]); // State for user tasks
  const [clockHistory, setClockHistory] = useState([]); // State for clock history
  const [workers, setWorkers] = useState([]); // State for workers
  const [userRole, setUserRole] = useState(null); // State for storing user role

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








  // const loginUser = async (username, password) => {
  //   try {
  //     const success = await login(username, password);
  
  //     if (success) {
  //       setIsAuthenticated(true);
  
  //       // Ensure fetchUserProfile() completes before navigating
  //       const userProfile = await fetchUserProfile(); 
  
  //       if (userProfile && userProfile.groups) {
  //         console.log("User Groups:", userProfile.groups); // Debugging: Check groups in console
  
  //         if (userProfile.groups.includes("manager")) {
  //           navigate("/manager-dashboard"); // Redirect to Manager Dashboard
  //         } else {
  //           navigate("/menu"); // Redirect to Normal User Dashboard
  //         }
  //       } else {
  //         console.error("User profile is undefined or missing groups.");
  //         alert("Failed to fetch user group. Please try again.");
  //       }
  //     } else {
  //       setIsAuthenticated(false);
  //       alert("Invalid username or password");
  //     }
  //   } catch (error) {
  //     console.error("Login failed:", error);
  //     setIsAuthenticated(false);
  //     alert("Login failed. Please try again.");
  //   }
  // };
  
  


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
        await register(username, email, password, first_name, last_name);
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

   // Register manager with personal information
   const registerNewManager = async (username, email, password,cPassword, first_name, last_name, company_name, work_location) => {
     if (password === cPassword) { // Add any necessary validation here
       try {
         await registerManager(username, email, password, first_name, last_name, company_name, work_location);
         alert("Successfully registered manager");
         navigate('/login-manager'); // Redirect to login page after successful registration
       } catch (error) {
         console.error("Registration failed:", error);
         alert("Error registering manager. Please try again.");
       }
     } else {
       alert("Invalid input");
     }
   };

   // Login manager and update authentication state
   const loginManagerUser = async (username, password) => {
     try {
       const success = await loginManager(username, password);
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

   // Fetch Manager profile
  const fetchManagerProfile = useCallback(async () => {
    try {
      const profile = await getManagerProfile();
      setManagerProfile(profile);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  }, []);

  // Fetch workers
const fetchWorkers = useCallback(async () => {
  try {
    const workersData = await getWorkers(); // API call to get workers
    setWorkers(workersData); // Update state with fetched workers
  } catch (error) {
    console.error("Error fetching workers:", error);
  }
}, []);

// Fetch clock history
const fetchClockHistory = useCallback(async () => {
  try {
    const clockHistoryData = await getClockHistory(); // API call to get clock history
    setClockHistory(clockHistoryData); // Update state with fetched clock history
  } catch (error) {
    console.error("Error fetching clock history:", error);
  }
}, []);

const fetchUserRole = useCallback(async () => {
  try {
    const role = await getUserRole(); // Call the API function to get the user's role
    setUserRole(role); // Set the role in the state
  } catch (error) {
    console.error("Error fetching user role:", error);
  }
}, []);



// Update manager profile
    // AuthContext.js
const updateManagerProfileData= async (profileData) => {
  try {
    const updatedProfile = await updateManagerProfile(profileData); // Call the API function
    setManagerProfile(updatedProfile); // Now you can use setManagerProfile
    return updatedProfile; // Return the updated profile data
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error; // Re-throw the error
  }
};

   // Assign a task to a user by username
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

  //  const fetchDashboard = useCallback(async () => {
  //   try {
  //     if (userRole === "manager") {
  //       // If the user is a manager, fetch manager-specific dashboard data
  //       const dashboardData = await getManagerDashboard(); // Replace with the actual API call for manager's dashboard
  //       return dashboardData; // Return the fetched dashboard data
  //     } else {
  //       // If the user is not a manager, you can either show an error or return a default response
  //       alert("You are not authorized to access the manager's dashboard.");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching dashboard:", error);
  //   }
  // }, [userRole]);
  

   useEffect(() => {
     if (isAuthenticated) {
       fetchUserTasks(); // Fetch tasks when authenticated
       fetchUserRole(); // Fetch user role when authenticated
       fetchUserProfile(); // Fetch user profile when authenticated

       if (userRole === "manager") {
        fetchDashboard(); // Fetch manager dashboard
      }
     }
   }, [isAuthenticated, fetchUserTasks]);

   return (
     <AuthContext.Provider value={{ 
       isAuthenticated,
       loading,
       loginUser,
       registerUser,
       registerNewManager,
       loginManagerUser,
       userRole,
       userProfile,
       managerProfile,
       fetchUserProfile,
       fetchManagerProfile,
       updateManagerProfileData,
       updateProfile,
       assignTaskToUser,
       userTasks,
       fetchUserTasks,
       fetchClockHistory,
       fetchWorkers,
       
       clockHistory,
       workers
     }}>
       {children}
     </AuthContext.Provider>
   );
};

export const useAuth = () => useContext(AuthContext);
