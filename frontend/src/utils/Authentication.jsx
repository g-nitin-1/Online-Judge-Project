import { Navigate } from 'react-router-dom';
import { getStoredUser } from './session';

export const Authentication = ({ children }) => {
  if(!getStoredUser()){
    return <Navigate to="/login" replace />;

  }
  
  return children;
};
