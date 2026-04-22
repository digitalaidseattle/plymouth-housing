import { useState, useContext, useMemo } from 'react';
import { Box, useTheme } from '@mui/material';
import { CategoryProps, CheckoutItemProp, CheckoutType, ResidentInfo } from '../../types/interfaces';
import { UserContext } from '../../components/contexts/UserContext';
import { getRole } from '../../utils/userUtils';
import { CheckoutDialog } from '../../components/Checkout/CheckoutDialog';
import CheckoutFooter from '../../components/Checkout/CheckoutFooter';
import { useNavigate } from 'react-router-dom';
import SnackbarAlert from '../../components/SnackbarAlert';
import ResidentDetailDialog from '../../components/Checkout/ResidentDetailDialog';
import WelcomeBasketBuildingDialog from '../../components/Checkout/WelcomeBasketBuildingDialog';
import AdditionalNotesDialog from '../../components/Checkout/AdditionalNotesDialog';
import PastCheckoutDialog from '../../components/Checkout/PastCheckoutDialog';
import CheckoutPageHeader from '../../components/Checkout/CheckoutPageHeader';
import CategoryList from '../../components/Checkout/CategoryList';
import { useSnackbar } from '../../hooks/useSnackbar';
import { useCheckoutData } from '../../hooks/useCheckoutData';
import { useCheckoutHistory } from '../../hooks/useCheckoutHistory';
import { useCartOperations } from '../../hooks/useCartOperations';
import { SPECIAL_ITEMS } from '../../types/constants';

interface CheckoutPageProps {
  checkoutType?: CheckoutType;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ checkoutType = 'general' }) => {
  const { user } = useContext(UserContext);
  const theme = useTheme();
  const navigate = useNavigate();

  const { snackbarState, showSnackbar, handleClose: handleSnackbarClose } = useSnackbar();

  const {
    data,
    welcomeBasketData,
    filteredData,
    buildings,
    unitNumberValues,
    setUnitNumberValues,
    checkoutItems,
    setCheckoutItems,
    fetchData,
  } = useCheckoutData({
    user,
    checkoutType,
    onError: (msg) => showSnackbar(msg, 'warning'),
  });

  const { addItemToCart, removeItemFromCart } =
    useCartOperations({ checkoutItems, setCheckoutItems });

  const [residentInfo, setResidentInfo] = useState<ResidentInfo>({
    id: 0,
    name: '',
    unit: { id: 0, unit_number: '' },
    building: { id: 0, code: '', name: '' },
    lastVisitDate: null,
  });

  const residentInfoIsMissing =
    Object.entries(residentInfo).filter(
      // lastVisitDate is optional and excluded from validation, all other fields must have values
      ([key, val]) => key !== 'lastVisitDate' && (val === null || val === undefined || val === ''),
    ).length > 0;

  const { checkoutHistory } = useCheckoutHistory({
    user,
    residentId: residentInfo.id,
    residentInfoIsMissing,
    onError: (msg) => showSnackbar(msg, 'error'),
  });

  const [openSummary, setOpenSummary] = useState<boolean>(false);
  const [showResidentDetailDialog, setShowResidentDetailDialog] = useState<boolean>(true);
  const [showAdditionalNotesDialog, setShowAdditionalNotesDialog] = useState<boolean>(false);
  const [showPastCheckoutDialog, setShowPastCheckoutDialog] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<CheckoutItemProp>({
    id: 0,
    name: '',
    quantity: 0,
    description: '',
  });

  const [searchData, setSearchData] = useState<CategoryProps[]>([]);
  const [searchActive, setSearchActive] = useState<boolean>(false);

  const navbarData = useMemo(
    () => (checkoutType === 'general' ? filteredData : data),
    [checkoutType, filteredData, data],
  );

  const handleCheckoutSuccess = (errorMessage?: string) => {
    const isError = !!errorMessage;
    const numberOfItems = checkoutItems.reduce(
      (accumulator, category) => accumulator + category.categoryCount,
      0,
    );
    const userRole = user ? getRole(user) : null;
    const navigateState = {
      state: {
        checkoutSuccess: !isError,
        message: isError
          ? errorMessage
          : `${numberOfItems} ${
              numberOfItems === 1 ? 'item has been' : 'items have been'
            } checked out`,
      },
    };

    if (userRole === 'volunteer') {
      navigate('/volunteer-home', navigateState);
    } else {
      navigate('/inventory', navigateState);
    }
  };

  const categories = checkoutType === 'general' ? filteredData : welcomeBasketData;

  return (
    <>
      {showResidentDetailDialog && checkoutType === 'general' && (
        <ResidentDetailDialog
          showDialog={showResidentDetailDialog}
          handleShowDialog={() => setShowResidentDetailDialog(!showResidentDetailDialog)}
          buildings={buildings}
          unitNumberValues={unitNumberValues}
          setUnitNumberValues={setUnitNumberValues}
          residentInfo={residentInfo}
          setResidentInfo={setResidentInfo}
        />
      )}
      {showResidentDetailDialog && checkoutType === 'welcomeBasket' && (
        <WelcomeBasketBuildingDialog
          showDialog={showResidentDetailDialog}
          handleShowDialog={() => setShowResidentDetailDialog(!showResidentDetailDialog)}
          buildings={buildings}
          setResidentInfo={setResidentInfo}
        />
      )}
      {showAdditionalNotesDialog && (
        <AdditionalNotesDialog
          showDialog={showAdditionalNotesDialog}
          handleShowDialog={() => setShowAdditionalNotesDialog(!showAdditionalNotesDialog)}
          item={selectedItem}
          addItemToCart={(item) => addItemToCart(item, 1, 'Appliance')} // TODO: replace 'Appliance' with CATEGORY_IDS.APPLIANCE when addItemToCart is updated to use category IDs
          residentInfo={residentInfo}
          checkoutHistory={checkoutHistory}
        />
      )}
      {showPastCheckoutDialog && (
        <PastCheckoutDialog
          showDialog={showPastCheckoutDialog}
          handleShowDialog={() => setShowPastCheckoutDialog(!showPastCheckoutDialog)}
          item={selectedItem}
          addItemToCart={(item) => {
            if (item.id === SPECIAL_ITEMS.RUG) {
              addItemToCart(item, 1, 'Home Goods'); // TODO: replace 'Home Goods' with CATEGORY_IDS.HOME_GOODS when addItemToCart is updated to use category IDs
            } else {
              addItemToCart(item, 1, 'Appliance'); // TODO: replace 'Appliance' with CATEGORY_IDS.APPLIANCE when addItemToCart is updated to use category IDs
            }
          }}
          residentInfo={residentInfo}
        />
      )}

      <CheckoutPageHeader
        residentInfo={residentInfo}
        residentInfoIsMissing={residentInfoIsMissing}
        checkoutType={checkoutType}
        searchActive={searchActive}
        data={filteredData}
        navbarData={navbarData}
        setSearchData={setSearchData}
        setSearchActive={setSearchActive}
        onResidentInfoClick={() => setShowResidentDetailDialog(true)}
      />

      <Box
        sx={{
          backgroundColor: theme.palette.grey[100],
          borderRadius: '15px',
          paddingBottom: '20px',
          minHeight: '100vh',
        }}
      >
        <CategoryList
          categories={searchActive ? searchData : categories}
          checkoutItems={checkoutItems}
          sectionType={checkoutType}
          checkoutHistory={checkoutHistory}
          searchActive={searchActive}
          addItemToCart={addItemToCart}
          removeItemFromCart={removeItemFromCart}
          onApplianceMiscClick={(item) => {
            setSelectedItem(item);
            setShowAdditionalNotesDialog(true);
          }}
          onPastCheckoutClick={(item) => {
            setSelectedItem(item);
            setShowPastCheckoutDialog(true);
          }}
        />

        <CheckoutFooter
          checkoutItems={checkoutItems}
          setOpenSummary={setOpenSummary}
          selectedBuildingCode={residentInfo.building.code}
          residentInfoIsMissing={residentInfoIsMissing}
        />

        <CheckoutDialog
          open={openSummary}
          onClose={() => setOpenSummary(false)}
          onSuccess={handleCheckoutSuccess}
          onError={(msg) => showSnackbar(msg, 'warning')}
          checkoutItems={checkoutItems}
          addItemToCart={addItemToCart}
          setCheckoutItems={setCheckoutItems}
          removeItemFromCart={removeItemFromCart}
          selectedBuildingCode={residentInfo.building.code}
          fetchData={fetchData}
          residentInfo={residentInfo}
          setResidentInfo={setResidentInfo}
        />
        <SnackbarAlert
          open={snackbarState.open}
          onClose={handleSnackbarClose}
          severity={snackbarState.severity}
        >
          {snackbarState.message}
        </SnackbarAlert>
      </Box>
    </>
  );
};

export default CheckoutPage;
