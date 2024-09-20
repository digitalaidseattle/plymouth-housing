// project import
import {
  ChromeOutlined,
  DashboardOutlined,
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
} from '@ant-design/icons';

const icons = {
  DashboardOutlined,
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
};

// ==============================|| MENU ITEMS ||============================== //
const dashboard = {
  id: 'group-dashboard',
  title: 'Navigation',
  type: 'group',
  children: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      type: 'item',
      url: '/',
      icon: icons.DashboardOutlined,
      breadcrumbs: false,
    },
    {
      id: 'tickets',
      title: 'Tickets',
      type: 'item',
      url: '/tickets',
      icon: icons.FileOutlined,
      breadcrumbs: false,
    },
    {
      id: 'tickets-grid',
      title: 'Advanced Tickets Table',
      type: 'item',
      url: '/tickets-grid',
      icon: icons.FileExclamationOutlined,
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
  ],
};

const pages = {
  id: 'example',
  title: 'Examples',
  type: 'group',
  children: [
    {
      id: 'login1',
      title: 'Login',
      type: 'item',
      url: '/login',
      icon: icons.LoginOutlined,
    },
    {
      id: '404',
      title: '404',
      type: 'item',
      url: '/404',
      icon: icons.ExclamationOutlined,
    },
    {
      id: 'sample-page',
      title: 'Sample Page',
      type: 'item',
      url: '/sample-page',
      icon: icons.ChromeOutlined,
    },
    {
      id: 'privacy-page',
      title: 'Privacy Page',
      type: 'item',
      url: '/privacy',
      icon: icons.EyeInvisibleOutlined,
      breadcrumbs: false,
    },
    {
      id: 'upload-page',
      title: 'Upload Page',
      type: 'item',
      url: '/upload',
      icon: icons.UploadOutlined,
      breadcrumbs: false,
    },
    {
      id: 'drag-drop-page',
      title: 'Drag Drop Page',
      type: 'item',
      url: '/drag-drop',
      icon: icons.DragOutlined,
      breadcrumbs: false,
    },
    {
      id: 'map-example-page',
      title: 'Map Example Page',
      type: 'item',
      url: '/map-example',
      icon: icons.GlobalOutlined,
      breadcrumbs: false,
    },
  ],
};

const menuItems = {
  items: [dashboard, pages],
};

export default menuItems;
