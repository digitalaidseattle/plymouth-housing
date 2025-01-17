import { Remove, Add } from "@mui/icons-material";
import { Box, Button, IconButton, Typography } from "@mui/material";
import { CheckoutCardProps, CheckoutItemProp } from "../../types/interfaces";

const ItemQuantityButton = ({ item, checkoutItem, addItemToCart, removeItemFromCart, removeButton, disableAdd, categoryLimit, category }: CheckoutCardProps) => {

  const foundInCart = checkoutItem?.items?.find(
    (v: CheckoutItemProp) => v.id === item.id
  );



  const handleAddClick = () => {
    if (checkoutItem.categoryCount !== undefined && checkoutItem.categoryCount < categoryLimit) {
      addItemToCart(item, 1, category);
    } else {
      return;
    }
  };


  const handleRemoveClick = () => {
    addItemToCart(item, -1, category);
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', overflow: 'hidden' }}>
      {foundInCart ? <><IconButton
        sx={{ backgroundColor: '#E8E8E8', width: '30px', height: '30px' }}
        onClick={handleRemoveClick}
      >
        <Remove />
      </IconButton>
        <Typography
          sx={{ fontSize: '20px', margin: '0 15px' }}
          data-testid="test-id-quantity"
        >
          {foundInCart.quantity}
        </Typography></> : null}
      <IconButton
        sx={{ backgroundColor: '#E8E8E8', width: '30px', height: '30px' }}
        onClick={handleAddClick}
        disabled={disableAdd}
      >
        <Add />
      </IconButton>
      {removeButton ? <Button sx={{ ml: '5vh' }} onClick={() => removeItemFromCart(item.id)}>Remove</Button> : null}
    </Box>
  );
};

export default ItemQuantityButton;