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

  const removeItemFromCart = (itemId: number) => {
    setCheckoutItems(
      checkoutItems.filter(
        (addedItem: CheckoutItemProp) => addedItem.id !== itemId,
      ),
    );
  };

  const addItemToCart = (item: CheckoutItemProp, quantity: number) => {
    const foundIndex = checkoutItems.findIndex(
      (addedItem: CheckoutItemProp) => addedItem.id === item.id,
    );
    if (foundIndex !== -1) {
      const foundItem = checkoutItems[foundIndex];
      if (foundItem.quantity + quantity === 0) {
        removeItemFromCart(item.id);
      } else {
        const updatedItems = [...checkoutItems];
        updatedItems[foundIndex] = {
          ...foundItem,
          quantity: foundItem.quantity + quantity,
        };
        setCheckoutItems(updatedItems);
      }
    } else {
      const updatedItems = [...checkoutItems, { ...item, quantity: 1 }];
      setCheckoutItems(updatedItems);
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
      element?.scrollIntoView({behavior: 'smooth', block: 'center' })
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
          <CategorySection key={category.id} category={category} checkoutItems={checkoutItems} addItemToCart={addItemToCart} removeItemFromCart={removeItemFromCart} removeButton={false} />
        ))}
        <Typography sx={{ paddingLeft: '5%', paddingTop: '5%', fontSize: '24px', fontWeight: 'bold' }}>General</Typography>
        {filteredData.map((category) => (
          <CategorySection key={category.id} category={category} checkoutItems={checkoutItems} addItemToCart={addItemToCart} removeItemFromCart={removeItemFromCart} removeButton={false} />
        ))}
        <CheckoutFooter checkoutItems={checkoutItems} setOpenSummary={setOpenSummary} />

        <ScrollToTopButton showAfter={300} />
        <CheckoutDialog
          open={openSummary}
          onClose={() => setOpenSummary(false)}
          checkoutItems={checkoutItems}
          addItemToCart={addItemToCart}
          setCheckoutItems={setCheckoutItems}
          removeItemFromCart={removeItemFromCart}
        />
      </Box>
    </Box>
  );
};

export default CheckoutPage;
