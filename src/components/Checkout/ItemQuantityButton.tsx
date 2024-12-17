import { Remove, Add } from "@mui/icons-material";
import { Box, Button, IconButton } from "@mui/material";
import { CheckoutCardProps, CheckoutItemProp } from "../../types/interfaces";

const ItemQuantityButton = ({ item, checkoutItems, addItemToCart, removeItemFromCart, removeButton }: CheckoutCardProps) => {

  const foundInCart = checkoutItems.find(
    (v: CheckoutItemProp) => v.id === item.id,
  );

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', overflow: 'hidden' }}>
      {foundInCart ? <><IconButton
        style={{ backgroundColor: '#E8E8E8', width: '30px', height: '30px' }}
        onClick={() => addItemToCart(item, -1)}
      >
        <Remove />
      </IconButton>
        <Box
          style={{ fontWeight: 'bold', margin: '0 10px' }}
          data-testid="test-id-quantity"
        >
          {foundInCart.quantity}
        </Box></> : null}
      <IconButton
        style={{ backgroundColor: '#E8E8E8', width: '30px', height: '30px' }}
        onClick={() => addItemToCart(item, 1)}
      >
        <Add />
      </IconButton>
      {removeButton ? <Button onClick={() => removeItemFromCart(item.id)}>Remove</Button> : null}
    </Box>
  );
};

export default ItemQuantityButton;