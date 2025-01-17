import { Card, CardContent, CardActions, Typography, Tooltip } from '@mui/material';
import { CheckoutCardProps } from '../../types/interfaces';
import ItemQuantityButton from './ItemQuantityButton';

const CheckoutCard = ({ item, checkoutItem, addItemToCart, removeItemFromCart, removeButton, disableAdd, categoryLimit, categoryName }: CheckoutCardProps) => {

  return (
    <Card key={item.name}
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        minHeight: '10vh',
        borderRadius: '10px',
      }}
    >
      <CardContent sx={{ flex: '1', overflow: 'hidden', marginLeft: '10px', width: '100%' }}>
        <Tooltip title={item.name} arrow>
          <Typography sx={{ fontSize: '20px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</Typography>
        </Tooltip>
      </CardContent>
      <CardActions style={{ border: '1px red blue', marginRight: '20px' }}>
        <ItemQuantityButton item={item} checkoutItem={checkoutItem} addItemToCart={addItemToCart} removeItemFromCart={removeItemFromCart} removeButton={removeButton} disableAdd={disableAdd} categoryLimit={categoryLimit} categoryName={categoryName} />
      </CardActions>
    </Card>
  )
}

export default CheckoutCard;