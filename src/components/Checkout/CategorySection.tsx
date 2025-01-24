import CheckoutCard from './CheckoutCard';
import { CategoryProps, CheckoutItemProp } from "../../types/interfaces";
import { Box, Grid, Typography } from '@mui/material';

type CategorySectionProps = {
  category: CategoryProps;
  categoryCheckout: CategoryProps;
  addItemToCart: (item: CheckoutItemProp, quantity: number) => void;
  removeItemFromCart: (itemId: number, categoryName: string) => void;
  removeButton: boolean;
  disabled: boolean;
};

const CategorySection = ({ category, categoryCheckout, addItemToCart, removeItemFromCart, removeButton, disabled }: CategorySectionProps) => {

  return (
    <Box sx={{ paddingLeft: '5%', paddingRight: '5%', opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography sx={{ fontSize: '20px', marginY: '2%' }} id={category.category}>{category.category}</Typography>
        <Typography sx={{ fontSize: '20px'}}>
          {categoryCheckout?.categoryCount} of {category.checkout_limit}
        </Typography>

      </Box>
      <Grid container spacing={2}
        sx={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
        }}
      >
        {category.items.map((item) => (
          <Grid item xs={12} sm={6} md={4} xl={3} key={item.id}>
            <CheckoutCard item={item} categoryCheckout={categoryCheckout} addItemToCart={addItemToCart} removeItemFromCart={removeItemFromCart} removeButton={removeButton} categoryLimit={category.checkout_limit} categoryName={category.category} />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default CategorySection;