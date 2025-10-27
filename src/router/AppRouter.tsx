import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MainLayout } from '../layouts/MainLayout';
import { Home } from '../pages/Home';
import { ReservationsListPage } from '../modules/reservations/pages/ReservationsListPage';
import { CreateReservationPage } from '../modules/reservations/pages/CreateReservationPage';
import { SelectServicesPage } from '../modules/reservations/pages/SelectServicesPage';
import HousekeepingDashboard from '../modules/housekeeping/pages/HousekeepingDashboard';
import { GuestsPage } from '../modules/guests/pages/GuestsPage';
import { CreateGuestPage } from '../modules/guests/pages/CreateGuestPage';
import FrontDesk from '../modules/frontdesk/components/FrontDesk';
import CheckInPage from '../modules/frontdesk/pages/CheckInPage';
import CheckOutPage from '../modules/frontdesk/pages/CheckOutPage';
import RoomChange from '../modules/frontdesk/components/RoomChange';
import DateModification from '../modules/frontdesk/components/DateModification';
import ReduceStay from '../modules/frontdesk/components/ReduceStay';
import { FolioPage } from '../modules/frontdesk/pages/FolioPage';
import { GuestProfilePage } from '../modules/guests/pages/GuestProfilePage';
import Mantenimiento from '../modules/Mantenimiento/pages/Mantenimiento';
import { AdminLoginPage, AdminAuthProvider } from '../modules/admin';

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
 * - Admin Auth Provider (for admin authentication)
 * - Main Layout (sidebar, header, main content area)
 *
 * The Outlet component renders the matched child route
 */
function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminAuthProvider>
        <MainLayout>
          <Outlet />
        </MainLayout>
      </AdminAuthProvider>
    </QueryClientProvider>
  );
}

/**
 * Application Router Configuration
 *
 * Route Structure:
 * /admin/login              - Admin authentication page (no layout)
 * /                          - Dashboard/Home page
 * /reservations              - Reservations list and management
 * /reservations/create       - Create new reservation form
 * /reservations/create/services - Select services flow
 *
 * Additional routes include FrontDesk, Housekeeping, Guests, and utilities.
 *
 * To add a new route:
 * 1. Import the page component
 * 2. Add a new route object to the children array
 * 3. Update the Sidebar navigation items
 */
const router = createBrowserRouter([
  {
    // Admin login route - standalone without layout
    path: '/admin/login',
    element: (
      <QueryClientProvider client={queryClient}>
        <AdminAuthProvider>
          <AdminLoginPage />
        </AdminAuthProvider>
      </QueryClientProvider>
    ),
  },
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
        // Front Desk module routes
        path: 'frontdesk',
        children: [
          {
            path: 'dashboard',
            element: <FrontDesk />,
          },
          {
            index: true,
            element: <FrontDesk />,
          },
          {
            path: 'checkin',
            element: <CheckInPage />,
          },
          {
            path: 'checkout',
            element: <CheckOutPage />,
          },
          {
            path: 'room-change',
            element: <RoomChange />,
          },
          {
            path: 'date-modification',
            element: <DateModification />,
          },
          {
            path: 'reduce-stay',
            element: <ReduceStay />,
          },
          {
            path: 'folio/:folioId',
            element: <FolioPage />,
          },
          {
            path: 'register',
            element: <Navigate to="/reservations/create" replace />,
          },
        ],
      },
      {
        // Reservations module routes
        path: 'reservations',
        children: [
          {
            index: true,
            element: <ReservationsListPage />,
          },
          {
            // Create new reservation
            path: 'create',
            element: <CreateReservationPage />,
          },
          {
            // Select services for reservation
            path: 'create/services',
            element: <SelectServicesPage />,
          },
          // Future detail routes can be added here, e.g. /reservations/:id
        ],
      },
      {
        path: 'housekeeping',
        element: <HousekeepingDashboard />,
      },
      {
        path: 'mantenimiento',
        element: <Mantenimiento />,
      },
      {
        path: 'guests',
        children: [
          {
            index: true,
            element: <GuestsPage />,
          },
          {
            path: 'create',
            element: <CreateGuestPage />,
          },
          {
            path: ':id',
            element: <GuestProfilePage />,
          },
        ],
      },
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
