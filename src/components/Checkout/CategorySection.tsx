import CheckoutCard from './CheckoutCard';
import { CategoryProps, CheckoutItem } from "../../types/interfaces";
import { Box, Grid, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

type CategorySectionProps = {
  category: CategoryProps;
  checkoutItems: CheckoutItem[];
  addItemToCart: (item: CheckoutItem, quantity: number) => void;
  removeItemFromCart: (itemId: number) => void;
  removeButton: boolean;
  disabled: boolean;
};

const CategorySection = ({ category, checkoutItems, addItemToCart, removeItemFromCart, removeButton, disabled }: CategorySectionProps) => {

  const [categoryCount, setCategoryCount] = useState<number>(0);
  const [disableAdd, setDisableAdd] = useState<boolean>(false);

  const checkLimit = () => {
    if (categoryCount >= category.checkout_limit) {
      setDisableAdd(true);
    } else {
      setDisableAdd(false);
    }
  }

  useEffect(() => {
    checkLimit();
  }, [categoryCount])

  return (
    <Box sx={{ paddingLeft: '5%', paddingRight: '5%', opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography sx={{ fontSize: '20px', marginY: '3%' }} id={category.category}>{category.category}</Typography>
        <Typography sx={{ fontSize: '20px', marginY: '3%' }}>{categoryCount} of {category.checkout_limit}</Typography>
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
            <CheckoutCard item={item} checkoutItems={checkoutItems} addItemToCart={addItemToCart} removeItemFromCart={removeItemFromCart} removeButton={removeButton} setCategoryCount={setCategoryCount} disableAdd={disableAdd}/>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default CategorySection;