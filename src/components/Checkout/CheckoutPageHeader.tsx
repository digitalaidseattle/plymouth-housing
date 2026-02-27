import { Dispatch, SetStateAction } from 'react';
import { Box, Button, useTheme } from '@mui/material';
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
      : `${residentInfo.building.code} - ${residentInfo.unit.unit_number} - ${residentInfo.name} (last visit: ${residentInfo.lastVisitDate ? new Date(residentInfo.lastVisitDate).toLocaleDateString() : 'none'})`;

  return (
    <Box
      sx={{
        position: 'sticky',
        top: '3.5rem',
        zIndex: 2,
        p: 1,
        background: theme.palette.common.white,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'end',
          p: 1,
        }}
      >
        <Button
          variant="outlined"
          color={residentInfoIsMissing ? 'error' : 'primary'}
          onClick={onResidentInfoClick}
        >
          {residentLabel}
        </Button>
        <SearchBar
          data={data}
          setSearchData={setSearchData}
          setSearchActive={setSearchActive}
        />
      </Box>
      {!searchActive && checkoutType === 'general' && (
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
      )}
    </Box>
  );
};

export default CheckoutPageHeader;
