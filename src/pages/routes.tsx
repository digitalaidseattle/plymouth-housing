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
import EnterPin from './authentication/EnterPinPage';
import PickYourNamePage from './authentication/PickNamePage';
import DashboardDefault from './dashboard';
import Page404 from './error/404';
import SamplePage from './extra-pages/SamplePage';
import DragDropPage from './dragdrop/DragDropPage';
import Inventory from './inventory'

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
        path: "inventory",
        element: (
          <MainCard title="Inventory">
            <Inventory />
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
        path: 'pick-your-name',
        element: <PickYourNamePage/>
      },
      {
        path: 'enter-pin',
        element: <EnterPin/>
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
