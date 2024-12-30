
import './App.css';
import{ BrowserRouter as Router, Routes, Route} from "react-router-dom"

import Login from './routes/login';
import Menu from './routes/menu';
import PrivateRoute from './components/PrivateRoute';

import Register from './routes/register';
import { AuthProvider} from './context/useAuth' ;

function App() {
  return (
    
    <Router>
      <AuthProvider>
      <Routes>
        <Route path='/login' element={<Login/>}/>
        <Route path='/register/' element={<Register/>}/>
        <Route path='/' element={<PrivateRoute><Menu/></PrivateRoute>}/>
      </Routes>
      </AuthProvider>
    </Router>
    
  );
}

export default App;
