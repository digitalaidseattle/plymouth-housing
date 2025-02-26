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
    <Card key={item.name} variant='outlined'
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        minHeight: '10vh',
        borderColor: removeButton ? '#D9D9D9' : null,
        borderWidth: removeButton ? '1px' : null,
        borderRadius: '15px',
        paddingX: '10px',
      }}
    >
      <CardContent sx={{ flex: '1', overflow: 'hidden' }}>
        <Tooltip title={item.name} arrow>
          <Typography sx={{ fontSize: removeButton ? '14px' : '20px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</Typography>
        </Tooltip>
      </CardContent>
      <CardActions sx={{ overflow: 'hidden'}}>
        <ItemQuantityButton item={item} categoryCheckout={categoryCheckout} addItemToCart={addItemToCart} removeItemFromCart={removeItemFromCart} removeButton={removeButton} disableAdd={disableAdd} categoryLimit={categoryLimit} categoryName={categoryName} />
      </CardActions>
    </Card>
  )
}

export default CheckoutCard;