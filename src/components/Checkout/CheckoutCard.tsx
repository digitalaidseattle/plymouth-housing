import { Card, CardContent, CardActions, Typography, Tooltip } from '@mui/material';
import { CheckoutCardProps } from '../../types/interfaces';
import ItemQuantityButton from './ItemQuantityButton';

const CheckoutCard = ({ item, checkoutItems, addItemToCart, removeItemFromCart, removeButton }: CheckoutCardProps) => {

  return (
    <Card key={item.name}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '90%',
        height: '100px',
        margin: '10px',
        borderRadius: '10px',
      }}
    >
      <CardContent sx={{ flex: '1', overflow: 'hidden', margin: '10px' }}>
        <Tooltip title={item.name} arrow>
          <Typography sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</Typography>
        </Tooltip>
      </CardContent>
      <CardActions style={{ border: '1px red blue', margin: '20px' }}>
        <ItemQuantityButton item={item} checkoutItems={checkoutItems} addItemToCart={addItemToCart} removeItemFromCart={removeItemFromCart} removeButton={removeButton}/>
      </CardActions>
    </Card>
  )
}

export default CheckoutCard;