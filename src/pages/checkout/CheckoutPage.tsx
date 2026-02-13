import {
  useState,
  useEffect,
  useContext,
  useCallback,
  SetStateAction,
  useRef,
} from 'react';
import { Box, Button, Grid, Typography, useTheme } from '@mui/material';
import {
  Building,
  CategoryProps,
  CheckoutItemProp,
  ResidentInfo,
  Unit,
  CheckoutHistoryItem,
  TransactionItem,
} from '../../types/interfaces';
import {
  HistoryNavigationState,
  TransactionItem as HistoryTransactionItem,
} from '../../types/history';
import { getRole, UserContext } from '../../components/contexts/UserContext';
import { CheckoutDialog } from '../../components/Checkout/CheckoutDialog';
import CategorySection from '../../components/Checkout/CategorySection';
import CheckoutFooter from '../../components/Checkout/CheckoutFooter';
import SearchBar from '../../components/Searchbar/SearchBar';
import Navbar from '../../components/Checkout/Navbar';
import CheckoutCard from '../../components/Checkout/CheckoutCard';
import { useNavigate, useLocation } from 'react-router-dom';
import SnackbarAlert from '../../components/SnackbarAlert';
import ResidentDetailDialog from '../../components/Checkout/ResidentDetailDialog';
import AdditionalNotesDialog from '../../components/Checkout/AdditionalNotesDialog';
import {
  checkPastCheckout,
  getBuildings,
} from '../../components/Checkout/CheckoutAPICalls';
import PastCheckoutDialog from '../../components/Checkout/PastCheckoutDialog';
import fetchCategorizedItems from '../../components/utils/fetchCategorizedItems';

const CheckoutPage = () => {
  const { user } = useContext(UserContext);
  const [welcomeBasketData, setWelcomeBasketData] = useState<CategoryProps[]>(
    [],
  );
  const [data, setData] = useState<CategoryProps[]>([]);
  const [searchData, setSearchData] = useState<CategoryProps[]>([]);
  const [searchActive, setSearchActive] = useState<boolean>(false);
  const [filteredData, setFilteredData] = useState<CategoryProps[]>([]);
  const [checkoutItems, setCheckoutItems] = useState<CategoryProps[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [unitNumberValues, setUnitNumberValues] = useState<Unit[]>([]);

  const [openSummary, setOpenSummary] = useState<boolean>(false);

  const [residentInfo, setResidentInfo] = useState<ResidentInfo>({
    id: 0,
    name: '',
    unit: { id: 0, unit_number: '' },
    building: { id: 0, code: '', name: '' },
  });

  const [activeSection, setActiveSection] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const [snackbarState, setSnackbarState] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'warning';
  }>({ open: false, message: '', severity: 'warning' });

  const [showResidentDetailDialog, setShowResidentDetailDialog] =
    useState<boolean>(true);
  const residentInfoIsMissing =
    Object.entries(residentInfo).filter(
      ([, val]) => val === null || val === undefined || val === '',
    ).length > 0;
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

  const [checkoutHistory, setCheckoutHistory] = useState<CheckoutHistoryItem[]>(
    [],
  );

  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [isPrefilling, setIsPrefilling] = useState(false);
  const [originalTransactionData, setOriginalTransactionData] = useState<{
    transaction_id: string;
    resident_id: number;
    items: HistoryTransactionItem[];
  } | null>(null);
  const prefilledTransactionId = useRef<string | null>(null);

  useEffect(() => {
    async function checkItemsForPrevCheckouts() {
      const tempCheckOutHistory: SetStateAction<CheckoutHistoryItem[]> = [];

      const response = await checkPastCheckout(user, residentInfo.id);

      response.value.forEach((transaction: TransactionItem) => {
        // round up quantity for appliance miscellaneous checkouts
        if (transaction.item_id === 166) {
          if (
            tempCheckOutHistory.find(
              (entry) =>
                entry.additionalNotes.toLowerCase() ===
                transaction.additional_notes.toLowerCase(),
            )
          ) {
            return;
          }
          const checkedOutQuantity = response.value
            .filter(
              (item: TransactionItem) =>
                item.additional_notes &&
                item.additional_notes.toLowerCase() ===
                  transaction.additional_notes.toLowerCase(),
            )
            .reduce(function (acc: number, transaction: { quantity: number }) {
              return acc + transaction.quantity;
            }, 0);
          tempCheckOutHistory.push({
            item_id: 166,
            timesCheckedOut: checkedOutQuantity,
            additionalNotes: transaction.additional_notes,
          });
        } else {
          // round up quantity for all other appliance/rug checkouts
          if (
            tempCheckOutHistory.find(
              (entry) => entry.item_id === transaction.item_id,
            )
          ) {
            return;
          }
          const checkedOutQuantity = response.value
            .filter(
              (item: TransactionItem) => item.item_id === transaction.item_id,
            )
            .reduce(function (acc: number, transaction: { quantity: number }) {
              return acc + transaction.quantity;
            }, 0);
          tempCheckOutHistory.push({
            item_id: transaction.item_id,
            timesCheckedOut: checkedOutQuantity,
            additionalNotes: '',
          });
        }
      });
      setCheckoutHistory(tempCheckOutHistory);
    }
    if (!residentInfoIsMissing) checkItemsForPrevCheckouts();
  }, [user, residentInfo, residentInfoIsMissing]);

  const addItemToCart = (
    item: CheckoutItemProp,
    quantity: number,
    category: string,
    section: string,
  ) => {
    // Lock active section if none is set, or allow only the active section
    if (!activeSection || activeSection === section) {
      const updatedCheckoutItems = [...checkoutItems];
      const categoryIndex = updatedCheckoutItems.findIndex(
        (cat: CategoryProps) => cat.category === category,
      );

      if (categoryIndex !== -1) {
        // Found the category
        const categoryData = updatedCheckoutItems[categoryIndex];
        const categoryItems = [...categoryData.items];
        const itemIndex = categoryItems.findIndex(
          (addedItem: CheckoutItemProp) => addedItem.id === item.id,
        );

        if (itemIndex !== -1) {
          // Update the item's quantity or remove it if quantity <= 0
          const foundItem = categoryItems[itemIndex];
          const newQuantity = foundItem.quantity + quantity;

          if (newQuantity <= 0) {
            categoryItems.splice(itemIndex, 1); // Remove item
          } else {
            categoryItems[itemIndex] = { ...foundItem, quantity: newQuantity };
          }
        } else if (quantity > 0) {
          // Add a new item to the category's items array
          categoryItems.push({ ...item, quantity });
          setActiveSection(section); // Lock the active section
        }

        // Update the category's `items` and `categoryCount`
        const newCategoryCount = categoryItems.reduce(
          (acc, currentItem) => acc + currentItem.quantity,
          0,
        );
        updatedCheckoutItems[categoryIndex] = {
          ...categoryData,
          items: categoryItems,
          categoryCount: newCategoryCount,
        };
      }

      // Update the `checkoutItems` state
      setCheckoutItems(updatedCheckoutItems);

      // Reset activeSection if the cart becomes empty
      const isCartEmpty = updatedCheckoutItems.every(
        (cat) => cat.items.length === 0,
      );
      if (isCartEmpty) {
        setActiveSection('');
      }
    }
  };

  const removeItemFromCart = (itemId: number, categoryName: string) => {
    setCheckoutItems((prevCheckoutItems) => {
      const updatedCheckoutItems = prevCheckoutItems.map((category) => {
        if (category.category === categoryName) {
          const updatedItems = category.items.filter(
            (addedItem: CheckoutItemProp) => addedItem.id !== itemId,
          );

          const updatedCategoryCount = updatedItems.reduce(
            (count, item) => count + item.quantity,
            0,
          );

          return {
            ...category,
            items: updatedItems,
            categoryCount: updatedCategoryCount,
          };
        }
        return category;
      });

      // Check if all categories are empty
      const isCartEmpty = updatedCheckoutItems.every(
        (category) => category.items.length === 0,
      );
      if (isCartEmpty) {
        setActiveSection('');
      }

      return updatedCheckoutItems;
    });
  };

  const scrollToCategory = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // margin added to the scroll position, to account for the sticky nav
      element.style.scrollMarginTop = '200px';
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const fetchBuildings = useCallback(async () => {
    try {
      const buildings = await getBuildings(user);
      setBuildings(buildings);
    } catch (error) {
      setError('Could not get buildings. \r\n' + error);
      console.error('Error fetching buildings:', error);
    }
  }, [user]);

  const fetchData = useCallback(async () => {
    try {
      const userRole = getRole(user);
      const categorizedItems = await fetchCategorizedItems(userRole);
      setData(categorizedItems);

      const cleanCheckout = categorizedItems.map((category: CategoryProps) => ({
        ...category,
        categoryCount: 0,
        items: [],
      }));

      setCheckoutItems(cleanCheckout);

      const welcomeBasket =
        categorizedItems.filter(
          (category: CategoryProps) => category.category === 'Welcome Basket',
        ) || [];
      welcomeBasket[0].items = welcomeBasket[0].items.filter(
        (item: CheckoutItemProp) =>
          item.name.toLowerCase().includes('full-size sheet set') ||
          item.name.toLowerCase().includes('twin-size sheet set'),
      );
      setWelcomeBasketData(welcomeBasket);
    } catch (error) {
      console.error('Error fetching categorized items:', error);
    }
  }, [user]);

  const handleSnackbarClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === 'clickaway') return;
    setSnackbarState({ ...snackbarState, open: false });
  };

  const handleCheckoutError = (message: string) => {
    setSnackbarState({ open: true, message, severity: 'warning' });
  };

  useEffect(() => {
    if (error) {
      setSnackbarState({ open: true, message: error, severity: 'warning' });
    }
  }, [error]);

  useEffect(() => {
    fetchBuildings();
    fetchData();
  }, [fetchData, fetchBuildings]);

  useEffect(() => {
    setFilteredData(
      data.filter((item: CategoryProps) => item.category !== 'Welcome Basket'),
    );
  }, [data]);

  // Pre-fill from history navigation
  useEffect(() => {
    const navigationState = location.state as HistoryNavigationState | null;

    if (
      navigationState?.fromHistory &&
      navigationState.checkoutData &&
      data.length > 0 &&
      buildings.length > 0
    ) {
      const { original_transaction_id } = navigationState.checkoutData;

      // Prevent re-running if we've already pre-filled this transaction
      if (prefilledTransactionId.current === original_transaction_id) {
        return;
      }

      setIsPrefilling(true);

      const {
        residentInfo: historyResidentInfo,
        items: historyItems,
        item_type,
      } = navigationState.checkoutData;

      // 1. Store original transaction data for delta calculation later
      setOriginalTransactionData({
        transaction_id: original_transaction_id,
        resident_id: historyResidentInfo.id,
        items: historyItems,
      });

      // 2. Pre-fill resident information
      const building = buildings.find(
        (b) => b.id === historyResidentInfo.building_id,
      );
      if (building) {
        setResidentInfo({
          id: historyResidentInfo.id,
          name: historyResidentInfo.name,
          building: building,
          unit: {
            id: 0,
            unit_number: historyResidentInfo.unit_number,
          },
        });
      }

      // 3. Create item lookup map for O(n) performance
      const itemLookupMap = new Map();
      data.forEach((category) => {
        category.items.forEach((item) => {
          itemLookupMap.set(item.id, { item, category: category.category });
        });
      });

      // 4. Match historical items with current inventory and add to cart
      const sectionType = item_type === 'welcome' ? 'welcomeBasket' : 'general';

      historyItems.forEach((historyItem) => {
        const lookup = itemLookupMap.get(historyItem.item_id);
        if (lookup) {
          addItemToCart(
            lookup.item,
            historyItem.quantity,
            lookup.category,
            sectionType,
          );
        } else {
          console.warn(
            `Item ${historyItem.item_name} (ID: ${historyItem.item_id}) no longer exists in inventory`,
          );
        }
      });

      // 5. Mark this transaction as pre-filled
      prefilledTransactionId.current = original_transaction_id;

      // 6. Open the checkout dialog immediately
      setOpenSummary(true);
      setIsPrefilling(false);

      // 7. Clear location state to prevent re-triggering on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state, data, buildings, addItemToCart]);

  // Clear original transaction data if resident changes
  useEffect(() => {
    if (
      originalTransactionData &&
      residentInfo.id !== originalTransactionData.resident_id
    ) {
      console.log('Resident changed - transaction will not be linked to original');
      setOriginalTransactionData(null);
    }
  }, [residentInfo.id, originalTransactionData]);

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

  return (
    <>
      {showResidentDetailDialog && !isPrefilling && (
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
          }
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
          addItemToCart={(item) =>
            addItemToCart(item, 1, 'Appliance', 'general')
          }
          residentInfo={residentInfo}
        />
      )}

      {/* Container for the sticky nav */}
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
            onClick={() => setShowResidentDetailDialog(true)}
          >
            {residentInfoIsMissing
              ? 'Missing Resident Info'
              : `${residentInfo.building.code} - ${residentInfo.unit.unit_number} - ${residentInfo.name}`}
          </Button>
          <SearchBar
            data={data}
            setSearchData={setSearchData}
            setSearchActive={setSearchActive}
          />
        </Box>
        {!searchActive && (
          <Navbar
            filteredData={filteredData}
            scrollToCategory={scrollToCategory}
          />
        )}
      </Box>

      <Box
        sx={{
          backgroundColor: theme.palette.grey[100],
          borderRadius: '15px',
          paddingBottom: '20px',
          minHeight: '100vh',
        }}
      >
        {searchActive ? (
          <Grid
            container
            spacing={2}
            sx={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              paddingLeft: '5%',
              paddingRight: '5%',
              paddingY: '2.5%',
            }}
          >
            {searchData.map((section: CategoryProps) => {
              const matchingCategory = checkoutItems.find(
                (cat) => cat.category === section.category,
              ) || {
                id: 0,
                category: '',
                items: [],
                checkout_limit: 0,
                categoryCount: 0,
              };

              return section.items.map((item: CheckoutItemProp) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, xl: 3 }} key={item.id}>
                  <CheckoutCard
                    item={item}
                    categoryCheckout={matchingCategory}
                    addItemToCart={(item, quantity) => {
                      if (item.name === 'Appliance Miscellaneous') {
                        setSelectedItem(item);
                        if (quantity > 0) {
                          setShowAdditionalNotesDialog(true);
                          return;
                        }
                      }
                      if (
                        checkoutHistory.map((i) => i.item_id).includes(item.id)
                      ) {
                        setSelectedItem(item);
                        if (quantity > 0) {
                          setShowPastCheckoutDialog(true);
                          return;
                        }
                      }
                      const sectionType =
                        section.category === 'Welcome Basket'
                          ? 'welcomeBasket'
                          : 'general';
                      addItemToCart(
                        item,
                        quantity,
                        section.category,
                        sectionType,
                      );
                    }}
                    activeSection={activeSection}
                    removeItemFromCart={removeItemFromCart}
                    removeButton={false}
                    categoryLimit={section.checkout_limit}
                    categoryName={section.category}
                    checkoutHistory={checkoutHistory}
                  />
                </Grid>
              ));
            })}
          </Grid>
        ) : (
          <Box>
            <Typography
              id="Welcome Basket"
              sx={{
                paddingLeft: '5%',
                paddingTop: '5%',
                fontSize: '24px',
                fontWeight: 'bold',
              }}
            >
              Welcome Basket
            </Typography>

            {/* Filters for welcome basket  */}
            {welcomeBasketData.map((category) => {
              const matchingCategory = checkoutItems.find(
                (cat) => cat.category === category.category,
              ) || {
                id: 0,
                category: '',
                items: [],
                checkout_limit: 0,
                categoryCount: 0,
              };
              return (
                <CategorySection
                  key={category.id}
                  category={category}
                  categoryCheckout={matchingCategory}
                  addItemToCart={(item, quantity) =>
                    addItemToCart(
                      item,
                      quantity,
                      category.category,
                      'welcomeBasket',
                    )
                  }
                  removeItemFromCart={removeItemFromCart}
                  removeButton={false}
                  disabled={
                    searchActive ||
                    (activeSection !== '' && activeSection !== 'welcomeBasket')
                  }
                  activeSection={activeSection}
                  checkoutHistory={checkoutHistory}
                />
              );
            })}

            <Typography
              sx={{
                paddingLeft: '5%',
                paddingTop: '5%',
                fontSize: '24px',
                fontWeight: 'bold',
              }}
            >
              General
            </Typography>

            {/* Filters for general items */}
            {filteredData.map((category) => {
              const matchingCategory = checkoutItems.find(
                (cat) => cat.category === category.category,
              ) || {
                id: 0,
                category: '',
                items: [],
                checkout_limit: 0,
                categoryCount: 0,
              };
              return (
                <CategorySection
                  key={category.id}
                  category={category}
                  categoryCheckout={matchingCategory}
                  addItemToCart={(item, quantity) => {
                    if (item.name === 'Appliance Miscellaneous') {
                      setSelectedItem(item);
                      if (quantity > 0) {
                        setShowAdditionalNotesDialog(true);
                        return;
                      }
                    }
                    if (
                      checkoutHistory.map((i) => i.item_id).includes(item.id)
                    ) {
                      setSelectedItem(item);
                      if (quantity > 0) {
                        setShowPastCheckoutDialog(true);
                        return;
                      }
                    }
                    addItemToCart(item, quantity, category.category, 'general');
                  }}
                  removeItemFromCart={removeItemFromCart}
                  removeButton={false}
                  disabled={
                    searchActive ||
                    (activeSection !== '' && activeSection !== 'general')
                  }
                  activeSection={activeSection}
                  checkoutHistory={checkoutHistory}
                />
              );
            })}
          </Box>
        )}

        <CheckoutFooter
          checkoutItems={checkoutItems}
          setOpenSummary={setOpenSummary}
          selectedBuildingCode={residentInfo.building.code}
          residentInfoIsMissing={residentInfoIsMissing}
        />

        <CheckoutDialog
          open={openSummary}
          onClose={() => {
            setOpenSummary(false);
          }}
          onSuccess={handleCheckoutSuccess}
          onError={handleCheckoutError}
          checkoutItems={checkoutItems}
          welcomeBasketData={welcomeBasketData}
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
          originalTransactionData={originalTransactionData}
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
