import CheckoutCard from './CheckoutCard';
import { CategoryProps, CheckoutItem } from "../../types/interfaces";
import { Box } from '@mui/material';

type CategorySectionProps = {
  category: CategoryProps;
  checkoutItems: CheckoutItem[];
  addItemToCart: (item: CheckoutItem, quantity: number) => void;
};

const CategorySection = ({
  category,
  checkoutItems,
  addItemToCart
}: CategorySectionProps) => {
  return (
    <Box key={category.category}>
      <h3 style={{ margin: '20px 20px' }}>{category.category}</h3>
      <Box
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
        }}
      >
        {category.items.map((item) => (
          <CheckoutCard item={item} checkoutItems={checkoutItems} addItemToCart={addItemToCart}/>
        ))}
      </Box>
    </Box>
  )
}

export default CategorySection;