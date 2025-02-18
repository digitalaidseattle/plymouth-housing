import MainContainer from '../components/MainContainer';
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
          <MainContainer title="Inventory">
            <Inventory />
          </MainContainer>
        ),
      },
      {
        path: 'people',
        element: (
          <MainContainer title="People">
            <People />
          </MainContainer>
        ),
      },
      {
        path: 'volunteer-home',
        element: (
          <MainContainer title="Volunteer Home">
            <VolunteerHome />
          </MainContainer>
        ),
      },
      {
        path: 'checkout',
        element: (
          // checkout card content is given a fixed height and scrollbar
          // to work with the sticky nav inside it
          <MainContainer title="Check out">
            <CheckoutPage />
          </MainContainer>
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
