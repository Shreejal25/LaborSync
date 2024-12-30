// src/components/PrivateRoute.js

import { useAuth } from '../context/useAuth';
import { useNavigate } from 'react-router-dom';


const PrivateRoute = ({children})=>{


  const { isAuthenticated, loading} = useAuth();
  const nav = useNavigate();
   

  if (loading){
    return <h1>Loading</h1>

  }
  if (isAuthenticated){
    return children
  }else{
    nav('/login')
  }

}

export default PrivateRoute;