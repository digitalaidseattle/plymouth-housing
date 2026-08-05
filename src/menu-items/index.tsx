/**
 *  index.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
// project import
import {
  ChromeOutlined,
  LoginOutlined,
  ProfileOutlined,
  QuestionOutlined,
  ExclamationOutlined,
  FileOutlined,
  FileExclamationOutlined,
  UploadOutlined,
  DragOutlined,
  GlobalOutlined,
  UserOutlined,
  HomeOutlined,
  ClusterOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
} from '@ant-design/icons';

const icons = {
  LoginOutlined,
  ProfileOutlined,
  ChromeOutlined,
  QuestionOutlined,
  ExclamationOutlined,
  FileOutlined,
  FileExclamationOutlined,
  UploadOutlined,
  DragOutlined,
  GlobalOutlined,
  UserOutlined,
  HomeOutlined,
  ClusterOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
};

const dashboard = {
  id: 'group-dashboard',
  type: 'group',
  children: [
    {
      id: 'volunteer-home',
      title: 'Home',
      type: 'item',
      url: '/volunteer-home',
      icon: icons.HomeOutlined,
      breadcrumbs: false,
    },
    {
      id: 'admin-home',
      title: 'Home',
      type: 'item',
      url: '/admin-home',
      icon: icons.HomeOutlined,
      breadcrumbs: false,
    },
    {
      id: 'inventory',
      title: 'Inventory',
      type: 'collapse',
      icon: icons.FileExclamationOutlined,
      breadcrumbs: false,
      children: [
        {
          id: 'inventory-general',
          title: 'General',
          type: 'item',
          url: '/inventory',
          state: { inventoryType: 'General' },
          breadcrumbs: false,
        },
        {
          id: 'inventory-welcome-basket',
          title: 'Welcome Basket',
          type: 'item',
          url: '/inventory',
          state: { inventoryType: 'Welcome Basket' },
          breadcrumbs: false,
        },
      ],
    },
    {
      id: 'checkout',
      title: 'Checkout',
      type: 'collapse',
      icon: icons.ShoppingCartOutlined,
      breadcrumbs: false,
      children: [
        {
          id: 'checkout-general',
          title: 'General',
          type: 'item',
          url: '/checkout',
          state: { checkoutType: 'general' },
          breadcrumbs: false,
        },
        {
          id: 'checkout-welcome-basket',
          title: 'Welcome Basket',
          type: 'item',
          url: '/checkout',
          state: { checkoutType: 'welcomeBasket' },
          breadcrumbs: false,
        },
      ],
    },
    {
      id: 'people',
      title: 'People',
      type: 'admin',
      url: '/people',
      icon: icons.UserOutlined,
      breadcrumbs: false,
    },
    {
      id: 'residents',
      title: 'Residents',
      type: 'admin',
      url: '/residents',
      icon: icons.TeamOutlined,
      breadcrumbs: false,
    },
    {
      id: 'history',
      title: 'History',
      type: 'item',
      url: '/history',
      icon: icons.FileOutlined,
      breadcrumbs: false,
    },
    {
      id: 'catalog',
      title: 'Catalog',
      type: 'admin',
      url: '/catalog',
      icon: icons.ClusterOutlined,
      breadcrumbs: false,
    },
  ],
};

const menuItems = {
  items: [dashboard],
};

export default menuItems;
