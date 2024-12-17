import { useState, useEffect } from 'react';
import {
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TextField,
  InputAdornment,
  Card,
  CardActions,
  CardContent,
  IconButton,
  Button,
  Box,
} from '@mui/material';
import { Search, Add, Remove } from '@mui/icons-material';
import { CategoryProps, CheckoutItemProp } from '../../types/interfaces';
import CheckoutDialog from '../../components/Checkout/CheckoutDialog';
import { buildingCodes } from '../../data/checkoutPage'; //TODO remove when SQL Is hooked up
import CheckoutCard from '../../components/Checkout/CheckoutCard';
import CategorySection from '../../components/Checkout/CategorySection';
import CheckoutFooter from '../../components/Checkout/CheckoutFooter';

const API = "/data-api/rest/itemsbycategory";
const HEADERS = { 'Accept': 'application/json', 'Content-Type': 'application/json;charset=utf-8', };

const CheckoutPage = () => {
  const [data, setData] = useState<CategoryProps[]>([]);
  const [checkoutItems, setCheckoutItems] = useState<CheckoutItemProp[]>([]);
  const [openSummary, setOpenSummary] = useState(false);
  // const [selectedBuildingCode, setSelectedBuildingCode] = useState('');

  const removeItemFromCart = (itemId: string) => {
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
    <Box sx={{ backgroundColor: '#F0F0F0', borderRadius: '15px' }}>
      {/* <h2>Check out</h2>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'end',
        }}
      >
        <div>
          <FormControl style={{ width: '150px' }}>
            <InputLabel id="select-building-code-label">
              Building Code
            </InputLabel>
            <Select
              labelId="select-building-code-label"
              id="select-building-code"
              data-testid="test-id-select-building-code"
              label="Building Code"
              value={selectedBuildingCode || ''}
              onChange={(event) => setSelectedBuildingCode(event.target.value)}
            >
              {buildingCodes.map((buildingCode) => (
                <MenuItem key={buildingCode.code} value={buildingCode.code}>
                  {buildingCode.code} ({buildingCode.name})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <div>
          <TextField
            variant="standard"
            placeholder="Search..."
            type="search"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </div>
      </div> */}
        {data.map((category) => (
          <CategorySection key={category.id} category={category} checkoutItems={checkoutItems} addItemToCart={addItemToCart}/>
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
  );
};

export default CheckoutPage;
