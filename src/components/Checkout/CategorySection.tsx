import CheckoutCard from './CheckoutCard';
import { CategoryProps, CheckoutItemProp } from "../../types/interfaces";
import { Box, Grid, Typography } from '@mui/material';
import { useEffect, useState, useCallback } from 'react';

type CategorySectionProps = {
  category: CategoryProps;
  checkoutItem: CategoryProps;
  addItemToCart: (item: CheckoutItemProp, quantity: number) => void;
  removeItemFromCart: (itemId: number, categoryName: string) => void;
  removeButton: boolean;
  disabled: boolean;
};

const CategorySection = ({ category, checkoutItem, addItemToCart, removeItemFromCart, removeButton, disabled }: CategorySectionProps) => {

  const [disableAdd, setDisableAdd] = useState<boolean>(false);

  const checkLimit = useCallback(() => {
    if ((checkoutItem?.categoryCount ?? 0) >= category.checkout_limit) {
      setDisableAdd(true);
    } else {
      setDisableAdd(false);
    }

  }, [checkoutItem?.categoryCount, category.checkout_limit]);

  useEffect(() => {
    checkLimit();
  }, [checkoutItem?.categoryCount, checkLimit])

  return (
    <Box sx={{ paddingLeft: '5%', paddingRight: '5%', opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography sx={{ fontSize: '20px', marginY: '3%' }} id={category.category}>{category.category}</Typography>
        <Typography sx={{ fontSize: '20px', marginY: '3%' }}>
          {checkoutItem?.categoryCount} of {category.checkout_limit}
        </Typography>

      </Box>
      <Grid container spacing={2}
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
        }}
      >
        {category.items.map((item) => (
          <Grid item xs={12} sm={6} md={4} xl={3} key={item.id}>
            <CheckoutCard item={item} checkoutItem={checkoutItem} addItemToCart={addItemToCart} removeItemFromCart={removeItemFromCart} removeButton={removeButton} disableAdd={disableAdd} categoryLimit={category.checkout_limit} categoryName={category.category} />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default CategorySection;