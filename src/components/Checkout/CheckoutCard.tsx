/**
 *  CheckoutCard.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
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
  checkoutHistory,
  selectedWelcomeItemName,
}: CheckoutCardProps) => {
  const pastCheckout = checkoutHistory
    ? checkoutHistory.map((i) => i.item_id).includes(item.id)
    : false;

  const timesCheckedOut = () => {
    if (!checkoutHistory || !pastCheckout) return 0;
    const indexOfItem = checkoutHistory.map((i) => i.item_id).indexOf(item.id);
    if (indexOfItem !== -1) {
      return checkoutHistory[indexOfItem].timesCheckedOut;
    }
    return 0;
  };

  // On the Welcome Basket page, lock the checkout to a single basket type:
  // once one basket item is in the cart (in ANY category), any item with a
  // different name is disabled. selectedWelcomeItemName is derived by the parent
  // from the full cart; fall back to this category's cart when it isn't provided.
  const disableAdd = (() => {
    if (checkoutType !== 'welcomeBasket') return false;
    const selectedName = (
      selectedWelcomeItemName ?? categoryCheckout.items[0]?.name ?? ''
    ).toLowerCase();
    if (selectedName === '') return false;
    if (selectedName === item.name.toLowerCase()) return pastCheckout;
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
        minHeight: '8vh',
        borderColor: removeButton ? '#D9D9D9' : null,
        borderWidth: removeButton ? '1px' : null,
        borderRadius: '12px',
        px: 0.5,
      }}
    >
      <CardContent sx={{ flex: '1', overflow: 'visible', py: 2, px: 2 }}>
        {pastCheckout && item.id !== SPECIAL_ITEMS.APPLIANCE_MISC && (
          <Chip
            label={`Checked out ${timesCheckedOut()}x`}
            sx={{ background: 'rgb(216, 241, 205)', marginBottom: 0.5 }}
          />
        )}
        <Tooltip title={item.name} arrow>
          <Typography
            variant={removeButton ? 'body2' : 'h5'}
            sx={{
              whiteSpace: 'normal',
              overflowWrap: 'break-word',
              wordBreak: 'break-word',
            }}
          >
            {item.name}
          </Typography>
        </Tooltip>
        {item.id === SPECIAL_ITEMS.APPLIANCE_MISC &&
        item.additional_notes &&
        removeButton ? (
          <Typography>{item.additional_notes}</Typography>
        ) : item.description ? (
          <Typography>{item.description}</Typography>
        ) : (
          <></>
        )}
      </CardContent>
      <CardActions sx={{ overflow: 'hidden', p: 0.5 }}>
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