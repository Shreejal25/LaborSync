import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from './routes/login';
import UserDashboard from './routes/menu';
import PrivateRoute from './components/PrivateRoute';
import UserProfile from './routes/UserProfilePage';
import ManagerProfilePage from './routes/ManagerProfile';
import Register from './routes/register';
import AssignTaskComponent from './routes/AssignTaskComponent';
import RegisterManager from './routes/ManagerRegister';
import ManagerLogin from './routes/ManagerLogin';
import ForgotPassword from './routes/ForgotPassword';
import ResetPassword from './routes/ResetPassword';
import ManagerDashboard from './routes/ManagerDashboard';
import UserTasksComponent from './routes/UserTasksComponent';
import RoleProtectedRoute from './routes/Components/RoleProtectedRoute';
import Unauthorized from './routes/Components/unauthorized';


import Home from './routes/Homepage/Home';
import { AuthProvider } from './context/useAuth';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes (Not wrapped with PrivateRoute) */}
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register/' element={<Register />} />
          <Route path='/register-manager' element={<RegisterManager />} />
          <Route path='/login-manager' element={<ManagerLogin />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />

          {/* Private Routes (Wrapped with PrivateRoute) */}
          <Route path='/user-profile' element={<PrivateRoute><UserProfile /></PrivateRoute>} />
          <Route path='/manager-profile' element={<PrivateRoute><ManagerProfilePage /></PrivateRoute>} />
          <Route path='/assign-task' element={<PrivateRoute><AssignTaskComponent /></PrivateRoute>} />
          <Route path='/view-task' element={<PrivateRoute><UserTasksComponent /></PrivateRoute>} />
          
          <Route path="/manager-dashboard" element={<PrivateRoute><ManagerDashboard /></PrivateRoute>} />
          {/* Unauthorized Route */}
        <Route path="/unauthorized" element={<Unauthorized />} />
          <Route 
          path="/menu" 
          element={
            <RoleProtectedRoute role="user">
              <UserDashboard />
            </RoleProtectedRoute>
          } 
        />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
