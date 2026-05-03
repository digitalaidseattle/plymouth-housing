import CheckoutCard from './CheckoutCard';

import {
  CategoryProps,
  CheckoutHistoryItem,
  CheckoutItemProp,
} from '../../types/interfaces';
import { Box, Grid, Typography } from '@mui/material';

type CategorySectionProps = {
  category: CategoryProps;
  categoryCheckout: CategoryProps;
  addItemToCart: (
    item: CheckoutItemProp,
    quantity: number,
    category: string,
  ) => void;
  removeItemFromCart: (itemId: number, categoryName: string) => void;
  removeButton: boolean;
  disabled: boolean;
  activeSection: string;
  checkoutHistory?: CheckoutHistoryItem[];
};

const CategorySection = ({
  category,
  categoryCheckout,
  addItemToCart,
  removeItemFromCart,
  removeButton,
  disabled,
  activeSection,
  checkoutHistory,
}: CategorySectionProps) => {
  return (
    <Box
      sx={{
        px: removeButton ? 0 : 5,
        pb: 3,
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography
            sx={{
              typography: { xs: 'body2', md: 'h5' },
              my: 2,
              mr: 4,
            }}
            id={category.category}
          >
            {category.category}
          </Typography>
          {removeButton ? null : (
            <Typography
              sx={{ typography: 'body2', color: '#666666' }}
            >
              {category.items.length} items
            </Typography>
          )}
        </Box>
        <Typography
          sx={{
            typography: 'body2',
            backgroundColor:
              categoryCheckout?.categoryCount > category.checkout_limit
                ? '#ffebee'
                : '#ECECEC',
            color:
              categoryCheckout?.categoryCount > category.checkout_limit
                ? '#c62828'
                : 'inherit',
            borderRadius: '20px',
            py: 0.5,
            px: 1.5,
          }}
        >
          {categoryCheckout?.categoryCount} of {category.checkout_limit}
          {categoryCheckout?.categoryCount > category.checkout_limit &&
            ' (Over usual limit)'}
        </Typography>
      </Box>
      <Grid
        container
        spacing={2}
        sx={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
        }}
      >
        {category.items.map((item) => (
          <Grid
            size={
              removeButton
                ? { xs: 12, sm: 12, md: 12, xl: 12 }
                : { xs: 12, sm: 6, md: 4, xl: 3 }
            }
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
  );
};

export default CategorySection;
