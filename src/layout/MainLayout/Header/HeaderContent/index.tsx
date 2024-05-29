// material-ui
import { Box, useMediaQuery, useTheme } from '@mui/material';

// project import
import toolbarItems from '../../../../toolbar-items';
import MobileSection from './MobileSection';
import Profile from './Profile';
import Search from './Search';

// ==============================|| HEADER - CONTENT ||============================== //

const HeaderContent = () => {
  const theme = useTheme();
  const matchesXs = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <>
      {!matchesXs && <Search />}
      {matchesXs && <Box sx={{ width: '100%', ml: 1 }} />}
      {toolbarItems.items}
      {!matchesXs && <Profile />}
      {matchesXs && <MobileSection />}
    </>
  );
};

export default HeaderContent;
