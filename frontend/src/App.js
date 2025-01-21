
import './App.css';
import{ BrowserRouter as Router, Routes, Route} from "react-router-dom"

import Login from './routes/login';
import Menu from './routes/menu';
import PrivateRoute from './components/PrivateRoute';
import UserProfile from './routes/UserProfilePage';
import Register from './routes/register';
import AssignTaskComponent from './routes/AssignTaskComponent';

import UserTasksComponent from './routes/UserTasksComponent';

import { AuthProvider} from './context/useAuth' ;

function App() {
  return (
    
    <Router>
      <AuthProvider>
      <Routes>
        <Route path='/login' element={<Login/>}/>
        <Route path='/register/' element={<Register/>}/>
        <Route path='/user-profile' element={<UserProfile/>}/>
        <Route path='/assign-task' element={<AssignTaskComponent/>}/>
        <Route path='/view-task' element={<UserTasksComponent/>}/>
        <Route path='/'element={<PrivateRoute><Menu/></PrivateRoute>}/>
      </Routes>
      </AuthProvider>
    </Router>
    
  );
}

export default App;
