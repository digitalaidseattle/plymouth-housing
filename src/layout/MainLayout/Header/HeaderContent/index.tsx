import { useContext } from 'react';

// material-ui
import { Box, useMediaQuery, useTheme } from '@mui/material';

// project import
// import toolbarItems from '../../../../toolbar-items';
import MobileSection from './MobileSection';
import Profile from './Profile';
import VolunteerSwitcher from './VolunteerSwitcher';
import { UserContext } from '../../../../components/contexts/UserContext';

// ==============================|| HEADER - CONTENT ||============================== //

const HeaderContent = () => {
  const theme = useTheme();
  const matchesXs = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useContext(UserContext);
  return (
    <>
      {matchesXs && <Box sx={{ width: '100%', ml: 1 }} />}
      {user?.roles?.includes('volunteer') && <VolunteerSwitcher />}
      {/* {toolbarItems.items} */}
      <Box sx={{ flexGrow: 1}}  />
      {!matchesXs && <Profile />}
      {matchesXs && <MobileSection />}
    </>
  );
};

export default HeaderContent;
