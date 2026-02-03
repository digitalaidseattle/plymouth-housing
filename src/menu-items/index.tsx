// project import
import {
  ChromeOutlined,
// TODO Commenting out for now until PIT-52 (Admin dashboard)
//   DashboardOutlined,
  LoginOutlined,
  ProfileOutlined,
  QuestionOutlined,
  ExclamationOutlined,
  FileOutlined,
  FileExclamationOutlined,
  EyeInvisibleOutlined,
  UploadOutlined,
  DragOutlined,
  GlobalOutlined,
  UserOutlined,
  HomeOutlined
} from '@ant-design/icons';

const icons = {
//   DashboardOutlined,
  LoginOutlined,
  ProfileOutlined,
  ChromeOutlined,
  QuestionOutlined,
  ExclamationOutlined,
  FileOutlined,
  FileExclamationOutlined,
  EyeInvisibleOutlined,
  UploadOutlined,
  DragOutlined,
  GlobalOutlined,
  UserOutlined,
  HomeOutlined
};

// ==============================|| MENU ITEMS ||============================== //
const dashboard = {
  id: 'group-dashboard',
  type: 'group',
  children: [
/*     {
      id: 'dashboard',
      title: 'Dashboard',
      type: 'item',
      url: '/',
      icon: icons.DashboardOutlined,
      breadcrumbs: false,
    }, */
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
      icon: icons.EyeInvisibleOutlined,
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
