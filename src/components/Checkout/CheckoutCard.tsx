import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Tooltip,
  Chip,
} from '@mui/material';
import { CheckoutCardProps } from '../../types/interfaces';
import { SPECIAL_ITEMS } from '../../types/constants';
import ItemQuantityButton from './ItemQuantityButton';

const CheckoutCard = ({
  item,
  categoryCheckout,
  addItemToCart,
  removeItemFromCart,
  removeButton,
  categoryLimit,
  categoryName,
  checkoutType,
  checkoutHistory
  }: CheckoutCardProps) => {

  const pastCheckout = checkoutHistory ? checkoutHistory.map(i => i.item_id).includes(item.id) : false;

  const timesCheckedOut = () => {
     if (!checkoutHistory || !pastCheckout) return 0;
    const indexOfItem = checkoutHistory.map(i => i.item_id).indexOf(item.id);
    if (indexOfItem !== -1) {
      return checkoutHistory[indexOfItem].timesCheckedOut
    }
    return 0;
  }

  // On the Welcome Basket page, lock the checkout to a single basket type:
  // once one item is in the cart, any item with a different name is disabled.
  const disableAdd = (() => {
    if (checkoutType !== 'welcomeBasket') return false;
    const firstCartItemName = categoryCheckout.items[0]?.name.toLowerCase() ?? '';
    if (firstCartItemName === '') return false;
    if (firstCartItemName === item.name.toLowerCase()) return pastCheckout;
    return true;
  })();

  return (
    <Card
      key={item.name}
      variant="outlined"
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        minHeight: '10vh',
        borderColor: removeButton ? '#D9D9D9' : null,
        borderWidth: removeButton ? '1px' : null,
        borderRadius: '15px',
        paddingX: '10px',        
      }}
    >
      <CardContent sx={{ flex: '1', overflow: 'hidden' }}>
        {pastCheckout && item.id !== SPECIAL_ITEMS.APPLIANCE_MISC && <Chip label={`Checked out ${timesCheckedOut()}x`} sx={{ background: 'rgb(216, 241, 205)', marginBottom: '0.5rem' }} />}
        <Tooltip title={item.name} arrow>
          <Typography
            variant={removeButton ? 'body2' : 'h5'}
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {item.name}
          </Typography>
        </Tooltip>
        {item.id === SPECIAL_ITEMS.APPLIANCE_MISC && item.additional_notes && removeButton ? <Typography>{item.additional_notes}</Typography>
        : item.description ? <Typography>{item.description}</Typography>
        : <></>}
      </CardContent>
      <CardActions sx={{ overflow: 'hidden' }}>
        <ItemQuantityButton
          item={item}
          categoryCheckout={categoryCheckout}
          addItemToCart={addItemToCart}
          removeItemFromCart={removeItemFromCart}
          removeButton={removeButton}
          disableAdd={disableAdd}
          categoryLimit={categoryLimit}
          categoryName={categoryName}
        />
      </CardActions>
    </Card>
  );
};

export default CheckoutCard;
