import { useState, useEffect, useContext, useCallback } from 'react';
import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Building, CategoryProps, CheckoutItemProp } from '../../types/interfaces';
import { ENDPOINTS, API_HEADERS } from '../../types/constants';
import { getRole, UserContext } from '../../components/contexts/UserContext';
import { CheckoutDialog } from '../../components/Checkout/CheckoutDialog';
import CategorySection from '../../components/Checkout/CategorySection';
import CheckoutFooter from '../../components/Checkout/CheckoutFooter';
import BuildingCodeSelect from '../../components/Checkout/BuildingCodeSelect';
import SearchBar from '../../components/Searchbar/SearchBar';
import Navbar from '../../components/Checkout/Navbar';
import CheckoutCard from '../../components/Checkout/CheckoutCard';
import { useNavigate } from 'react-router-dom';
import SnackbarAlert from '../../components/SnackbarAlert';

const CheckoutPage = () => {
  const { user } = useContext(UserContext);
  const [welcomeBasketData, setWelcomeBasketData] = useState<CategoryProps[]>([]);
  const [data, setData] = useState<CategoryProps[]>([]);
  const [searchData, setSearchData] = useState<CategoryProps[]>([]);
  const [searchActive, setSearchActive] = useState<boolean>(false);
  const [filteredData, setFilteredData] = useState<CategoryProps[]>([]);
  const [checkoutItems, setCheckoutItems] = useState<CategoryProps[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [openSummary, setOpenSummary] = useState<boolean>(false);
  const [selectedBuildingCode, setSelectedBuildingCode] = useState<string>('');
  const [activeSection, setActiveSection] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const [snackbarState, setSnackbarState] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'warning';
  }>({ open: false, message: '', severity: 'warning' });


  const theme = useTheme();
  const navigate = useNavigate();

  const addItemToCart = (
    item: CheckoutItemProp,
    quantity: number,
    category: string,
    section: string
  ) => {
    // Lock active section if none is set, or allow only the active section
    if (!activeSection || activeSection === section) {
      const updatedCheckoutItems = [...checkoutItems];
      const categoryIndex = updatedCheckoutItems.findIndex(
        (cat: CategoryProps) => cat.category === category
      );

      if (categoryIndex !== -1) {
        // Found the category
        const categoryData = updatedCheckoutItems[categoryIndex];
        const categoryItems = [...categoryData.items];
        const itemIndex = categoryItems.findIndex(
          (addedItem: CheckoutItemProp) => addedItem.id === item.id
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
          0
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
        (cat) => cat.items.length === 0
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
            (addedItem: CheckoutItemProp) => addedItem.id !== itemId
          );

          const updatedCategoryCount = updatedItems.reduce(
            (count, item) => count + item.quantity,
            0
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
      const isCartEmpty = updatedCheckoutItems.every(category => category.items.length === 0);
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
      element.style.scrollMarginTop = "200px";
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const fetchBuildings = useCallback(async () => {
    try {
      const cachedBuildings = sessionStorage.getItem('buildings');
      if (cachedBuildings) {
        setBuildings(JSON.parse(cachedBuildings));
        return;
      }
      API_HEADERS['X-MS-API-ROLE'] = getRole(user);
      const response = await fetch(ENDPOINTS.BUILDINGS, { headers: API_HEADERS, method: 'GET' });
      if (!response.ok) {
        if (response.status === 500) {
          throw new Error('Database is likely starting up. Try again in 30 seconds.');
        } else {
          throw new Error(response.statusText);
        }
      }
      const data = await response.json();
      setBuildings(data.value);
      sessionStorage.setItem('buildings', JSON.stringify(data.value));
    } catch (error) {
      setError('Could not get buildings. \r\n' + error);
      console.error('Error fetching buildings:', error);
    }
  }, [user]);

  const fetchData = useCallback(async () => {
    try {
      let categorizedItems;
      const cachedCategorizedItems = sessionStorage.getItem('categorizedItems');
      if (cachedCategorizedItems) {
        categorizedItems = JSON.parse(cachedCategorizedItems);
      }
      else{
        API_HEADERS['X-MS-API-ROLE'] = getRole(user);
        const response = await fetch(ENDPOINTS.CATEGORIZED_ITEMS, { headers: API_HEADERS, method: 'GET' });
        if (!response.ok) {
          throw new Error(response.statusText);
        }

        const responseData = await response.json();
        categorizedItems = responseData.value
        sessionStorage.setItem('categorizedItems', JSON.stringify(categorizedItems));
      }
      setData(categorizedItems);

      const cleanCheckout = categorizedItems.map((category: CategoryProps) => ({
        ...category,
        categoryCount: 0,
        items: [],
      }));

      setCheckoutItems(cleanCheckout);

      const welcomeBasket = categorizedItems.filter(
        (category: CategoryProps) => category.category === 'Welcome Basket'
      ) || [];
      welcomeBasket[0].items = welcomeBasket[0].items.filter((item: CheckoutItemProp) =>
        item.name.toLowerCase().includes('full-size sheet set') ||
        item.name.toLowerCase().includes('twin-size sheet set')
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

  useEffect(() => {
    if (error) {
      setSnackbarState({ open: true, message: error, severity: 'warning' });
    }
  }, [error]);

  useEffect(() => {
    fetchBuildings();
    fetchData();
  }, [fetchData, fetchBuildings])

  useEffect(() => {
    setFilteredData(data.filter((item: CategoryProps) => item.category !== 'Welcome Basket'));
  }, [data])

  const handleCheckoutSuccess = () => {
    const numberOfItems = checkoutItems.reduce((accumulator, category) => accumulator + category.categoryCount, 0);
    const userRole = user ? getRole(user) : null;
    const navigateState = {state: {
      checkoutSuccess: true, 
      message: `${numberOfItems} ${numberOfItems === 1 ? 'item has been' : 'items have been'} checked out`
    }}

    if (userRole === 'volunteer') {
      navigate('/volunteer-home', navigateState);
    } else {
      navigate('/inventory', navigateState)
    }
  };

  return (
    <>
    {/* Container for the sticky nav */}
    <Box sx={{
      position: 'sticky',
      top: '3.5rem',
      zIndex: 2,
      p: 1,
      background: theme.palette.common.white,
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', p: 1 }}>
        <BuildingCodeSelect buildings={buildings} selectedBuildingCode={selectedBuildingCode} setSelectedBuildingCode={setSelectedBuildingCode} />
        <SearchBar data={data} setSearchData={setSearchData} setSearchActive={setSearchActive} />
      </Box>
      {!searchActive && <Navbar filteredData={filteredData} scrollToCategory={scrollToCategory} />}
    </Box>

    <Box sx={{ backgroundColor: theme.palette.grey[100], borderRadius: '15px', paddingBottom: '20px', minHeight: '100vh' }}>
      {searchActive ? (
        <Grid container spacing={2} sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', paddingLeft: '5%', paddingRight: '5%', paddingY: '2.5%' }}>
          {searchData.map((section: CategoryProps) => {
            const matchingCategory =
              checkoutItems.find((cat) => cat.category === section.category) || {
                id: 0,
                category: '',
                items: [],
                checkout_limit: 0,
                categoryCount: 0,
              };

            return section.items.map((item: CheckoutItemProp) => (
              <Grid size={{ xs: 12, sm:6, md:4, xl:3 }} key={item.id}>  
                <CheckoutCard
                  item={item}
                  categoryCheckout={matchingCategory}
                  addItemToCart={(item, quantity) => {
                    const sectionType = section.category === 'Welcome Basket' ? 'welcomeBasket' : 'general';
                    addItemToCart(item, quantity, section.category, sectionType);
                  }}
                  activeSection={activeSection}
                  removeItemFromCart={removeItemFromCart}
                  removeButton={false}
                  categoryLimit={section.checkout_limit}
                  categoryName={section.category}
                />
              </Grid>
            ));
          })}

        </Grid>
      ) :

        <Box>
          <Typography id="Welcome Basket" sx={{ paddingLeft: '5%', paddingTop: '5%', fontSize: '24px', fontWeight: 'bold' }}>Welcome Basket</Typography>

          {/* Filters for welcome basket  */}
          {welcomeBasketData.map((category) => {
            const matchingCategory = checkoutItems.find(
              (cat) => cat.category === category.category
            ) || { id: 0, category: '', items: [], checkout_limit: 0, categoryCount: 0 };
            return (
              <CategorySection
                key={category.id}
                category={category}
                categoryCheckout={matchingCategory}
                addItemToCart={(item, quantity) =>
                  addItemToCart(item, quantity, category.category, 'welcomeBasket')}
                removeItemFromCart={removeItemFromCart}
                removeButton={false}
                disabled={searchActive || (activeSection !== '' && activeSection !== 'welcomeBasket')}
                activeSection={activeSection}
              />
            );
          })}

          <Typography sx={{ paddingLeft: '5%', paddingTop: '5%', fontSize: '24px', fontWeight: 'bold' }}>General</Typography>

          {/* Filters for general items */}
          {filteredData.map((category) => {
            const matchingCategory = checkoutItems.find(
              (cat) => cat.category === category.category
            ) || { id: 0, category: '', items: [], checkout_limit: 0, categoryCount: 0 };
            return (
              <CategorySection
                key={category.id}
                category={category}
                categoryCheckout={matchingCategory}
                addItemToCart={(item, quantity) =>
                  addItemToCart(item, quantity, category.category, 'general')}
                removeItemFromCart={removeItemFromCart}
                removeButton={false}
                disabled={searchActive || (activeSection !== '' && activeSection !== 'general')}
                activeSection={activeSection}
              />
            );
          })}
        </Box>}

      <CheckoutFooter checkoutItems={checkoutItems} setOpenSummary={setOpenSummary} selectedBuildingCode={selectedBuildingCode} />

      <CheckoutDialog
        open={openSummary}
        onClose={() => {
          setOpenSummary(false);
        }}
        onSuccess={handleCheckoutSuccess}
        checkoutItems={checkoutItems}
        welcomeBasketData={welcomeBasketData}
        addItemToCart={(item, quantity, category) => addItemToCart(item, quantity, category, activeSection)}
        setCheckoutItems={setCheckoutItems}
        removeItemFromCart={removeItemFromCart}
        selectedBuildingCode={selectedBuildingCode}
        setActiveSection={setActiveSection}
        fetchData={fetchData}
        setSelectedBuildingCode={setSelectedBuildingCode}
        activeSection={activeSection}
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
