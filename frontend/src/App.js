import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from './routes/login';
import UserDashboard from './routes/menu';
import PrivateRoute from './components/PrivateRoute';
import UserProfile from './routes/UserProfilePage';
import ManagerProfilePage from './routes/Manager Routes/ManagerProfile';
import Register from './routes/register';
import AssignTaskComponent from './routes/AssignTaskComponent';
import RegisterManager from './routes/Manager Routes/ManagerRegister';
import ManagerLogin from './routes/Manager Routes/ManagerLogin';
import ForgotPassword from './routes/ForgotPassword';
import ResetPassword from './routes/ResetPassword';
import ManagerDashboard from './routes/Manager Routes/ManagerDashboard';
import UserTasksComponent from './routes/UserTasksComponent';
import RoleProtectedRoute from './routes/Components/RoleProtectedRoute';
import Unauthorized from './routes/Components/unauthorized';
import CreateProject from './routes/Manager Routes/Project';
import AddUserProfile from './routes/AddUserProfile';
import WorkerProjectsPage from './routes/WorkerProjectsPage';


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
          
          
          <Route path='/view-task' element={<PrivateRoute><UserTasksComponent /></PrivateRoute>} />
          <Route path='/view-project' element={<PrivateRoute><WorkerProjectsPage /></PrivateRoute>} />
          
          
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
         <Route 
          path="/add-user-profile" 
          element={

            <RoleProtectedRoute role="user">
              <AddUserProfile />
            </RoleProtectedRoute>
          } 
        />
        <Route 
          path="/user-profile" 
          element={

            <RoleProtectedRoute role="user">
              <UserProfile />
            </RoleProtectedRoute>
          } 
        />
       
        <Route 
          path="/manager-dashboard" 
          element={
            <PrivateRoute>
            <RoleProtectedRoute role="manager">
              < ManagerDashboard />
            </RoleProtectedRoute>
          </PrivateRoute>

          } 
        />
         <Route 
          path="/assign-task" 
          element={
            <RoleProtectedRoute role="manager">
              < AssignTaskComponent />
            </RoleProtectedRoute>
          } 
        />
         <Route 
          path="/create-project" 
          element={
            <RoleProtectedRoute role="manager">
              < CreateProject />
            </RoleProtectedRoute>
          } 
        />

          <Route 
          path="/manager-profile" 
          element={
            <RoleProtectedRoute role="manager">
              < ManagerProfilePage />
            </RoleProtectedRoute>
          } 
        />
        </Routes>
        
      </AuthProvider>
    </Router>
  );
}

export default App;
