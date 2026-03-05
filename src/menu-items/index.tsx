import Home from '@mui/icons-material/Home';
import Inventory2 from '@mui/icons-material/Inventory2';
import ShoppingCart from '@mui/icons-material/ShoppingCart';
import People from '@mui/icons-material/People';
import AccessTimeFilled from '@mui/icons-material/AccessTimeFilled';
import CategoryOutlined from '@mui/icons-material/CategoryOutlined';
import ShoppingBasketOutlined from '@mui/icons-material/ShoppingBasketOutlined';

const icons = {
  Home,
  Inventory2,
  ShoppingCart,
  People,
  AccessTimeFilled,
  CategoryOutlined,
  ShoppingBasketOutlined,
};

const dashboard = {
  id: 'group-dashboard',
  type: 'group',
  children: [
    {
      id: 'volunteer-home',
      title: 'Volunteer Home',
      type: 'item',
      url: '/volunteer-home',
      icon: icons.Home,
      breadcrumbs: false,
    },
    {
      id: 'checkout',
      title: 'Checkout',
      type: 'collapse',
      icon: icons.ShoppingCart,
      breadcrumbs: false,
      children: [
        {
          id: 'checkout-general',
          title: 'General',
          type: 'item',
          url: '/checkout',
          state: { checkoutType: 'general' },
          icon: icons.CategoryOutlined,
          breadcrumbs: false,
        },
        {
          id: 'checkout-welcome-basket',
          title: 'Welcome Basket',
          type: 'item',
          url: '/checkout',
          state: { checkoutType: 'welcomeBasket' },
          icon: icons.ShoppingBasketOutlined,
          breadcrumbs: false,
        },
      ],
    },
    {
      id: 'inventory',
      title: 'Inventory',
      type: 'item',
      url: '/inventory',
      icon: icons.Inventory2,
      breadcrumbs: false,
    },
    {
      id: 'history',
      title: 'History',
      type: 'item',
      url: '/history',
      icon: icons.AccessTimeFilled,
      breadcrumbs: false,
    },
    {
      id: 'people',
      title: 'People',
      type: 'admin',
      url: '/people',
      icon: icons.People,
      breadcrumbs: false,
    },
  ],
};

const menuItems = {
  items: [dashboard],
};

export default menuItems;
