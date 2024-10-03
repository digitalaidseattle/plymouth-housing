import MainCard from '../components/MainCard';
import MainLayout from '../layout/MainLayout';
import MinimalLayout from '../layout/MinimalLayout';
import TicketsGrid from '../sections/tickets/TicketsGrid';
import TicketsTable from '../sections/tickets/TicketsTable';
import PrivacyPage from './PrivacyPage';
import TicketPage from './TicketPage';
import Login from './authentication/Login';
import EnterPin from './authentication/EnterPinPage';
import PickYourNamePage from './authentication/PickNamePage';
import DashboardDefault from './dashboard';
import Page404 from './error/404';
import Inventory from './inventory';
import VolunteerHome from './VolunteerHome';

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
        path: 'ticket/:id',
        element: <TicketPage />,
      },
      {
        path: 'tickets',
        element: (
          <MainCard title="Tickets Page">
            <TicketsTable />
          </MainCard>
        ),
      },
      {
        path: 'tickets-grid',
        element: (
          <MainCard title="Tickets Page">
            <TicketsGrid />
          </MainCard>
        ),
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
        path: 'volunteer-home',
        element: (
          <MainCard title="Volunteer Home">
            <VolunteerHome />
          </MainCard>
        ),
      },
      {
        path: 'privacy',
        element: <PrivacyPage />,
      },
    ],
  },
  {
    path: '/',
    element: <MinimalLayout />,
    children: [
      {
        path: 'login',
        element: <Login />,
      },
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
