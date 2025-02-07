import MainCard from '../components/MainCard';
import MainLayout from '../layout/MainLayout';
import MinimalLayout from '../layout/MinimalLayout';
import EnterPin from './authentication/EnterPinPage';
import PickYourNamePage from './authentication/PickNamePage';
import DashboardDefault from './dashboard';
import Page404 from './error/404';
import Inventory from './inventory';
import VolunteerHome from './VolunteerHome';
import CheckoutPage from './checkout/CheckoutPage';
import People from './people';

const routes = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: '',
        element: <DashboardDefault />,
      },
      {
        path: 'inventory',
        element: (
          <MainCard title="Inventory">
            <Inventory />
          </MainCard>
        ),
      },
      {
        path: 'people',
        element: (
          <MainCard title="People">
            <People />
          </MainCard>
        ),
      },
      {
        path: 'volunteer-home',
        element: (
          <MainCard title="Volunteer Home">
            <VolunteerHome />
          </MainCard>
        ),
      },
      {
        path: 'checkout',
        element: (
          <MainCard title="Checkout" contentSX={{height: '75vh', padding: 0, overflow: 'auto'}}>
            <CheckoutPage />
          </MainCard>
        ),
      },
    ],
  },
  {
    path: '/',
    element: <MinimalLayout />,
    children: [
      {
        path: 'pick-your-name',
        element: <PickYourNamePage />,
      },
      {
        path: 'enter-your-pin',
        element: <EnterPin />,
      },
    ],
  },
  {
    path: '*',
    element: <MinimalLayout />,
    children: [
      {
        path: '*',
        element: <Page404 />,
      },
    ],
  },
];

export { routes };
