import { Remove, Add } from "@mui/icons-material";
import { Box, Button, IconButton, Typography } from "@mui/material";
import { CheckoutCardProps, CheckoutItemProp } from "../../types/interfaces";

const ItemQuantityButton = ({ item, categoryCheckout, addItemToCart, removeItemFromCart, removeButton, disableAdd, categoryLimit, categoryName }: CheckoutCardProps) => {

  const foundInCart = categoryCheckout?.items?.find(
    (v: CheckoutItemProp) => v.id === item.id
  );

  const handleAddClick = () => {
    if (categoryCheckout.categoryCount !== undefined && categoryCheckout.categoryCount < categoryLimit) {
      addItemToCart(item, 1, categoryName);
    } else {
      return;
    }
  };

  const handleRemoveClick = () => {
    addItemToCart(item, -1, categoryName);
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', overflow: 'hidden' }}>
      {foundInCart ? <><IconButton
        sx={{
          backgroundColor: '#E8E8E8', width: { xs: '20px', md: '30px' },
          height: { xs: '20px', md: '30px' }
        }}
        onClick={handleRemoveClick}
      >
        <Remove/>
      </IconButton>
        <Typography
          sx={{ fontSize: { xs: '14px', md: '20px' }, margin: '0 15px' }}
          data-testid="test-id-quantity"
        >
          {foundInCart.quantity}
        </Typography></> : null}
      <IconButton
        sx={{
          backgroundColor: '#E8E8E8', width: { xs: '20px', md: '30px' },
          height: { xs: '20px', md: '30px' }
        }}
        onClick={handleAddClick}
        disabled={disableAdd}
      >
        <Add />
      </IconButton>
      {removeButton ? <Button sx={{ color: 'black', fontSize: {xs: '14px', md: '16px'}, paddingX: { xs: '10px', md: '30px'}}} onClick={() => removeItemFromCart(item.id, categoryName)}>Remove</Button> : null}
    </Box>
  );
};

export default ItemQuantityButton;