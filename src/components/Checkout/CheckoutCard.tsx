import { Card, CardContent, CardActions, Typography, Tooltip, Chip } from '@mui/material';
import { CheckoutCardProps } from '../../types/interfaces';
import ItemQuantityButton from './ItemQuantityButton';
import { useCallback, useEffect, useState } from 'react';

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

  const [disableAdd, setDisableAdd] = useState<boolean>(false);

  const pastCheckout = checkoutHistory ? checkoutHistory.map(i => i.item_id).includes(item.id) : false;
  
  const timesCheckedOut = () => {
     if (!checkoutHistory || !pastCheckout) return 0;
    const indexOfItem = checkoutHistory.map(i => i.item_id).indexOf(item.id);
    if (indexOfItem !== -1) { 
      return checkoutHistory[indexOfItem].timesCheckedOut 
    } 
    return 0;
  }

  const checkConditions = useCallback(async () => {
    if ((categoryCheckout?.categoryCount ?? 0) >= categoryLimit) {
      setDisableAdd(true);
      return;
    }

    if (activeSection === '') {
      setDisableAdd(false);
      return;
    }

    if (activeSection === 'general') {
      setDisableAdd(categoryName === 'Welcome Basket');
      return;
    }

    if (activeSection === 'welcomeBasket') {
      if (categoryName !== 'Welcome Basket') {
        setDisableAdd(true);
        return;
      }

      const itemName = categoryCheckout.items[0].name.toLowerCase();
      if (itemName === item.name.toLowerCase()) {
        setDisableAdd(false);
      } else {
        setDisableAdd(true);
      }

      if (pastCheckout) {
        setDisableAdd(true);
      }
    }
  }, [categoryCheckout, categoryLimit, categoryName, item.name, activeSection, pastCheckout]);

  useEffect(() => {
    checkConditions();
  }, [categoryCheckout.categoryCount, checkConditions])


  return (
    <Card key={item.name} variant='outlined'
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
        <Tooltip title={item.name} arrow>
          <Typography sx={{ fontSize: removeButton ? '14px' : '20px', fontWeight: removeButton ? '600' : 'inherit', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</Typography>
        </Tooltip>
        {item.id === 166 && item.additional_notes && removeButton ? <Typography>{item.additional_notes}</Typography>
        : item.description ? <Typography>{item.description}</Typography>
        : <></>}
      </CardContent>
      
      <CardActions sx={{ overflow: 'hidden'}}>
        {pastCheckout && item.id !== 166 && <Chip label={`Checked out ${timesCheckedOut()}x`} sx={{ background: 'rgb(216, 241, 205)' }} />}
        <ItemQuantityButton item={item} categoryCheckout={categoryCheckout} addItemToCart={addItemToCart} removeItemFromCart={removeItemFromCart} removeButton={removeButton} disableAdd={disableAdd} categoryLimit={categoryLimit} categoryName={categoryName} />
      </CardActions> 
    </Card>
  )
}

export default CheckoutCard;