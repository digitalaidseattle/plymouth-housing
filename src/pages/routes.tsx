import MainCard from '../components/MainCard';
import MainLayout from '../layout/MainLayout';
import MinimalLayout from '../layout/MinimalLayout';
import TicketsGrid from '../sections/tickets/TicketsGrid';
import TicketsTable from '../sections/tickets/TicketsTable';
import MapPage from './MapPage';
import PrivacyPage from './PrivacyPage';
import TicketPage from './TicketPage';
import UploadPage from './UploadPage';
import Login from './authentication/Login';
import Login2 from './authentication/Login2';
import DashboardDefault from './dashboard';
import Page404 from './error/404';
import SamplePage from './extra-pages/SamplePage';
import DragDropPage from './dragdrop/DragDropPage';

const routes = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "",
        element: <DashboardDefault />,
      },
      {
        path: "sample-page",
        element: <SamplePage />,
      },
      {
        path: "ticket/:id",
        element: <TicketPage />,
      },
      {
        path: "tickets",
        element: (
          <MainCard title="Tickets Page">
            <TicketsTable />
          </MainCard>),
      },
      {
        path: "tickets-grid",
        element: (
          <MainCard title="Tickets Page">
            <TicketsGrid />
          </MainCard>
        ),
      },
      {
        path: "privacy",
        element: <PrivacyPage />,
      },
      {
        path: "upload",
        element: <UploadPage />,
      },
      {
        path: "drag-drop",
        element: <DragDropPage />,
      },
      {
        path: "map-example",
        element: <MapPage />,
      }
    ]
  },
  {
    path: "/",
    element: <MinimalLayout />,
    children: [
      {
        path: 'login',
        element: <Login />
      },
      {
        path: 'login2',
        element: <Login2 />
      }
    ]
  },
  {
    path: "*",
    element: <MinimalLayout />,
    children: [
      {
        path: '*',
        element: <Page404 />
      }
    ]
  }
];

export { routes };
