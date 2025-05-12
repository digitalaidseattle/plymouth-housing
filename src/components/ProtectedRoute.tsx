import React from 'react';
import { Navigate } from 'react-router-dom';
import { getRole, UserContext } from './contexts/UserContext';
import { ROLE_PAGES, USER_ROLES } from '../types/constants';

interface ProtectedRouteProps {
  pageId: string;
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ pageId, children }) => {
  const { user } = React.useContext(UserContext);
    
  if (!user) {
    return  <Navigate to='/pick-your-name' replace />;
  }

  const role = getRole(user);
  const permittedPages = ROLE_PAGES[role as keyof typeof ROLE_PAGES];

  // Check if the current page is permitted for this user's role
  if (pageId === 'root' || permittedPages.includes(pageId)) {
      return <>{children}</>;
  } else {
      // Redirect to the first permitted page for this role
      return <Navigate to={`/${permittedPages[0]}`} replace />;
  }
};

export default ProtectedRoute;