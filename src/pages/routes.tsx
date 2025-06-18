import MainContainer from '../components/MainContainer';
import MainLayout from '../layout/MainLayout';
import MinimalLayout from '../layout/MinimalLayout';
import EnterPin from './authentication/EnterPinPage';
import PickYourNamePage from './authentication/PickNamePage';
import Page404 from './error/404';
import VolunteerHome from '../pages/VolunteerHome';
import People from '../pages/people';
import Inventory from './inventory';
import CheckoutPage from './checkout/CheckoutPage';
import { RootRedirect } from '../components/RootRedirect';

const routes = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: '',
        element: (
          <RootRedirect source="volunteer-home">
            <MainContainer title="Volunteer Home">
              <VolunteerHome />,
            </MainContainer>
          </RootRedirect>
        ),
      },
      {
        path: 'inventory',
        element: (
          <RootRedirect source="inventory">
            <MainContainer title="Inventory">
              <Inventory />,
            </MainContainer>
          </RootRedirect>
        ),
      },
      {
        path: 'people',
        element: (
          <RootRedirect source="people">
            <MainContainer title="People">
              <People />,
            </MainContainer>
          </RootRedirect>
        ),
      },
      {
        path: 'volunteer-home',
        element: (
          <RootRedirect source="volunteer-home">
            <MainContainer title="Volunteer Home">
              <VolunteerHome />,
            </MainContainer>
          </RootRedirect>
        ),
      },
      {
        path: 'checkout',
        element: (
          // checkout card content is given a fixed height and scrollbar
          // to work with the sticky nav inside it
          <RootRedirect source="checkout">
            <MainContainer title="Check out">
              <CheckoutPage />,
            </MainContainer>
          </RootRedirect>
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