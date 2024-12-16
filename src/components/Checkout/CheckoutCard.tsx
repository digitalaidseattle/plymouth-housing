import { Card, CardContent, CardActions, Typography } from '@mui/material';
import { CheckoutCardProps } from '../../types/interfaces';
import ItemQuantityButton from './ItemQuantityButton';

const CheckoutCard = ({item, checkoutItems, addItemToCart}: CheckoutCardProps) => {

  return (
    <Card
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '238px',
        height: '70px',
        margin: '10px',
        borderRadius: '10px',
      }}
    >
      <CardContent>
        <Typography sx={{fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{item.name}</Typography>
      </CardContent>
      <CardActions style={{ border: '1px red blue' }}>
        <ItemQuantityButton item={item} checkoutItems={checkoutItems} addItemToCart={addItemToCart}/>
      </CardActions>
    </Card>
  )
}

export default CheckoutCard;