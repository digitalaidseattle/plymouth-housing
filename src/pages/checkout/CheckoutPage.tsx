import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { CategoryProps, CheckoutItemProp } from '../../types/interfaces';
import CheckoutDialog from '../../components/Checkout/CheckoutDialog';
import { buildingCodes, welcomeBasketData } from '../../data/checkoutPage'; //TODO remove when SQL Is hooked up
import CategorySection from '../../components/Checkout/CategorySection';
import CheckoutFooter from '../../components/Checkout/CheckoutFooter';
import BuildingCodeSelect from '../../components/Checkout/BuildingCodeSelect';
import SearchBar from '../../components/Checkout/SearchBar';
import Navbar from '../../components/Checkout/Navbar';
import ScrollToTopButton from '../../components/Checkout/ScrollToTopButton';

const API = "/data-api/rest/itemsbycategory";
const HEADERS = { 'Accept': 'application/json', 'Content-Type': 'application/json;charset=utf-8', };

const CheckoutPage = () => {
  const [data, setData] = useState<CategoryProps[]>([]);
  const [filteredData, setFilteredData] = useState<CategoryProps[]>([]);
  const [checkoutItems, setCheckoutItems] = useState<CheckoutItemProp[]>([]);
  const [openSummary, setOpenSummary] = useState(false);
  const [selectedBuildingCode, setSelectedBuildingCode] = useState('');
  const [activeSection, setActiveSection] = useState<string | null>(null);

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
        setActiveSection(null);
      }
    }
  };

  const fetchData = async () => {
    try {
      const response = await fetch(API, { headers: HEADERS, method: 'GET' });
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const responseData = await response.json();
      console.log(responseData.value);
      setData(responseData.value);
    }
    catch (error) {
      console.error('Error fetching inventory:', error); //TODO show more meaningful error to end user.
    }
  };

  const scrollToCategory = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  useEffect(() => {
    fetchData();
  }, [])

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
          disabled={activeSection !== null && activeSection !== 'welcomeBasket'}
          />
        ))}
        <Typography sx={{ paddingLeft: '5%', paddingTop: '5%', fontSize: '24px', fontWeight: 'bold' }}>General</Typography>
        {filteredData.map((category) => (
          <CategorySection key={category.id} category={category} checkoutItems={checkoutItems} addItemToCart={(item, quantity) => addItemToCart(item, quantity, 'general')} removeItemFromCart={removeItemFromCart} removeButton={false}
          disabled={activeSection !== null && activeSection !== 'general'}
          />
        ))}
        <CheckoutFooter checkoutItems={checkoutItems} setOpenSummary={setOpenSummary} />

        <ScrollToTopButton showAfter={300} />
        <CheckoutDialog
          open={openSummary}
          onClose={() => setOpenSummary(false)}
          checkoutItems={checkoutItems}
          addItemToCart={(item, quantity) => addItemToCart(item, quantity, 'dialog')}
          setCheckoutItems={setCheckoutItems}
          removeItemFromCart={removeItemFromCart}
        />
      </Box>
    </Box>
  );
};

export default CheckoutPage;
