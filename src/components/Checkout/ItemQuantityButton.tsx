import { Remove, Add } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { CheckoutCardProps, CheckoutItem } from "../../types/interfaces";

const ItemQuantityButton = ({item, checkoutItems, setCheckoutItems}: CheckoutCardProps) => {

  const foundInCart = checkoutItems.find(
    (v: CheckoutItem) => v.id === item.id,
  );

  const removeItemFromCart = (itemId: string) => {
    setCheckoutItems(
      checkoutItems.filter(
        (addedItem: CheckoutItem) => addedItem.id !== itemId,
      ),
    );
  };

  const addItemToCart = (item: CheckoutItem, quantity: number) => {
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

  return (
    <div>
      {foundInCart ? <><IconButton
        style={{ backgroundColor: '#E8E8E8', width: '30px', height: '30px' }}
        onClick={() => addItemToCart(item, -1)}
      >
        <Remove />
      </IconButton><span
        style={{ fontWeight: 'bold', margin: '0 10px' }}
        data-testid="test-id-quantity"
      >
          {foundInCart.quantity}
        </span></> : null}
      <IconButton
        style={{ backgroundColor: '#E8E8E8', width: '30px', height: '30px' }}
        onClick={() => addItemToCart(item, 1)}
      >
        <Add />
      </IconButton>
    </div>
  );
};

export default ItemQuantityButton;