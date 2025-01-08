import { useState, useEffect, useContext, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import { Building, CategoryProps, CheckoutItem } from '../../types/interfaces';
import { ENDPOINTS, HEADERS } from '../../types/constants';
import { getRole, UserContext } from '../../components/contexts/UserContext';
import {CheckoutDialog} from '../../components/Checkout/CheckoutDialog';
import { welcomeBasketData } from '../../data/checkoutPage'; //TODO remove when SQL Is hooked up
import CategorySection from '../../components/Checkout/CategorySection';
import CheckoutFooter from '../../components/Checkout/CheckoutFooter';
import BuildingCodeSelect from '../../components/Checkout/BuildingCodeSelect';
import SearchBar from '../../components/Checkout/SearchBar';
import Navbar from '../../components/Checkout/Navbar';
import ScrollToTopButton from '../../components/Checkout/ScrollToTopButton';

const CheckoutPage = () => {
  const { user } = useContext(UserContext);
  const [welcomeBasketData, setWelcomeBasketData] = useState<CategoryProps[]>([]);
  const [data, setData] = useState<CategoryProps[]>([]);
  const [filteredData, setFilteredData] = useState<CategoryProps[]>([]);
  const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [openSummary, setOpenSummary] = useState(false);
  const [selectedBuildingCode, setSelectedBuildingCode] = useState('');
  const [activeSection, setActiveSection] = useState<string>('');

  const addItemToCart = (item: CheckoutItem, quantity: number, section: string) => {
    // Lock active section if none is set, or allow only the active section
    if (!activeSection || activeSection === section) {
      const updatedItems = [...checkoutItems];
      const foundIndex = updatedItems.findIndex(
        (addedItem: CheckoutItem) => addedItem.id === item.id,
      );

      if (foundIndex !== -1) {
        // Update quantity or remove item if quantity is zero
        const foundItem = updatedItems[foundIndex];
        const newQuantity = foundItem.quantity + quantity;

        if (newQuantity <= 0) {
          updatedItems.splice(foundIndex, 1); // Remove item
        } else {
          updatedItems[foundIndex] = { ...foundItem, quantity: newQuantity };
        }
      } else if (quantity > 0) {
        // Add a new item to the cart
        updatedItems.push({ ...item, quantity: 1 });
        setActiveSection(section); // Lock the active section
      }

      // Update the checkoutItems state
      setCheckoutItems(updatedItems);

      // Reset activeSection if the cart becomes empty
      if (updatedItems.length === 0) {
        setActiveSection('');
      }
    }
  };

  const removeItemFromCart = (itemId: number) => {
    setCheckoutItems(
      checkoutItems.filter(
        (addedItem: CheckoutItem) => addedItem.id !== itemId,
      ),
    );
  };

  const scrollToCategory = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const fetchBuildings = useCallback(async () => {
    try {
      HEADERS['X-MS-API-ROLE'] = getRole(user);
      const response = await fetch(ENDPOINTS.BUILDINGS, { headers: HEADERS, method: 'GET' });
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const data = await response.json();
      setBuildings(data.value);
    }
    catch (error) {
      console.error('Error fetching buildings:', error); //TODO show more meaningful error to end user.
    }
  }, [user]);

  const fetchData = useCallback(async () => {
    try {
      HEADERS['X-MS-API-ROLE'] = getRole(user);
      const response = await fetch(ENDPOINTS.CATEGORIZED_ITEMS, { headers: HEADERS, method: 'GET' });
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const responseData = await response.json();
      setData(responseData.value);

      //this part is a bit tricky. PH has 2 different welcome baskets: one for full-size and one for twin-size. See documentation
      const welcomeBasket = responseData.value.filter((category: CategoryProps) => category.category === 'Welcome Basket') || [];
      welcomeBasket[0].items = welcomeBasket[0].items.filter((item: CheckoutItem) => 
        item.name.toLowerCase().includes('full-size sheet set') ||
        item.name.toLowerCase().includes('twin-size sheet set')
      );
      setWelcomeBasketData(welcomeBasket);
    }
    catch (error) {
      console.error('Error fetching inventory:', error); //TODO show more meaningful error to end user.
    }
  },[user]);

  useEffect(() => {
    fetchBuildings();
    fetchData();
  }, [fetchData, fetchBuildings])

  useEffect(() => {
    setFilteredData(data.filter((item: CategoryProps) => item.category !== 'Welcome Basket'));
  }, [data])

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
        <BuildingCodeSelect buildings={buildings} selectedBuildingCode={selectedBuildingCode} setSelectedBuildingCode={setSelectedBuildingCode} />
        <SearchBar />
      </Box>
      <Box>
        <Navbar filteredData={filteredData} scrollToCategory={scrollToCategory} />
      </Box>
      <Box sx={{ backgroundColor: '#F0F0F0', borderRadius: '15px' }}>
        <Typography id="Welcome Basket" sx={{ paddingLeft: '5%', paddingTop: '5%', fontSize: '24px', fontWeight: 'bold' }}>Welcome Basket</Typography>
        {welcomeBasketData.map((category) => (
          <CategorySection key={category.id} category={category} checkoutItems={checkoutItems} addItemToCart={(item, quantity) => addItemToCart(item, quantity, 'welcomeBasket')} removeItemFromCart={removeItemFromCart} removeButton={false}
            disabled={activeSection !== '' && activeSection !== 'welcomeBasket'}
          />
        ))}
        <Typography sx={{ paddingLeft: '5%', paddingTop: '5%', fontSize: '24px', fontWeight: 'bold' }}>General</Typography>
        {filteredData.map((category) => (
          <CategorySection key={category.id} category={category} checkoutItems={checkoutItems} addItemToCart={(item, quantity) => addItemToCart(item, quantity, 'general')} removeItemFromCart={removeItemFromCart} removeButton={false}
            disabled={activeSection !== '' && activeSection !== 'general'}
          />
        ))}
        <CheckoutFooter checkoutItems={checkoutItems} setOpenSummary={setOpenSummary} />

        <ScrollToTopButton showAfter={300} />
        <CheckoutDialog
          open={openSummary}
          onClose={() => setOpenSummary(false)}
          checkoutItems={checkoutItems}
          welcomeBasketData={welcomeBasketData}
          addItemToCart={(item, quantity) => addItemToCart(item, quantity, activeSection)}
          setCheckoutItems={setCheckoutItems}
          removeItemFromCart={removeItemFromCart}
          selectedBuildingCode={selectedBuildingCode}
        />
      </Box>
    </Box>
  );
};

export default CheckoutPage;
