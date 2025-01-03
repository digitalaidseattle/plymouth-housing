import { useState, useEffect, useContext, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import { CategoryProps, CheckoutItemProp } from '../../types/interfaces';
import { ENDPOINTS, HEADERS } from '../../types/constants';
import { getRole, UserContext } from '../../components/contexts/UserContext';
import CheckoutDialog from '../../components/Checkout/CheckoutDialog';
import { buildingCodes, welcomeBasketData } from '../../data/checkoutPage'; //TODO remove when SQL Is hooked up
import CategorySection from '../../components/Checkout/CategorySection';
import CheckoutFooter from '../../components/Checkout/CheckoutFooter';
import BuildingCodeSelect from '../../components/Checkout/BuildingCodeSelect';
import SearchBar from '../../components/Checkout/SearchBar';
import Navbar from '../../components/Checkout/Navbar';
import ScrollToTopButton from '../../components/Checkout/ScrollToTopButton';

const CheckoutPage = () => {
  const {user} = useContext(UserContext);
  const [data, setData] = useState<CategoryProps[]>([]);
  const [filteredData, setFilteredData] = useState<CategoryProps[]>([]);
  const [checkoutItems, setCheckoutItems] = useState<CheckoutItemProp[]>([]);
  const [openSummary, setOpenSummary] = useState(false);
  const [selectedBuildingCode, setSelectedBuildingCode] = useState('');
  const [activeSection, setActiveSection] = useState<string>('');

  const removeItemFromCart = (itemId: number) => {
    setCheckoutItems(
      checkoutItems.filter(
        (addedItem: CheckoutItemProp) => addedItem.id !== itemId,
      ),
    );
  };

  const addItemToCart = (item: CheckoutItemProp, quantity: number, section: string) => {
    // Lock active section if none is set, or allow only the active section
    if (!activeSection || activeSection === section) {
      const updatedItems = [...checkoutItems];
      const foundIndex = updatedItems.findIndex(
        (addedItem: CheckoutItemProp) => addedItem.id === item.id,
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

  const fetchData = useCallback( async () => {
    try {
      HEADERS['X-MS-API-ROLE'] = getRole(user);
      const response = await fetch(ENDPOINTS.CATEGORIZED_ITEMS, { headers: HEADERS, method: 'GET' });
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const responseData = await response.json();
      setData(responseData.value);
    }
    catch (error) {
      console.error('Error fetching inventory:', error); //TODO show more meaningful error to end user.
    }
  },[user]);

  const scrollToCategory = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  useEffect(() => {
    fetchData();
  }, [fetchData])

  useEffect(() => {
    setFilteredData(data.filter((item: CategoryProps) => item.category !== 'Welcome Basket'));
  }, [data])

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
        <BuildingCodeSelect buildingCodes={buildingCodes} selectedBuildingCode={selectedBuildingCode} setSelectedBuildingCode={setSelectedBuildingCode} />
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
