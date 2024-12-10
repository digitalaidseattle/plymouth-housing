import { Card, CardContent, CardActions } from '@mui/material';
import useState from 'react';
import { CheckoutItem } from '../../types/interfaces';

const CheckOutCard = () => {
  return (
    <Card
      key={item.id}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '238px',
        height: '70px',
        margin: '10px',
        borderRadius: '10px',
        backgroundColor: checkoutItems.find(
          (v: CheckoutItem) => v.id === item.id,
        )
          ? '#C0C0C0'
          : 'white',
      }}
    >
      <CardContent>
        <h4>{item.name}</h4>
      </CardContent>
      <CardActions style={{ border: '1px red blue' }}>
        {renderItemQuantityButtons(item)}
      </CardActions>
    </Card>
  )
}

export default CheckOutCard;