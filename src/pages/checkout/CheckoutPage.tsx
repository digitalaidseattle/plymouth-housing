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
import { CheckoutItem } from '../../types/interfaces';
import CheckoutDialog from './CheckoutDialog';
import { buildingCodes } from '../../data/checkoutPage'; //TODO remove when SQL Is hooked up
import CheckoutCard from '../../components/Checkout/CheckoutCard';
import CategorySection from '../../components/Checkout/CategorySection';
import CheckoutFooter from '../../components/Checkout/CheckoutFooter';

const API = "/data-api/rest/itemsbycategory";
const HEADERS = { 'Accept': 'application/json', 'Content-Type': 'application/json;charset=utf-8', };

const CheckoutPage = () => {
  const [data, setData] = useState<[]>([]);
  const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>([]);
  // const [openSummary, setOpenSummary] = useState(false);
  // const [selectedBuildingCode, setSelectedBuildingCode] = useState('');

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
    <div style={{ margin: 'auto 100px', backgroundColor: '#F0F0F0', borderRadius: '15px' }}>
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
          <CategorySection category={category} checkoutItems={checkoutItems} setCheckoutItems={setCheckoutItems}/>
        ))}
        <CheckoutFooter checkoutItems={checkoutItems} />

      {/* <CheckoutDialog
        open={openSummary}
        onClose={() => setOpenSummary(false)}
        checkoutItems={checkoutItems}
        removeItemFromCart={removeItemFromCart}
        renderItemQuantityButtons={renderItemQuantityButtons}
      /> */}
    </div>
  );
};

export default CheckoutPage;
