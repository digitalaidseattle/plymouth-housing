import MainContainer from '../components/MainContainer';
import MainLayout from '../layout/MainLayout';
import MinimalLayout from '../layout/MinimalLayout';
import EnterPin from './authentication/EnterPinPage';
import PickYourNamePage from './authentication/PickNamePage';
import Page404 from './error/404';
import Inventory from './inventory';
import VolunteerHome from './VolunteerHome';
import CheckoutPage from './checkout/CheckoutPage';
import People from './people';
import ProtectedRoute from '../components/ProtectedRoute';

const routes = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: '',
        element: (
          <ProtectedRoute pageId="root">
            <VolunteerHome />,
          </ProtectedRoute>
        )
      },
      {
        path: 'inventory',
        element: (
          <ProtectedRoute pageId="inventory">
            <MainContainer title="Inventory">
              <Inventory />
            </MainContainer>
          </ProtectedRoute>
        ),
      },
      {
        path: 'people',
        element: (
          <ProtectedRoute pageId="people">
            <MainContainer title="People">
              <People />
            </MainContainer>
          </ProtectedRoute>
        ),
      },
      {
        path: 'volunteer-home',
        element: (
          <ProtectedRoute pageId="volunteer-home">
            <MainContainer title="Volunteer Home">
              <VolunteerHome />
            </MainContainer>
          </ProtectedRoute>
        ),
      },
      {
        path: 'checkout',
        element: (
          // checkout card content is given a fixed height and scrollbar
          // to work with the sticky nav inside it
          <ProtectedRoute pageId="checkout">
          <MainContainer title="Check out">
            <CheckoutPage />
          </MainContainer>
          </ProtectedRoute>
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