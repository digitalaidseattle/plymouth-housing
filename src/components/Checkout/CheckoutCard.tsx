import { Card, CardContent, CardActions, Typography, Tooltip } from '@mui/material';
import { CheckoutCardProps } from '../../types/interfaces';
import ItemQuantityButton from './ItemQuantityButton';
import { useCallback, useEffect, useState } from 'react';

const CheckoutCard = ({ item, categoryCheckout, addItemToCart, removeItemFromCart, removeButton, categoryLimit, categoryName, activeSection }: CheckoutCardProps) => {

  const [disableAdd, setDisableAdd] = useState<boolean>(false);

  const checkLimit = useCallback(() => {
    if ((categoryCheckout?.categoryCount ?? 0) >= categoryLimit) {
      setDisableAdd(true);
    } else {
      setDisableAdd(false);
    }

  }, [categoryCheckout?.categoryCount, categoryLimit]);

  const checkActiveSection = useCallback(() => {
    if (activeSection === 'welcomeBasket') {
      setDisableAdd(categoryName !== 'Welcome Basket');
    } else if (activeSection === 'general') {
      setDisableAdd(categoryName === 'Welcome Basket');
    }
  }, [activeSection, categoryName]);

  useEffect(() => {
    checkLimit();
  }, [categoryCheckout?.categoryCount, checkLimit])

  useEffect(() => {
    checkActiveSection();
  }, [checkActiveSection])

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
        <ItemQuantityButton item={item} categoryCheckout={categoryCheckout} addItemToCart={addItemToCart} removeItemFromCart={removeItemFromCart} removeButton={removeButton} disableAdd={disableAdd} categoryLimit={categoryLimit} categoryName={categoryName} />
      </CardActions>
    </Card>
  )
}

export default CheckoutCard;