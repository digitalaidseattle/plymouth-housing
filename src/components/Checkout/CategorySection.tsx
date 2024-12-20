import CheckoutCard from './CheckoutCard';
import { CategoryProps, CheckoutItemProp } from "../../types/interfaces";
import { Box, Grid, Typography } from '@mui/material';

type CategorySectionProps = {
  category: CategoryProps;
  checkoutItems: CheckoutItemProp[];
  addItemToCart: (item: CheckoutItemProp, quantity: number) => void;
  removeItemFromCart: (itemId: number) => void;
  removeButton: boolean;
  disabled: boolean;
};

const CategorySection = ({ category, checkoutItems, addItemToCart, removeItemFromCart, removeButton, disabled }: CategorySectionProps) => {
  return (
    <Box sx={{paddingLeft: '5%', paddingRight: '5%', opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto'}}>
      <Typography sx={{ fontSize: '20px', marginY: '3%' }} id={category.category}>{category.category}</Typography>
      <Grid container spacing={2}
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
        }}
      >
        {category.items.map((item) => (
          <Grid item xs={12} sm={6} md={4} xl={3} key={item.id}>
            <CheckoutCard item={item} checkoutItems={checkoutItems} addItemToCart={addItemToCart} removeItemFromCart={removeItemFromCart} removeButton={removeButton} />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default CategorySection;