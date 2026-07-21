/**
 *  CheckoutPageHeader.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { Dispatch, SetStateAction } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  useTheme,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
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
  onRefresh: () => void;
  refreshing: boolean;
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
  onRefresh,
  refreshing,
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
        py: 1,
        mb: 2,
        width: '100%',
        background: theme.palette.common.white,
        position: 'sticky',
        top: '3.5rem',
        zIndex: 2,
      }}
    >
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          color={residentInfoIsMissing ? 'error' : 'primary'}
          onClick={onResidentInfoClick}
        >
          {residentLabel}
        </Button>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          {checkoutType === 'general' && (
            <SearchBar
              data={data}
              setSearchData={setSearchData}
              setSearchActive={setSearchActive}
              compact
            />
          )}
          <Tooltip title="Refresh inventory">
            <span>
              <IconButton
                color="primary"
                onClick={onRefresh}
                disabled={refreshing}
                aria-label="Refresh inventory"
              >
                {refreshing ? (
                  <CircularProgress size={20} />
                ) : (
                  <RefreshIcon />
                )}
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Stack>
      {!searchActive && checkoutType === 'general' && (
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
