
import './App.css';
import{ BrowserRouter as Router, Routes, Route} from "react-router-dom"

import Login from './routes/login';
import Menu from './routes/menu';
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

import Home from './routes/Homepage/Home';
import { AuthProvider} from './context/useAuth' ;


function App() {
  return (
    
    <Router>
      <AuthProvider>
      <Routes>
      <Route path='/' element={<Home/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/register/' element={<Register/>}/>
        <Route path='/register-manager' element={<RegisterManager/>}/>
        <Route path='/login-manager' element={<ManagerLogin/>}/>
        <Route path='/forgot-password' element={<ForgotPassword/>}/>
        <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />

        <Route path='/user-profile' element={<UserProfile/>}/>
        <Route path='/manager-profile' element={<ManagerProfilePage/>}/>
        <Route path='/assign-task' element={<AssignTaskComponent/>}/>
        <Route path='/view-task' element={<UserTasksComponent/>}/>
        <Route path='/menu'element={<Menu/>}/>
        <Route path="/manager-dashboard" element={<ManagerDashboard />} />
      </Routes>
      </AuthProvider>
    </Router>
    
  );
}

export default App;
