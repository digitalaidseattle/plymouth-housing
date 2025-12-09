import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Tooltip,
  Chip,
} from '@mui/material';
import { CheckoutCardProps } from '../../types/interfaces';
import ItemQuantityButton from './ItemQuantityButton';

const CheckoutCard = ({
  item,
  categoryCheckout,
  addItemToCart,
  removeItemFromCart,
  removeButton,
  categoryLimit,
  categoryName,
  activeSection,
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

  // Derive disableAdd directly from props - no need for state or effects
  const disableAdd = (() => {
    if (activeSection === '') {
      return false;
    }

    if (activeSection === 'general') {
      return categoryName === 'Welcome Basket';
    }

    if (activeSection === 'welcomeBasket') {
      if (categoryName !== 'Welcome Basket') {
        return true;
      }

      const itemName = categoryCheckout.items[0]?.name.toLowerCase() ?? '';
      if (itemName === item.name.toLowerCase()) {
        return pastCheckout;
      } else {
        return true;
      }
    }

    return false;
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
        {pastCheckout && item.id !== 166 && <Chip label={`Checked out ${timesCheckedOut()}x`} sx={{ background: 'rgb(216, 241, 205)', marginBottom: '0.5rem' }} />}
        <Tooltip title={item.name} arrow>
          <Typography
            sx={{
              fontSize: removeButton ? '14px' : '20px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {item.name}
          </Typography>
        </Tooltip>
        {item.id === 166 && item.additional_notes && removeButton ? <Typography>{item.additional_notes}</Typography>
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
