/**
 *  index.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { useContext } from 'react';

// material-ui
import { Box, Button, useMediaQuery, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';

// project import, it's for post-MVP so we comment it out for now
// import toolbarItems from '../../../../toolbar-items';
import MobileSection from './MobileSection';
import Profile from './Profile';
import VolunteerSwitcher from './VolunteerSwitcher';
import { UserContext } from '../../../../components/contexts/UserContext';
import { getHomePath } from '../../../../utils/userUtils';

// ==============================|| HEADER - CONTENT ||============================== //

const HeaderContent = () => {
  const theme = useTheme();
  const matchesXs = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useContext(UserContext);
  return (
    <>
      {matchesXs && <Box sx={{ width: '100%', ml: 1 }} />}
      {user?.userRoles?.includes('volunteer') && <VolunteerSwitcher />}
      {/* We hide the notification bell for now as it's for post-MVP*/}
      {/* {toolbarItems.items} */}
      <Box sx={{ flexGrow: 1 }} />
      <Button
        component={Link}
        to={getHomePath(user)}
        startIcon={<HomeOutlined />}
      >
        Home
      </Button>
      {!matchesXs && <Profile />}
      {matchesXs && <MobileSection />}
    </>
  );
};

export default HeaderContent;
