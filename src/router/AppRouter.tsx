
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MainLayout } from '../layouts/MainLayout';
import { Home } from '../pages/Home';
import { CreateReservationPage } from '../modules/reservations/pages/CreateReservationPage';
import HousekeepingDashboard from '../modules/housekeeping/pages/HousekeepingDashboard';



/**
 * TanStack Query Client Configuration
 * 
 * Global configuration for server state management:
 * - staleTime: 5 minutes (data considered fresh for 5 minutes)
 * - retry: 1 (retry failed requests once)
 * - gcTime: 10 minutes (keep data in cache for 10 minutes after last use)
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});

/**
 * Root Layout Component
 * 
 * Wraps all routes with:
 * - TanStack Query Provider (for server state management)
 * - Main Layout (sidebar, header, main content area)
 * 
 * The Outlet component renders the matched child route
 */
function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <MainLayout>
        <Outlet />
      </MainLayout>
    </QueryClientProvider>
  );
}

/**
 * Application Router Configuration
 * 
 * Route Structure:
 * /                          - Dashboard/Home page
 * /reservations/create       - Create new reservation form
 * 
 * Future routes to implement:
 * /reservations              - List all reservations
 * /reservations/:id          - View/edit specific reservation
 * /rooms                     - Room management
 * /guests                    - Guest management
 * /payments                  - Payment management
 * /reports                   - Reports and analytics
 * /settings                  - System configuration
 * 
 * To add a new route:
 * 1. Import the page component
 * 2. Add a new route object to the children array
 * 3. Update the Sidebar navigation items
 */
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    // Error boundary for route-level errors
    errorElement: <div>Algo salió mal. Por favor recarga la página.</div>,
    children: [
      {
        // Default route - Dashboard
        index: true,
        element: <Home />,
      },
      {
        // Reservations module routes
        path: 'reservations',
        children: [
          {
            // Create new reservation
            path: 'create',
            element: <CreateReservationPage />,
          },
          // Add more reservation routes here:
          // {
          //   path: '', // /reservations (list)
          //   element: <ReservationsListPage />,
          // },
          // {
          //   path: ':id', // /reservations/123 (view/edit)
          //   element: <ReservationDetailPage />,
          // },
        ],
      },
      {
  path: 'housekeeping',
  element: <HousekeepingDashboard />,
},

      // Add more top-level routes here:
      // {
      //   path: 'rooms',
      //   element: <RoomsPage />,
      // },
      // {
      //   path: 'guests',
      //   element: <GuestsPage />,
      // },
    ],
  },
]);

/**
 * Main App Router Component
 * 
 * Entry point for the application routing system.
 * Uses React Router v6 with createBrowserRouter for better performance
 * and nested routing capabilities.
 */
export default function AppRouter() {
  return <RouterProvider router={router} />;
}
