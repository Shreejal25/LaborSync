import { 
  createContext, 
  useContext, 
  useState, 
  useEffect 
} from "react";
import { 
  is_authenticated, 
  login, 
  register, 
} from "../endpoints/api"; // Import additional info function
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Initialize navigate

  // Check if the user is authenticated
  const getAuthenticated = async () => {
    try {
      const success = await is_authenticated();
      setIsAuthenticated(success);
    } catch (error) {
      console.error("Authentication check failed:", error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAuthenticated(); // Call getAuthenticated when the component mounts
  }, []);

  // Login user and update authentication state
  const loginUser = async (username, password) => {
    try {
      const success = await login(username, password);
      if (success) {
        setIsAuthenticated(true);
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
  const register_user = async (username, email, password, cPassword, first_name, last_name) => {
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

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      loading, 
      loginUser, 
      register_user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
