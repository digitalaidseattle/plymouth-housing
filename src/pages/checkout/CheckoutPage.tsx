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
} from '@mui/material';
import { Search, Add, Remove } from '@mui/icons-material';
import { CheckoutItem, Item } from '../../types/interfaces';
import CheckoutDialog from './CheckoutDialog';
import { buildingCodes } from '../../data/checkoutPage'; //TODO remove when SQL Is hooked up

const API = "/data-api/rest/itemsbycategory";
const HEADERS = { 'Accept': 'application/json', 'Content-Type': 'application/json;charset=utf-8', };

const CheckoutPage = () => {
  const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>([]);
  const [openSummary, setOpenSummary] = useState(false);
  const [selectedBuildingCode, setSelectedBuildingCode] = useState('');
  const [data, setData] = useState<[]>([]);

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

  const removeItemFromCart = (itemId: string) => {
    setCheckoutItems(
      checkoutItems.filter(
        (addedItem: CheckoutItem) => addedItem.id !== itemId,
      ),
    );
  };

  const addItemToCart = (item: Item, quantity: number) => {
    const foundIndex = checkoutItems.findIndex(
      (addedItem: CheckoutItem) => addedItem.id === item.id,
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

  useEffect(() => {
    fetchData();
  }, [])

  const renderItemQuantityButtons = (item: Item | CheckoutItem) => {
    const foundInCart = checkoutItems.find(
      (v: CheckoutItem) => v.id === item.id,
    );
    if (foundInCart) {
      return (
        <div style={{ display: 'flex', backgroundColor: 'red' }}>
          <IconButton
            style={{
              backgroundColor: '#E8E8E8',
              width: '20px',
              height: '20px',
            }}
            onClick={() => addItemToCart(item, -1)}
          >
            <Remove fontSize="small" />
          </IconButton>
          <span
            style={{ fontWeight: 'bold', margin: '0 10px' }}
            data-testid="test-id-quantity"
          >
            {foundInCart.quantity}
          </span>
          <IconButton
            style={{
              backgroundColor: '#E8E8E8',
              width: '20px',
              height: '20px',
            }}
            onClick={() => addItemToCart(item, 1)}
          >
            <Add fontSize="small" />
          </IconButton>
        </div>
      );
    }
    return (
      <IconButton
        style={{ backgroundColor: '#E8E8E8', width: '30px', height: '30px' }}
        onClick={() => addItemToCart(item, 1)}
      >
        <Add />
      </IconButton>
    );
  };

  return (
    <div style={{ margin: 'auto 100px' }}>
      <h2>Check out</h2>
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
      </div>
      <div style={{ borderRadius: '10px', backgroundColor: '#F0F0F0' }}>
        {data.map((category) => (
          <div key={category.category}>
            <h3 style={{ margin: '20px 20px' }}>{category.category}</h3>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
              }}
            >
              {category.items.map((item) => (
                <Card
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '238px',
                    height: '70px',
                    margin: '10px',
                    borderRadius: '10px',
                    backgroundColor: checkoutItems.find(
                      (v: CheckoutItem) => v.id === item.id,
                    )
                      ? '#C0C0C0'
                      : 'white',
                  }}
                >
                  <CardContent>
                    <h4>{item.name}</h4>
                  </CardContent>
                  <CardActions style={{ border: '1px red blue' }}>
                    {renderItemQuantityButtons(item)}
                  </CardActions>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
      {checkoutItems.length > 0 && (
        <div
          style={{
            padding: '0 100px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            height: '100px',
            backgroundColor: '#C0C0C0',
          }}
        >
          <p>
            {checkoutItems.reduce(
              (accumulator, item) => accumulator + item.quantity,
              0,
            )}{' '}
            items selected
          </p>
          <Button
            variant="text"
            style={{ color: 'black', backgroundColor: 'white' }}
            onClick={() => setOpenSummary(true)}
          >
            Continue
          </Button>
        </div>
      )}

      <CheckoutDialog
        open={openSummary}
        onClose={() => setOpenSummary(false)}
        checkoutItems={checkoutItems}
        removeItemFromCart={removeItemFromCart}
        renderItemQuantityButtons={renderItemQuantityButtons}
      />
    </div>
  );
};

export default CheckoutPage;
