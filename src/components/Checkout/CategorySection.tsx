import CheckoutCard from './CheckoutCard';
import { CategoryProps, CheckoutItemProp } from "../../types/interfaces";
import { Box, Typography } from '@mui/material';

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
    <Box sx={{ paddingLeft: '5%', paddingRight: '5%', paddingBottom: '3%', opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ fontSize: '20px', marginY: '3%', marginRight: '30px' }} id={category.category}>{category.category}</Typography>
          <Typography sx={{ fontSize: '16px', color: '#666666' }}>{category.items.length} items</Typography>
        </Box>
        <Typography sx={{ fontSize: '20px', backgroundColor: '#e0e0e0', borderRadius: '20px', paddingY: '4px', paddingX: '12px' }}>
          {categoryCheckout?.categoryCount} of {category.checkout_limit}
        </Typography>

      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {sm: '1fr', md: 'repeat(2, 1fr)', lg:'repeat(4, 1fr)'},
          gridTemplateRows: 'auto',
          gap: '1rem',
          gridAutoFlow: 'row dense' 
        }}
      >
        {category.items.map((item) => {
          if (!item.description) {
            return (
            <Box>
            <CheckoutCard item={item} categoryCheckout={categoryCheckout} addItemToCart={addItemToCart} removeItemFromCart={removeItemFromCart} removeButton={removeButton} categoryLimit={category.checkout_limit} categoryName={category.category} />
          </Box>)
          } else {
            return (
              <Box sx={{gridColumn: {sm: 'auto', md: 'span 2'}}}>
              <CheckoutCard item={item} categoryCheckout={categoryCheckout} addItemToCart={addItemToCart} removeItemFromCart={removeItemFromCart} removeButton={removeButton} categoryLimit={category.checkout_limit} categoryName={category.category} />
            </Box>)
          }
        })}
      </Box>
    </Box>
  )
}

export default CategorySection;