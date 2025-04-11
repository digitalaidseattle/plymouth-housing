import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from './contexts/UserContext';
import { USER_ROLES } from '../types/constants';

export const RouteHandler: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = React.useContext(UserContext);
  
  useEffect(() => {
    if (!user) return; // Don't redirect if user data hasn't loaded yet
    
    // Admin users shouldn't be on the root or volunteer-home page
    if (user?.userRoles?.includes(USER_ROLES.ADMIN)) {
      if (location.pathname === '/' || location.pathname === '/volunteer-home') {
        navigate('/inventory', { replace: true }); // Using replace to prevent back-button issues
      }
    } 
    // Non-admin users who try to access protected routes can be handled here too if needed
  }, [user, navigate, location.pathname]);
  
  return null;
};

// Create a protected route component to prevent rendering of volunteer pages for admin users
export const ProtectedRoute: React.FC<{
  element: React.ReactNode;
  allowedRoles?: string[];
  fallbackPath?: string;
}> = ({ element, allowedRoles = [], fallbackPath = '/inventory' }) => {
  const { user } = React.useContext(UserContext);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!user) return; // Wait for user data
    
    const userRoles = user.userRoles || [];
    const isAdmin = userRoles.includes(USER_ROLES.ADMIN);
    
    // If this is a volunteer-only route and user is admin, redirect to fallback
    if (allowedRoles.includes('VOLUNTEER_ONLY') && isAdmin) {
      navigate(fallbackPath, { replace: true });
    }
  }, [user, navigate, allowedRoles, fallbackPath]);
  
  return <>{element}</>;
};
