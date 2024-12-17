import CheckoutCard from './CheckoutCard';
import { CategoryProps, CheckoutItemProp } from "../../types/interfaces";
import { Box } from '@mui/material';

type CategorySectionProps = {
  category: CategoryProps;
  checkoutItems: CheckoutItemProp[];
  addItemToCart: (item: CheckoutItemProp, quantity: number) => void;
};

const CategorySection = ({
  category,
  checkoutItems,
  addItemToCart
}: CategorySectionProps) => {
  return (
    <Box>
      <h3 style={{ margin: '20px 20px' }}>{category.category}</h3>
      <Box
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
        }}
      >
        {category.items.map((item) => (
          <CheckoutCard key={item.id} item={item} checkoutItems={checkoutItems} addItemToCart={addItemToCart}/>
        ))}
      </Box>
    </Box>
  )
}

export default CategorySection;