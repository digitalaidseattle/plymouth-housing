import { Dispatch, SetStateAction } from 'react';
import { Box, Button, Stack, useTheme } from '@mui/material';
import {
  CategoryProps,
  CheckoutType,
  ResidentInfo,
} from '../../types/interfaces';
import SearchBar from '../Searchbar/SearchBar';
import Navbar from './Navbar';

type CheckoutPageHeaderProps = {
  residentInfo: ResidentInfo;
  residentInfoIsMissing: boolean;
  checkoutType: CheckoutType;
  searchActive: boolean;
  data: CategoryProps[];
  navbarData: CategoryProps[];
  setSearchData: Dispatch<SetStateAction<CategoryProps[]>>;
  setSearchActive: Dispatch<SetStateAction<boolean>>;
  onResidentInfoClick: () => void;
};

const CheckoutPageHeader: React.FC<CheckoutPageHeaderProps> = ({
  residentInfo,
  residentInfoIsMissing,
  checkoutType,
  searchActive,
  data,
  navbarData,
  setSearchData,
  setSearchActive,
  onResidentInfoClick,
}) => {
  const theme = useTheme();

  // Three cases: missing info, welcomeBasket (shows building code only), general (shows full resident details)
  const residentLabel = residentInfoIsMissing
    ? checkoutType === 'welcomeBasket'
      ? 'Missing Building Info'
      : 'Missing Resident Info'
    : checkoutType === 'welcomeBasket'
      ? `${residentInfo.building.code}`
      : `${residentInfo.building.code} - ${residentInfo.unit.unit_number} - ${residentInfo.name} (Last visit: ${residentInfo.lastVisitDate ? new Date(residentInfo.lastVisitDate).toLocaleDateString() : 'none'})`;

  return (
    <Box
      sx={{
        position: 'sticky',
        top: '3.5rem',
        zIndex: 2,
        py: 1,
        mb: 2,
        width: '100%',
        overflow: 'hidden',
        background: theme.palette.common.white,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
        <Button
          variant="outlined"
          color={residentInfoIsMissing ? 'error' : 'primary'}
          onClick={onResidentInfoClick}
        >
          {residentLabel}
        </Button>
        {checkoutType === 'general' && (
          <SearchBar
            data={data}
            setSearchData={setSearchData}
            setSearchActive={setSearchActive}
          />
        )}
      </Stack>
      {!searchActive && (
        <Box sx={{ my: 2 }}>
          <Navbar
            key={checkoutType}
            filteredData={navbarData}
            scrollToCategory={(id) => {
              const element = document.getElementById(id);
              if (element) {
                element.style.scrollMarginTop = '200px';
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default CheckoutPageHeader;
