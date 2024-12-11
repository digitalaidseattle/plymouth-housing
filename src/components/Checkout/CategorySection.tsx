import React from 'react'
import CheckoutCard from './CheckoutCard';
import { CategoryProps, CheckoutItem } from "../../types/interfaces";

type CategorySectionProps = {
  category: CategoryProps;
  checkoutItems: CheckoutItem[];
  setCheckoutItems: React.Dispatch<React.SetStateAction<CheckoutItem[]>>;
};

const CategorySection = ({
  category,
  checkoutItems,
  setCheckoutItems,
}: CategorySectionProps) => {
  return (
    <div key={category.category}>
      <h3 style={{ margin: '20px 20px' }}>{category.category}</h3>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
        }}
      >
        {category.items.map((item) => (
          <CheckoutCard item={item} checkoutItems={checkoutItems} setCheckoutItems={setCheckoutItems} />
        ))}
      </div>
    </div>
  )
}

export default CategorySection;