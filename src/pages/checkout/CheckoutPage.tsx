import { useState, useEffect, useContext, useCallback } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { Building, CategoryProps, CheckoutItemProp } from '../../types/interfaces';
import { ENDPOINTS, HEADERS } from '../../types/constants';
import { getRole, UserContext } from '../../components/contexts/UserContext';
import { CheckoutDialog } from '../../components/Checkout/CheckoutDialog';
import CategorySection from '../../components/Checkout/CategorySection';
import CheckoutFooter from '../../components/Checkout/CheckoutFooter';
import BuildingCodeSelect from '../../components/Checkout/BuildingCodeSelect';
// import SearchBar from '../../components/Checkout/SearchBar';
import Navbar from '../../components/Checkout/Navbar';
import ScrollToTopButton from '../../components/Checkout/ScrollToTopButton';
// import CheckoutCard from '../../components/Checkout/CheckoutCard';

const CheckoutPage = () => {
  const { user } = useContext(UserContext);
  const [welcomeBasketData, setWelcomeBasketData] = useState<CategoryProps[]>([]);
  const [data, setData] = useState<CategoryProps[]>([]);
  // const [searchData, setSearchData] = useState<CategoryProps[]>([]);
  // const [searchActive, setSearchActive] = useState<boolean>(false);
  const [filteredData, setFilteredData] = useState<CategoryProps[]>([]);
  const [checkoutItems, setCheckoutItems] = useState<CategoryProps[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [openSummary, setOpenSummary] = useState<boolean>(false);
  const [selectedBuildingCode, setSelectedBuildingCode] = useState<string>('');
  const [activeSection, setActiveSection] = useState<string>('');

  const addItemToCart = (
    item: CheckoutItemProp,
    quantity: number,
    category: string,
    section: string
  ) => {
    // Lock active section if none is set, or allow only the active section
    if (!activeSection || activeSection === section) {
      const updatedCheckoutItems = [...checkoutItems];
      const categoryIndex = updatedCheckoutItems.findIndex(
        (cat: CategoryProps) => cat.category === category
      );

      if (categoryIndex !== -1) {
        // Found the category
        const categoryData = updatedCheckoutItems[categoryIndex];
        const categoryItems = [...categoryData.items];
        const itemIndex = categoryItems.findIndex(
          (addedItem: CheckoutItemProp) => addedItem.id === item.id
        );

        if (itemIndex !== -1) {
          // Update the item's quantity or remove it if quantity <= 0
          const foundItem = categoryItems[itemIndex];
          const newQuantity = foundItem.quantity + quantity;

          if (newQuantity <= 0) {
            categoryItems.splice(itemIndex, 1); // Remove item
          } else {
            categoryItems[itemIndex] = { ...foundItem, quantity: newQuantity };
          }
        } else if (quantity > 0) {
          // Add a new item to the category's items array
          categoryItems.push({ ...item, quantity });
          setActiveSection(section); // Lock the active section
        }

        // Update the category's `items` and `categoryCount`
        const newCategoryCount = categoryItems.reduce(
          (acc, currentItem) => acc + currentItem.quantity,
          0
        );
        updatedCheckoutItems[categoryIndex] = {
          ...categoryData,
          items: categoryItems,
          categoryCount: newCategoryCount,
        };
      }

      // Update the `checkoutItems` state
      setCheckoutItems(updatedCheckoutItems);

      // Reset activeSection if the cart becomes empty
      const isCartEmpty = updatedCheckoutItems.every(
        (cat) => cat.items.length === 0
      );
      if (isCartEmpty) {
        setActiveSection('');
      }
    }
  };

  const removeItemFromCart = (itemId: number, categoryName: string) => {
    setCheckoutItems((prevCheckoutItems) =>
      prevCheckoutItems.map((category) => {
        if (category.category === categoryName) {
          const updatedItems = category.items.filter(
            (addedItem: CheckoutItemProp) => addedItem.id !== itemId
          );

          const updatedCategoryCount = updatedItems.reduce(
            (count, item) => count + item.quantity,
            0
          );

          return {
            ...category,
            items: updatedItems,
            categoryCount: updatedCategoryCount,
          };
        }
        return category;
      })
    );
  };


  const scrollToCategory = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const fetchBuildings = useCallback(async () => {
    try {
      HEADERS['X-MS-API-ROLE'] = getRole(user);
      const response = await fetch(ENDPOINTS.BUILDINGS, { headers: HEADERS, method: 'GET' });
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const data = await response.json();
      setBuildings(data.value);
    }
    catch (error) {
      console.error('Error fetching buildings:', error);
    }
  }, [user]);

  const fetchData = useCallback(async () => {
    try {
      HEADERS['X-MS-API-ROLE'] = getRole(user);
      const response = await fetch(ENDPOINTS.CATEGORIZED_ITEMS, { headers: HEADERS, method: 'GET' });
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const responseData = await response.json();
      setData(responseData.value);

      const cleanCheckout = responseData.value.map((category: CategoryProps) => ({
        ...category,
        categoryCount: 0,
        items: [],
      }));

      // Create clean checkout array
      setCheckoutItems(cleanCheckout);

      //this part is a bit tricky. PH has 2 different welcome baskets: one for full-size and one for twin-size. See documentation
      const welcomeBasket = responseData.value.filter((category: CategoryProps) => category.category === 'Welcome Basket') || [];
      welcomeBasket[0].items = welcomeBasket[0].items.filter((item: CheckoutItemProp) =>
        item.name.toLowerCase().includes('full-size sheet set') ||
        item.name.toLowerCase().includes('twin-size sheet set')
      );
      setWelcomeBasketData(welcomeBasket);

    }
    catch (error) {
      console.error('Error fetching inventory:', error); //TODO show more meaningful error to end user.
    }
  }, [user]);

  useEffect(() => {
    fetchBuildings();
    fetchData();
  }, [fetchData, fetchBuildings])

  useEffect(() => {
    setFilteredData(data.filter((item: CategoryProps) => item.category !== 'Welcome Basket'));
  }, [data])

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
        <BuildingCodeSelect buildings={buildings} selectedBuildingCode={selectedBuildingCode} setSelectedBuildingCode={setSelectedBuildingCode} />
        {/* <SearchBar data={data} setSearchData={setSearchData} setSearchActive={setSearchActive} /> */}
      </Box>
      <Box>
        <Navbar filteredData={filteredData} scrollToCategory={scrollToCategory} />
      </Box>
      <Box sx={{ backgroundColor: '#F0F0F0', borderRadius: '15px' }}>
        {/* {searchActive ? (
          <Grid container spacing={2} sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
            {searchData.map((section: CategoryProps) => {
              const matchingCategory =
                checkoutItems.find((cat) => cat.category === section.category) || {
                  id: 0,
                  category: '',
                  items: [],
                  checkout_limit: 0,
                  categoryCount: 0,
                };

              return section.items.map((item: CheckoutItemProp) => (
                <Grid item xs={12} sm={6} md={4} xl={3} key={item.id}>
                  <CheckoutCard
                    item={item}
                    categoryCheckout={matchingCategory}
                    addItemToCart={(item, quantity) => {
                      addItemToCart(item, quantity, section.category, section.category);
                    }}
                    removeItemFromCart={removeItemFromCart}
                    removeButton={false}
                    categoryLimit={section.checkout_limit}
                    categoryName={section.category}
                  />
                </Grid>
              ));
            })}

          </Grid>
        ) : */}

          {/* <Box> */}
            <Typography id="Welcome Basket" sx={{ paddingLeft: '5%', paddingTop: '5%', fontSize: '24px', fontWeight: 'bold' }}>Welcome Basket</Typography>

            {/* Filters for welcome basket  */}
            {welcomeBasketData.map((category) => {
              const matchingCategory = checkoutItems.find(
                (cat) => cat.category === category.category
              ) || { id: 0, category: '', items: [], checkout_limit: 0, categoryCount: 0 };
              return (
                <CategorySection
                  key={category.id}
                  category={category}
                  categoryCheckout={matchingCategory}
                  addItemToCart={(item, quantity) =>
                    addItemToCart(item, quantity, category.category, 'welcomeBasket')}
                  removeItemFromCart={removeItemFromCart}
                  removeButton={false}
                  disabled={activeSection !== '' && activeSection !== 'welcomeBasket'}
                />
              );
            })}

            <Typography sx={{ paddingLeft: '5%', paddingTop: '5%', fontSize: '24px', fontWeight: 'bold' }}>General</Typography>

            {/* Filters for general items */}
            {filteredData.map((category) => {
              const matchingCategory = checkoutItems.find(
                (cat) => cat.category === category.category
              ) || { id: 0, category: '', items: [], checkout_limit: 0, categoryCount: 0 };
              return (
                <CategorySection
                  key={category.id}
                  category={category}
                  categoryCheckout={matchingCategory}
                  addItemToCart={(item, quantity) =>
                    addItemToCart(item, quantity, category.category, 'general')}
                  removeItemFromCart={removeItemFromCart}
                  removeButton={false}
                  disabled={activeSection !== '' && activeSection !== 'general'}
                />
              );
            })}
          {/* </Box>} */}

        <CheckoutFooter checkoutItems={checkoutItems} setOpenSummary={setOpenSummary} selectedBuildingCode={selectedBuildingCode} />

        <ScrollToTopButton showAfter={300} />
        <CheckoutDialog
          open={openSummary}
          onClose={() => setOpenSummary(false)}
          checkoutItems={checkoutItems}
          welcomeBasketData={welcomeBasketData}
          addItemToCart={(item, quantity, category) => addItemToCart(item, quantity, category, activeSection)}
          setCheckoutItems={setCheckoutItems}
          removeItemFromCart={removeItemFromCart}
          selectedBuildingCode={selectedBuildingCode}
          setActiveSection={setActiveSection}
          fetchData={fetchData}
        />
      </Box>
    </Box>
  );
};

export default CheckoutPage;
