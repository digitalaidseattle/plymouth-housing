import { useEffect } from 'react';
import { ClientPrincipal } from '../types/interfaces';

const useAuthorization = (user: ClientPrincipal | null, requiredRoles: string[]) => {

  useEffect(() => {
    if (user && !requiredRoles.some(role => user.userRoles.includes(role))) {
      window.location.href = "/.auth/logout?post_logout_redirect_uri=/non-authorized.html";
    }
  }, [user, requiredRoles]);
};

export default useAuthorization;
