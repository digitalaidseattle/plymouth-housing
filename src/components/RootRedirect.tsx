import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from './contexts/UserContext';
import { USER_ROLES } from '../types/constants';
import VolunteerHome from '../pages/VolunteerHome';

export const RootRedirect: React.FC = () => {
  const { user } = React.useContext(UserContext);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Short timeout to ensure user context has fully loaded
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Show nothing while loading to prevent flash of volunteer home
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  // If user is admin, redirect immediately to inventory
  if (user?.userRoles?.includes(USER_ROLES.ADMIN)) {
    return <Navigate to="/inventory" replace />;
  }
  
  // Otherwise, show volunteer home
  return <VolunteerHome />;
};
