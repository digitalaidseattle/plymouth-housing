import CheckoutCard from './CheckoutCard';
import { CategoryProps, CheckoutItemProp } from "../../types/interfaces";
import { Box } from '@mui/material';

type CategorySectionProps = {
  category: CategoryProps;
  checkoutItems: CheckoutItemProp[];
  addItemToCart: (item: CheckoutItemProp, quantity: number) => void;
  removeItemFromCart: (itemId: string) => void;
  removeButton: boolean;
};

const CategorySection = ({category, checkoutItems, addItemToCart, removeItemFromCart, removeButton}: CategorySectionProps) => {
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
          <CheckoutCard key={item.id} item={item} checkoutItems={checkoutItems} addItemToCart={addItemToCart} removeItemFromCart={removeItemFromCart} removeButton={removeButton}/>
        ))}
      </Box>
    </Box>
  )
}

export default CategorySection;