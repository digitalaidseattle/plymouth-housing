import CheckoutCard from './CheckoutCard';
import { CategoryProps, CheckoutItemProp } from "../../types/interfaces";
import { Box, Grid } from '@mui/material';

type CategorySectionProps = {
  category: CategoryProps;
  checkoutItems: CheckoutItemProp[];
  addItemToCart: (item: CheckoutItemProp, quantity: number) => void;
  removeItemFromCart: (itemId: string) => void;
  removeButton: boolean;
};

const CategorySection = ({ category, checkoutItems, addItemToCart, removeItemFromCart, removeButton }: CategorySectionProps) => {
  return (
    <Box>
      <h3 style={{ margin: '20px 20px' }}>{category.category}</h3>
      <Grid container spacing={2}
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
        }}
      >
        {category.items.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <CheckoutCard item={item} checkoutItems={checkoutItems} addItemToCart={addItemToCart} removeItemFromCart={removeItemFromCart} removeButton={removeButton} />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default CategorySection;