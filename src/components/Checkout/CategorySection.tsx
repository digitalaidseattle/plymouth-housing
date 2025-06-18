import CheckoutCard from './CheckoutCard';
import { CategoryProps, CheckoutHistoryItem, CheckoutItemProp } from "../../types/interfaces";
import { Box, Grid, Typography } from '@mui/material';

type CategorySectionProps = {
  category: CategoryProps;
  categoryCheckout: CategoryProps;
  addItemToCart: (item: CheckoutItemProp, quantity: number, category: string) => void;
  removeItemFromCart: (itemId: number, categoryName: string) => void;
  removeButton: boolean;
  disabled: boolean;
  activeSection: string;
  checkoutHistory: CheckoutHistoryItem[];
};

const CategorySection = ({ 
  category, 
  categoryCheckout, 
  addItemToCart, 
  removeItemFromCart, 
  removeButton, 
  disabled, 
  activeSection, 
  checkoutHistory 
  }: CategorySectionProps) => {

  return (
    <Box sx={{ paddingX: removeButton ? '0%' : '5%', paddingBottom: '3%', opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ fontSize: { xs: '14px', md: '20px' }, marginY: '3%', marginRight: '30px' }} id={category.category}>{category.category}</Typography>
          {removeButton ? null : <Typography sx={{ fontSize: { xs: '12px', md: '16px' }, color: '#666666' }}>{category.items.length} items</Typography>}
        </Box>
        <Typography sx={{ fontSize: { xs: '12px', md: '16px' }, backgroundColor: '#ECECEC', borderRadius: '20px', paddingY: '4px', paddingX: '12px' }}>
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
          <Grid size = {removeButton ? {xs:12, sm:12, md:12, xl:12} : {xs:12, sm:6, md:4, xl:3}}
            key={item.id}
          >
            <CheckoutCard 
              item={item} 
              categoryCheckout={categoryCheckout} 
              addItemToCart={addItemToCart} 
              removeItemFromCart={removeItemFromCart} 
              removeButton={removeButton} 
              categoryLimit={category.checkout_limit} 
              categoryName={category.category} 
              activeSection={activeSection}
              checkoutHistory={checkoutHistory}
              />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default CategorySection;