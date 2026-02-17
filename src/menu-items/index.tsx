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
  ShoppingCartOutlined,
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
  ShoppingCartOutlined,
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
      icon: icons.HomeOutlined,
      breadcrumbs: false,
    },
    {
      id: 'inventory',
      title: 'Inventory',
      type: 'item',
      url: '/inventory',
      icon: icons.FileExclamationOutlined,
      breadcrumbs: false,
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
          title: 'Welcome basket',
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
  ],
};

const menuItems = {
  items: [dashboard],
};

export default menuItems;
