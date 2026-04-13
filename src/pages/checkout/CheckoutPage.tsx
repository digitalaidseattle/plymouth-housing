import { useState, useContext, useMemo, useEffect } from 'react';
import { Box, useTheme, Chip, Button } from '@mui/material';
import { CategoryProps, CheckoutItemProp, CheckoutType, ResidentInfo, CheckoutTransaction, TransactionItem } from '../../types/interfaces';
import { UserContext } from '../../components/contexts/UserContext';
import { getTransaction } from '../../services/checkoutService';
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
  editTransaction?: CheckoutTransaction;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({
  checkoutType = 'general',
  editTransaction,
}) => {
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

  const { activeSection, setActiveSection, addItemToCart, removeItemFromCart } =
    useCartOperations({ checkoutItems, setCheckoutItems });

  const [residentInfo, setResidentInfo] = useState<ResidentInfo>(() =>
    editTransaction
      ? {
          id: editTransaction.resident_id,
          name: editTransaction.resident_name,
          unit: { id: 0, unit_number: editTransaction.unit_number },
          building: {
            id: editTransaction.building_id,
            code: editTransaction.building_code,
            name: editTransaction.building_name,
          },
          lastVisitDate: null,
        }
      : {
          id: 0,
          name: '',
          unit: { id: 0, unit_number: '' },
          building: { id: 0, code: '', name: '' },
          lastVisitDate: null,
        },
  );

  const originalTransactionId = editTransaction?.transaction_id ?? null;
  const [originalTransactionItems, setOriginalTransactionItems] = useState<TransactionItem[]>([]);
  const [showResidentDetailDialog, setShowResidentDetailDialog] = useState<boolean>(!editTransaction);

  // Fetch full transaction details (items + headers) when editing a transaction
  useEffect(() => {
    let mounted = true;
    const fetchTransaction = async () => {
      if (!editTransaction) return;
      try {
          const result = await getTransaction(user, editTransaction.transaction_id);
          const detail = result?.value;
          if (detail && detail.items && Array.isArray(detail.items)) {
            const items: TransactionItem[] = detail.items;
            if (mounted) {
              setOriginalTransactionItems(items);
              setResidentInfo((prev) => ({
                id: detail.resident_id ?? prev.id,
                name: detail.resident_name ?? prev.name,
                unit: { id: prev.unit.id, unit_number: detail.unit_number ?? prev.unit.unit_number },
                building: {
                  id: detail.building_id ?? prev.building.id,
                  code: detail.building_code ?? prev.building.code,
                  name: detail.building_name ?? prev.building.name,
                },
                lastVisitDate: prev.lastVisitDate,
              }));
            }
          }
      } catch (err) {
        showSnackbar('Failed to load transaction details', 'warning');
      }
    };
    fetchTransaction();
    return () => { mounted = false; };
  }, [editTransaction, user]);

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

  const handleDiscardEdits = () => {
    navigate('/history');
  };

  return (
    <>
      {editTransaction && (
        <Box sx={{ px: 2, py: 1 }}>
          <Chip
            size="small"
            variant="outlined"
            sx={{
              color: theme.palette.text.secondary,
              borderColor: theme.palette.grey[300],
              backgroundColor: 'transparent',
            }}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box component="span">Editing transaction</Box>
                <Button size="small" variant="text" color="primary" onClick={handleDiscardEdits}>
                  Discard
                </Button>
              </Box>
            }
          />
        </Box>
      )}
      {showResidentDetailDialog && checkoutType === 'general' && (
        <ResidentDetailDialog
          showDialog={showResidentDetailDialog}
          handleShowDialog={() => setShowResidentDetailDialog(!showResidentDetailDialog)}
          buildings={buildings}
          unitNumberValues={unitNumberValues}
          setUnitNumberValues={setUnitNumberValues}
          residentInfo={residentInfo}
          setResidentInfo={setResidentInfo}
          isEditMode={!!editTransaction}
          onDiscardEdits={handleDiscardEdits}
        />
      )}
      {showResidentDetailDialog && checkoutType === 'welcomeBasket' && (
        <WelcomeBasketBuildingDialog
          showDialog={showResidentDetailDialog}
          handleShowDialog={() => setShowResidentDetailDialog(!showResidentDetailDialog)}
          buildings={buildings}
          setResidentInfo={setResidentInfo}
          isEditMode={!!editTransaction}
          onDiscardEdits={handleDiscardEdits}
        />
      )}
      {showAdditionalNotesDialog && (
        <AdditionalNotesDialog
          showDialog={showAdditionalNotesDialog}
          handleShowDialog={() => setShowAdditionalNotesDialog(!showAdditionalNotesDialog)}
          item={selectedItem}
          addItemToCart={(item) => addItemToCart(item, 1, 'Appliance', 'general')} // TODO: replace 'Appliance' with CATEGORY_IDS.APPLIANCE when addItemToCart is updated to use category IDs
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
              addItemToCart(item, 1, 'Home Goods', 'general'); // TODO: replace 'Home Goods' with CATEGORY_IDS.HOME_GOODS when addItemToCart is updated to use category IDs
            } else {
              addItemToCart(item, 1, 'Appliance', 'general'); // TODO: replace 'Appliance' with CATEGORY_IDS.APPLIANCE when addItemToCart is updated to use category IDs
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
          activeSection={activeSection}
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
          addItemToCart={(item, quantity, category) =>
            addItemToCart(item, quantity, category, activeSection)
          }
          setCheckoutItems={setCheckoutItems}
          removeItemFromCart={removeItemFromCart}
          selectedBuildingCode={residentInfo.building.code}
          setActiveSection={setActiveSection}
          fetchData={fetchData}
          residentInfo={residentInfo}
          setResidentInfo={setResidentInfo}
          activeSection={activeSection}
          originalTransactionId={originalTransactionId}
          isEditMode={!!editTransaction}
          originalTransactionItems={originalTransactionItems}
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
