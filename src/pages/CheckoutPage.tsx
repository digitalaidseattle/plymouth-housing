import { useState } from 'react';

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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';

import { Search, Add, Remove, Close } from '@mui/icons-material';

// data
import { categories } from '../data/checkoutPage';

const CheckoutPage = () => {

  const [checkoutItems, setCheckoutItems] = useState<any>([]);
  const [openSummary, setOpenSummary] = useState(false);

  const handleAddItem = (item: any) => {
    const addedItem = {...item, quantity: 1};
    setCheckoutItems([...checkoutItems, addedItem]);
  }

  const handleRemoveItem = (item: any) => {
    setCheckoutItems(checkoutItems.filter((addedItem: any) => addedItem.id !== item.id));
  }

  const handleUpdateQuantity = (item: any, quantity: number) => {
    const updatedItems = checkoutItems.map((addedItem: any) => {
      if (addedItem === item) {
        return {...addedItem, quantity: addedItem.quantity + quantity};
      }
      return addedItem;
    });

    setCheckoutItems(updatedItems);
  }


  return (
    <div style={{ margin: "auto 100px" }}>
      <h2>Check out</h2>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end" }}>
        <div>
          <FormControl style={{ width: "150px" }}>
            <InputLabel id="demo-simple-select-label">Building Code</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              label="Building Code"
            >
              <MenuItem value={10}>Ten</MenuItem>
              <MenuItem value={20}>Twenty</MenuItem>
              <MenuItem value={30}>Thirty</MenuItem>
            </Select>
          </FormControl>
        </div>
        <div>
          <TextField variant="standard" placeholder="Search..." type="search"
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
      <div style={{ borderRadius: "10px", backgroundColor: "#F0F0F0" }}>
        {categories.map((category) => (
          <div key={category.id}>
            <h3 style={{ margin: "20px 20px" }}>{category.name}</h3>
            <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
              {category.items.map(item => (
                <Card key={item.id} style={{
                  display: "flex", width: "200px", height: "100px", margin: "10px 20px", justifyContent: "space-between", borderRadius: "10px",
                  backgroundColor: checkoutItems.find(v => v.id === item.id) ? "#C0C0C0" : "white"
                }}>
                  <CardContent>
                    <h3>{item.name}</h3>
                  </CardContent>
                  <CardActions>
                    {checkoutItems.find(v => v.id === item.id) ? <IconButton style={{ backgroundColor: "#E8E8E8", width: "30px", height: "30px" }} onClick={() => handleRemoveItem(item)}><Remove /></IconButton> :
                      <IconButton style={{ backgroundColor: "#E8E8E8", width: "30px", height: "30px" }} onClick={() => handleAddItem(item)}><Add /></IconButton>
                    }
                  </CardActions>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
      {checkoutItems.length > 0 && (
        <div style={{ padding: "0 100px", display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", height: "100px", backgroundColor: "#C0C0C0" }}>
          <p>{checkoutItems.length} items selected</p>
          <Button variant="text" style={{ color: "black", backgroundColor: "white" }} onClick={() => setOpenSummary(true)}>Continue</Button>
        </div>
      )}

      <Dialog
        onClose={() => setOpenSummary(false)}
        aria-labelledby="customized-dialog-title"
        open={openSummary}

      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          Check out summary
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={() => setOpenSummary(false)}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Close />
        </IconButton>
        <DialogContent dividers style={{ width: "500px" }}>
          {
            checkoutItems.map((item: any) => (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid lightgray", borderRadius: "10px" }}>
                <div>
                  <h3>{item.name}</h3>
                </div>
                <div>
                  <IconButton style={{ backgroundColor: "#E8E8E8", width: "20px", height: "20px" }} onClick={() => handleUpdateQuantity(item, -1)}><Remove fontSize="small" /></IconButton>
                  {item.quantity}
                  <IconButton style={{ backgroundColor: "#E8E8E8", width: "20px", height: "20px" }} onClick={() => handleUpdateQuantity(item, 1)}><Add fontSize="small" /></IconButton>
                </div>
                <div>
                  <Button variant="text">Remove</Button>
                </div>
              </div>
            ))
          }

        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSummary(false)}>
            Cancel
          </Button>
          <Button autoFocus >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default CheckoutPage;
