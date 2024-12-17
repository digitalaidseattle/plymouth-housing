import { Remove, Add } from "@mui/icons-material";
import { Box, Button, IconButton, Typography } from "@mui/material";
import { CheckoutCardProps, CheckoutItemProp } from "../../types/interfaces";

const ItemQuantityButton = ({ item, checkoutItems, addItemToCart, removeItemFromCart, removeButton }: CheckoutCardProps) => {

  const foundInCart = checkoutItems.find(
    (v: CheckoutItemProp) => v.id === item.id,
  );

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', overflow: 'hidden' }}>
      {foundInCart ? <><IconButton
        sx={{ backgroundColor: '#E8E8E8', width: '34px', height: '34px' }}
        onClick={() => addItemToCart(item, -1)}
      >
        <Remove />
      </IconButton>
        <Typography
          sx={{ margin: '0 15px' }}
          data-testid="test-id-quantity"
        >
          {foundInCart.quantity}
        </Typography></> : null}
      <IconButton
        style={{ backgroundColor: '#E8E8E8', width: '34px', height: '34px' }}
        onClick={() => addItemToCart(item, 1)}
      >
        <Add />
      </IconButton>
      {removeButton ? <Button sx={{ ml: '5vh' }} onClick={() => removeItemFromCart(item.id)}>Remove</Button> : null}
    </Box>
  );
};

export default ItemQuantityButton;