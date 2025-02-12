import CheckoutCard from './CheckoutCard';
import { CategoryProps, CheckoutItemProp } from "../../types/interfaces";
import { Box, Grid, Typography } from '@mui/material';

type CategorySectionProps = {
  category: CategoryProps;
  categoryCheckout: CategoryProps;
  addItemToCart: (item: CheckoutItemProp, quantity: number, category: string) => void;
  removeItemFromCart: (itemId: number, categoryName: string) => void;
  removeButton: boolean;
  disabled: boolean;
};

const CategorySection = ({ category, categoryCheckout, addItemToCart, removeItemFromCart, removeButton, disabled }: CategorySectionProps) => {

  return (
    <Box sx={{ paddingX: removeButton ? '0%' : '5%', paddingBottom: '3%', opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ fontSize: { xs: '14px', md: '20px' }, marginY: '3%', marginRight: '30px' }} id={category.category}>{category.category}</Typography>
          {removeButton ? null : <Typography sx={{ fontSize: '16px', color: '#666666' }}>{category.items.length} items</Typography>}
        </Box>
        <Typography sx={{ fontSize: '16px', backgroundColor: '#ECECEC', borderRadius: '20px', paddingY: '4px', paddingX: '12px' }}>
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
          <Grid
          item
          xs={removeButton ? 12 : 12}
          sm={removeButton ? 12 : 6}
          md={removeButton ? 12 : 4}
          xl={removeButton ? 12 : 3}
          key={item.id}
        >
            <CheckoutCard item={item} categoryCheckout={categoryCheckout} addItemToCart={addItemToCart} removeItemFromCart={removeItemFromCart} removeButton={removeButton} categoryLimit={category.checkout_limit} categoryName={category.category} />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default CategorySection;