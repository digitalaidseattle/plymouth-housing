import { Remove, Add } from "@mui/icons-material";
import { Box, IconButton } from "@mui/material";
import { CheckoutCardProps, CheckoutItem } from "../../types/interfaces";

const ItemQuantityButton = ({ item, checkoutItems, addItemToCart }: CheckoutCardProps) => {

  const foundInCart = checkoutItems.find(
    (v: CheckoutItem) => v.id === item.id,
  );

  return (
    <Box sx={{display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', overflow: 'hidden'}}>
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
    </Box>
  );
};

export default ItemQuantityButton;