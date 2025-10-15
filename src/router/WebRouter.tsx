/**
 * Web Router - Public Website Routes
 * 
 * Router configuration for the public-facing website.
 * Separate from the admin system routes.
 */

import { createBrowserRouter, RouterProvider, Outlet, useRouteError } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WebLayout } from '../modules/web/layouts/WebLayout';
import { AuthProvider } from '../modules/web/hooks/useAuth.tsx';
import { ProtectedRoute } from '../modules/web/components/ProtectedRoute';
import { HomePage } from '../modules/web/pages/HomePage';
import { LoginPage } from '../modules/web/pages/LoginPage';
import { RegisterPage } from '../modules/web/pages/RegisterPage';
import { LoginPageTest } from '../modules/web/pages/LoginPage.test';
import { AboutPage } from '../modules/web/pages/AboutPage';
import { WebReservationPage } from '../modules/web/pages/WebReservationPage';

// =================== ERROR BOUNDARY ===================

function ErrorBoundary() {
  const error = useRouteError() as Error;
  
  console.error('Router Error:', error);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center p-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-gray-600 mb-2">Ha ocurrido un error:</p>
        <pre className="bg-red-50 border border-red-200 rounded p-4 text-left text-sm overflow-auto mb-4">
          {error?.message || 'Error desconocido'}
        </pre>
        <p className="text-gray-500 text-sm mb-4">
          Revisa la consola del navegador para más detalles
        </p>
        <button 
          onClick={() => window.location.href = '/'} 
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}

// =================== QUERY CLIENT ===================

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

// =================== ROOT LAYOUT ===================

function WebRootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WebLayout>
          <Outlet />
        </WebLayout>
      </AuthProvider>
    </QueryClientProvider>
  );
}

// =================== PLACEHOLDER PAGES ===================

function RoomsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-primary-900 mb-8">Habitaciones</h1>
      <p className="text-neutral-600">Página de habitaciones en desarrollo...</p>
    </div>
  );
}

function ServicesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-primary-900 mb-8">Servicios</h1>
      <p className="text-neutral-600">Página de servicios en desarrollo...</p>
    </div>
  );
}

function ContactPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-primary-900 mb-8">Contacto</h1>
      <p className="text-neutral-600">Página de contacto en desarrollo...</p>
    </div>
  );
}

function ReservationPage() {
  return <WebReservationPage />;
}

function ProfilePage() {
  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-primary-900 mb-8">Mi Perfil</h1>
        <p className="text-neutral-600">Página de perfil en desarrollo...</p>
      </div>
    </ProtectedRoute>
  );
}

function MyReservationsPage() {
  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-primary-900 mb-8">Mis Reservas</h1>
        <p className="text-neutral-600">Historial de reservas en desarrollo...</p>
      </div>
    </ProtectedRoute>
  );
}

// =================== ROUTER CONFIGURATION ===================

const webRouter = createBrowserRouter([
  {
    path: '/',
    element: <WebRootLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      // =================== PUBLIC ROUTES ===================
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'acerca',
        element: <AboutPage />,
      },
      {
        path: 'habitaciones',
        element: <RoomsPage />,
      },
      {
        path: 'servicios',
        element: <ServicesPage />,
      },
      {
        path: 'contacto',
        element: <ContactPage />,
      },
      
      // =================== AUTH ROUTES ===================
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'login-test',
        element: <LoginPageTest />,
      },
      {
        path: 'registro',
        element: <RegisterPage />,
      },
      
      // =================== PROTECTED ROUTES ===================
      {
        path: 'reservar',
        element: <ReservationPage />,
      },
      {
        path: 'perfil',
        element: <ProfilePage />,
      },
      {
        path: 'mis-reservas',
        element: <MyReservationsPage />,
      },
      
      // =================== CATCH ALL ===================
      {
        path: '*',
        element: <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary-900 mb-4">404</h1>
            <p className="text-neutral-600 mb-4">Página no encontrada</p>
            <a 
              href="/" 
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
            >
              Volver al inicio
            </a>
          </div>
        </div>,
      },
    ],
  },
]);

// =================== EXPORT ===================

export function WebRouter() {
  return <RouterProvider router={webRouter} />;
}
