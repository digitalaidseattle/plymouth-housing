import React from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from './contexts/UserContext';
import { USER_ROLES } from '../types/constants';
import VolunteerHome from '../pages/VolunteerHome';
import People from '../pages/people';
import MainContainer from './MainContainer';

export const RootRedirect = ({ source }: { source: string }) => {
  const { user } = React.useContext(UserContext);
  
  if (source === 'root' || source === 'volunteer-home') {
    // If user is admin, redirect to inventory
    if (user?.userRoles?.includes(USER_ROLES.ADMIN)) {
      return <Navigate to="/inventory" replace />;
    } 
    // Otherwise, show volunteer home
    return (
      <MainContainer title="Volunteer Home">
        <VolunteerHome />
      </MainContainer>
    );

  } else if (source === 'people') {
    // If user is volunteer, redirect to volunteer-home
    if (user?.userRoles?.includes(USER_ROLES.VOLUNTEER)) {
      return <Navigate to="/volunteer-home" replace />;
    } 
    // Otherwise, show people 
    return (
      <MainContainer title="People">
        <People />
      </MainContainer>
    );
  }
};
