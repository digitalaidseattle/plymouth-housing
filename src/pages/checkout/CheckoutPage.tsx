import { useState, useEffect } from 'react';
import {
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TextField,
  InputAdornment,
  Box,
  Grid,
  Typography
} from '@mui/material';
import { Search, Add, Remove } from '@mui/icons-material';
import { CategoryProps, CheckoutItemProp } from '../../types/interfaces';
import CheckoutDialog from '../../components/Checkout/CheckoutDialog';
import { buildingCodes, welcomeBasketData } from '../../data/checkoutPage'; //TODO remove when SQL Is hooked up
import CategorySection from '../../components/Checkout/CategorySection';
import CheckoutFooter from '../../components/Checkout/CheckoutFooter';
import BuildingCodeSelect from '../../components/Checkout/BuildingCodeSelect';
import SearchBar from '../../components/Checkout/SearchBar';

const API = "/data-api/rest/itemsbycategory";
const HEADERS = { 'Accept': 'application/json', 'Content-Type': 'application/json;charset=utf-8', };

const CheckoutPage = () => {
  const [data, setData] = useState<CategoryProps[]>([]);
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
      const data = await response.json();
      console.log(data.value);
      setData(data.value);
    }
    catch (error) {
      console.error('Error fetching inventory:', error); //TODO show more meaningful error to end user.
    }
  };

  useEffect(() => {
    fetchData();
  }, [])

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
        <BuildingCodeSelect buildingCodes={buildingCodes} selectedBuildingCode={selectedBuildingCode} setSelectedBuildingCode={setSelectedBuildingCode} />
        <SearchBar />
      </Box>
      <Box sx={{ backgroundColor: '#F0F0F0', borderRadius: '15px' }}>
        <Typography sx={{ paddingLeft: '5%', paddingTop: '5%', fontSize: '24px', fontWeight: 'bold' }}>Welcome Basket</Typography>
        {welcomeBasketData.map((category) => (
          <CategorySection key={category.id} category={category} checkoutItems={checkoutItems} addItemToCart={addItemToCart} removeItemFromCart={removeItemFromCart} removeButton={false} />
        ))}
        <Typography sx={{ paddingLeft: '5%', paddingTop: '5%', fontSize: '24px', fontWeight: 'bold' }}>General</Typography>
        {data.map((category) => (
          <CategorySection key={category.id} category={category} checkoutItems={checkoutItems} addItemToCart={addItemToCart} removeItemFromCart={removeItemFromCart} removeButton={false} />
        ))}
        <CheckoutFooter checkoutItems={checkoutItems} setOpenSummary={setOpenSummary} />

        <CheckoutDialog
          open={openSummary}
          onClose={() => setOpenSummary(false)}
          checkoutItems={checkoutItems}
          addItemToCart={addItemToCart}
          setCheckoutItems={setCheckoutItems}
          removeItemFromCart={removeItemFromCart}
        // renderItemQuantityButtons={renderItemQuantityButtons}
        />
      </Box>
    </Box>
  );
};

export default CheckoutPage;
