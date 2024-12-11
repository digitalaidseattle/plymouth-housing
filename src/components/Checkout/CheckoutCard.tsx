import { Card, CardContent, CardActions } from '@mui/material';
import { CheckoutCardProps } from '../../types/interfaces';
import ItemQuantityButton from './ItemQuantityButton';

const CheckoutCard = ({item, checkoutItems, setCheckoutItems}: CheckoutCardProps) => {

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
        <h4>{item.name}</h4>
      </CardContent>
      <CardActions style={{ border: '1px red blue' }}>
        <ItemQuantityButton item={item} checkoutItems={checkoutItems} setCheckoutItems={setCheckoutItems} />
      </CardActions>
    </Card>
  )
}

export default CheckoutCard;