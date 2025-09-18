import React from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext, getRole } from './contexts/UserContext';
import { ROLE_PAGES } from '../types/constants';
import Page404 from '../pages/error/404';

interface RootRedirectProps {
  source: string;
  children: React.ReactNode;
}

export const RootRedirect: React.FC<RootRedirectProps> = ({ source, children }) => {
  const { user, isLoading } = React.useContext(UserContext);

  // This handles the situation when the userContext does not have a user set yet. 
  if (isLoading) {
    return <div>Loading...</div>;
  }

  let userRole: string | null = null;  
  if (user) {  
    try {  
      userRole = getRole(user);  
    } catch {  
      return <LogoutRedirect />;  
    }  
  }else{
      return <LogoutRedirect />;  
  }

  const alternateRole = userRole === 'admin' ? 'volunteer' : 'admin';
  // Pages that are accessible by this role
  const permittedPages: readonly string[] = userRole ? ROLE_PAGES[userRole as keyof typeof ROLE_PAGES] : [];
  // Pages that are only accessible by another role 
  const nonPermittedPages: readonly string[] = ROLE_PAGES[alternateRole as keyof typeof ROLE_PAGES]
    .filter(page =>
      !(ROLE_PAGES[userRole as keyof typeof ROLE_PAGES] as readonly string[]).includes(page)
    );

  if (permittedPages.includes(source)) {
    // Permitted page: go to that page
    return <>{children}</>;
  } else {
    if (nonPermittedPages.includes(source)) {
      // No permission: redirect to first page of permitted pages
      return <Navigate to={`/${permittedPages[0]}`} replace />;
    } else {
      // Invalid address: redirect to 404
      return <Page404 />;
    }
  }
};

function LogoutRedirect() {
  React.useEffect(() => {
    localStorage.clear();
    window.location.href = "/.auth/logout?post_logout_redirect_uri=/login.html";
  }, []);
  return null;
}