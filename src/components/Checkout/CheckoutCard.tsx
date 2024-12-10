import { Card, CardContent, CardActions } from '@mui/material';
import { CheckoutItem } from '../../types/interfaces';


type CheckOutCardProps = {
  item: CheckoutItem;
};

const CheckoutCard = ({item}: CheckOutCardProps) => {

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
      </CardActions>
    </Card>
  )
}

export default CheckoutCard;