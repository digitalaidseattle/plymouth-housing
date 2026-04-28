import { useState, useContext, useMemo, useEffect, useRef } from 'react';
import { Box, useTheme, Chip, Button } from '@mui/material';
import {
  CategoryProps,
  CheckoutItemProp,
  CheckoutType,
  ResidentInfo,
  EditTransactionState,
} from '../../types/interfaces';
import { UserContext } from '../../components/contexts/UserContext';
import { getLastResidentVisit } from '../../services/residentService';
import { getRole } from '../../utils/userUtils';
import { computeCartDeltas } from '../../utils/transactionUtils';
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
  editTransaction?: EditTransactionState | null;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({
  checkoutType = 'general',
  editTransaction = null,
}) => {
  const checkoutTransaction = editTransaction?.originalTransaction ?? null;
  const { user } = useContext(UserContext);
  const theme = useTheme();
  const navigate = useNavigate();

  const {
    snackbarState,
    showSnackbar,
    handleClose: handleSnackbarClose,
  } = useSnackbar();

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
    checkoutTransaction
      ? {
          id: checkoutTransaction.resident_id,
          name: checkoutTransaction.resident_name,
          unit: { id: 0, unit_number: checkoutTransaction.unit_number },
          building: {
            id: checkoutTransaction.building_id,
            code: checkoutTransaction.building_code,
            name: checkoutTransaction.building_name,
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

  const [showResidentDetailDialog, setShowResidentDetailDialog] =
    useState<boolean>(() => !editTransaction);

  // Fetch last visit date when editing an existing transaction
  useEffect(() => {
    if (!checkoutTransaction) return;
    let mounted = true;

    (async () => {
      try {
        const visitResult = await getLastResidentVisit(
          user,
          checkoutTransaction.resident_id,
        );
        const visits = visitResult?.value as
          | Array<{ transaction_date: string }>
          | undefined;
        const lastVisitDate = visits?.[0]?.transaction_date ?? null;

        if (mounted) {
          setResidentInfo((prev) => ({ ...prev, lastVisitDate }));
        }
      } catch {
        // lastVisitDate is optional, silently ignore
      }
    })();

    return () => {
      mounted = false;
    };
  }, [checkoutTransaction, user]);

  // Preload checked-out items into the checkout cart when editing an existing transaction.
  const hasPreloadedRef = useRef(false);
  useEffect(() => {
    if (!editTransaction) return;
    if (hasPreloadedRef.current) return;
    if (!data || data.length === 0) return;

    const itemsToLoad = editTransaction.effectiveItems;
    if (itemsToLoad.length === 0) return;

    const cart: CategoryProps[] = data.map((category: CategoryProps) => ({
      ...category,
      categoryCount: 0,
      items: [],
    }));

    itemsToLoad.forEach((item) => {
      const sourceCategory = data.find((cat) =>
        (cat.items || []).some((i) => i.id === item.id),
      );
      if (!sourceCategory) return;
      const itemDetails = sourceCategory.items?.find((i) => i.id === item.id);
      if (!itemDetails) return;

      const categoryIndex = cart.findIndex(
        (cat: CategoryProps) => cat.category === sourceCategory.category,
      );
      if (categoryIndex !== -1) {
        const categoryData = cart[categoryIndex];
        const categoryItems: CheckoutItemProp[] = [...categoryData.items];
        categoryItems.push({
          id: itemDetails.id,
          name: itemDetails.name,
          quantity: item.quantity,
          description: item.description || itemDetails.description || '',
          additional_notes: item.additional_notes,
        });
        const newCategoryCount = categoryItems.reduce(
          (acc, currentItem) => acc + currentItem.quantity,
          0,
        );
        cart[categoryIndex] = {
          ...categoryData,
          items: categoryItems,
          categoryCount: newCategoryCount,
        };
      }
    });

    setCheckoutItems(cart);
    hasPreloadedRef.current = true;
  }, [editTransaction, data, setCheckoutItems]);

  const residentInfoIsMissing =
    Object.entries(residentInfo).filter(
      // lastVisitDate is optional and excluded from validation, all other fields must have values
      ([key, val]) =>
        key !== 'lastVisitDate' &&
        (val === null || val === undefined || val === ''),
    ).length > 0;

  const { checkoutHistory } = useCheckoutHistory({
    user,
    residentId: residentInfo.id,
    residentInfoIsMissing,
    onError: (msg) => showSnackbar(msg, 'error'),
  });

  const [openSummary, setOpenSummary] =
    useState<boolean>(!!checkoutTransaction);
  const [showAdditionalNotesDialog, setShowAdditionalNotesDialog] =
    useState<boolean>(false);
  const [showPastCheckoutDialog, setShowPastCheckoutDialog] =
    useState<boolean>(false);
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

  const categories =
    checkoutType === 'general' ? filteredData : welcomeBasketData;

  const handleCancelEdits = () => {
    // Compare current cart against original effectiveItems
    const hasChanges =
      editTransaction && editTransaction.effectiveItems
        ? computeCartDeltas(
            checkoutItems.flatMap((cat) => cat.items),
            editTransaction.effectiveItems,
          ).length > 0
        : // In new checkout, check if cart has any items
          checkoutItems.some((category) => category.categoryCount > 0);

    if (hasChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to discard them?',
      );
      if (!confirmed) return;
    }

    const userRole = user ? getRole(user) : null;
    const navigateState = {
      state: {
        checkoutSuccess: false,
        message: 'Changes cancelled',
      },
    };

    if (userRole === 'volunteer') {
      navigate('/volunteer-home', navigateState);
    } else {
      navigate('/inventory', navigateState);
    }
  };

  return (
    <>
      {checkoutTransaction && (
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
                <Button
                  size="small"
                  variant="text"
                  color="primary"
                  id="edit-mode-header-cancel-btn"
                  onClick={handleCancelEdits}
                >
                  Cancel
                </Button>
              </Box>
            }
          />
        </Box>
      )}
      {showResidentDetailDialog && checkoutType === 'general' && (
        <ResidentDetailDialog
          showDialog={showResidentDetailDialog}
          handleShowDialog={() =>
            setShowResidentDetailDialog(!showResidentDetailDialog)
          }
          buildings={buildings}
          unitNumberValues={unitNumberValues}
          setUnitNumberValues={setUnitNumberValues}
          residentInfo={residentInfo}
          setResidentInfo={setResidentInfo}
          isEditMode={!!checkoutTransaction}
          onCancelEdits={handleCancelEdits}
        />
      )}
      {showResidentDetailDialog && checkoutType === 'welcomeBasket' && (
        <WelcomeBasketBuildingDialog
          showDialog={showResidentDetailDialog}
          handleShowDialog={() =>
            setShowResidentDetailDialog(!showResidentDetailDialog)
          }
          buildings={buildings}
          setResidentInfo={setResidentInfo}
          isEditMode={!!checkoutTransaction}
          onCancelEdits={handleCancelEdits}
        />
      )}
      {showAdditionalNotesDialog && (
        <AdditionalNotesDialog
          showDialog={showAdditionalNotesDialog}
          handleShowDialog={() =>
            setShowAdditionalNotesDialog(!showAdditionalNotesDialog)
          }
          item={selectedItem}
          addItemToCart={(item) =>
            addItemToCart(item, 1, 'Appliance', 'general')
          } // TODO: replace 'Appliance' with CATEGORY_IDS.APPLIANCE when addItemToCart is updated to use category IDs
          residentInfo={residentInfo}
          checkoutHistory={checkoutHistory}
        />
      )}
      {showPastCheckoutDialog && (
        <PastCheckoutDialog
          showDialog={showPastCheckoutDialog}
          handleShowDialog={() =>
            setShowPastCheckoutDialog(!showPastCheckoutDialog)
          }
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
          editTransaction={editTransaction ?? undefined}
          onCancelEdits={handleCancelEdits}
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
