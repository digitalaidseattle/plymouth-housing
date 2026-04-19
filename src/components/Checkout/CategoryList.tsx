import { Box, Grid, Typography } from '@mui/material';
import {
  CategoryProps,
  CheckoutHistoryItem,
  CheckoutItemProp,
  CheckoutType,
} from '../../types/interfaces';
import CategorySection from './CategorySection';
import CheckoutCard from './CheckoutCard';
import { SPECIAL_ITEMS } from '../../types/constants';

type CategoryListProps = {
  categories: CategoryProps[];
  checkoutItems: CategoryProps[];
  sectionType: CheckoutType;
  activeSection: string;
  checkoutHistory: CheckoutHistoryItem[]; //list of tracked items only. Not the full history
  searchActive: boolean;
  addItemToCart: (
    item: CheckoutItemProp,
    quantity: number,
    category: string,
    section: string,
  ) => void;
  removeItemFromCart: (itemId: number, categoryName: string) => void;
  onApplianceMiscClick: (item: CheckoutItemProp) => void;
  onPastCheckoutClick: (item: CheckoutItemProp) => void;
};

const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  checkoutItems,
  sectionType,
  activeSection,
  checkoutHistory,
  searchActive,
  addItemToCart,
  removeItemFromCart,
  onApplianceMiscClick,
  onPastCheckoutClick,
}) => {
  const getMatchingCategory = (categoryName: string): CategoryProps =>
    checkoutItems.find((cat) => cat.category === categoryName) || {
      id: 0,
      category: '',
      items: [],
      checkout_limit: 0,
      categoryCount: 0,
    };

  const wrappedAddItemToCart = (
    item: CheckoutItemProp,
    quantity: number,
    categoryName: string,
  ): void => {
    if (quantity > 0) {
      if (item.id === SPECIAL_ITEMS.APPLIANCE_MISC) {
        onApplianceMiscClick(item);
        return;
      }
      if (
        checkoutHistory.some((historyItem) => historyItem.item_id === item.id)
      ) {
        onPastCheckoutClick(item);
        return;
      }
    }
    addItemToCart(item, quantity, categoryName, sectionType);
  };

  if (searchActive) {
    return (
      <Grid
        container
        spacing={2}
        sx={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          paddingLeft: '5%',
          paddingRight: '5%',
          paddingY: '2.5%',
        }}
      >
        {categories.map((section: CategoryProps) => {
          const matchingCategory = getMatchingCategory(section.category);
          return section.items.map((item: CheckoutItemProp) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, xl: 3 }} key={item.id}>
              <CheckoutCard
                item={item}
                categoryCheckout={matchingCategory}
                addItemToCart={(item, quantity) =>
                  wrappedAddItemToCart(item, quantity, section.category)
                }
                activeSection={activeSection}
                removeItemFromCart={removeItemFromCart}
                removeButton={false}
                categoryLimit={section.checkout_limit}
                categoryName={section.category}
                checkoutHistory={checkoutHistory}
              />
            </Grid>
          ));
        })}
      </Grid>
    );
  }

  return (
    <Box>
      {sectionType === 'welcomeBasket' && (
        <Typography
          id="Welcome Basket"
          variant="h4"
          sx={{
            paddingLeft: '5%',
            paddingTop: '5%',
            fontWeight: 'bold',
          }}
        >
          Welcome Basket
        </Typography>
      )}
      {categories.map((category) => (
        <CategorySection
          key={category.id}
          category={category}
          categoryCheckout={getMatchingCategory(category.category)}
          addItemToCart={(item, quantity) =>
            wrappedAddItemToCart(item, quantity, category.category)
          }
          removeItemFromCart={removeItemFromCart}
          removeButton={false}
          disabled={activeSection !== '' && activeSection !== sectionType} // TODO(#445): always false now, remove with activeSection cleanup
          activeSection={activeSection} // TODO(#445): remove with activeSection cleanup
          checkoutHistory={checkoutHistory}
        />
      ))}
    </Box>
  );
};

export default CategoryList;
