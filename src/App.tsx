import './App.css'
import AppRouter from './router/AppRouter'
import { WebRouter } from './router/WebRouter'

function App() {
  // Determine which router to use based on the current path
  const currentPath = window.location.pathname;
  
  // Admin routes - any route starting with /admin or admin system routes
  const isAdminRoute = currentPath.startsWith('/admin') ||
                       currentPath.startsWith('/frontdesk') ||
                       currentPath.startsWith('/reservations') ||
                       currentPath.startsWith('/housekeeping') ||
                       currentPath.startsWith('/guests') ||
                       currentPath.startsWith('/mantenimiento') ||
                       currentPath.startsWith('/gestion-habitaciones');
  
  // Public web routes - marketing site and public auth
  const isPublicRoute = currentPath === '/' ||
                        currentPath.startsWith('/login') ||
                        currentPath.startsWith('/registro') ||
                        currentPath.startsWith('/acerca') ||
                        currentPath.startsWith('/habitaciones') ||
                        currentPath.startsWith('/servicios') ||
                        currentPath.startsWith('/contacto') ||
                        currentPath.startsWith('/reservar') ||
                        currentPath.startsWith('/perfil') ||
                        currentPath.startsWith('/mis-reservas');

  // Use admin router for admin routes, otherwise use public web router
  const useAdminRouter = isAdminRoute && !isPublicRoute;

  // Development debug logging
  if (import.meta.env.VITE_DEBUG === 'true') {
    console.log('🔍 Router Debug:', {
      currentPath,
      isAdminRoute,
      isPublicRoute,
      useAdminRouter,
      activeRouter: useAdminRouter ? 'AppRouter (Admin)' : 'WebRouter (Public)'
    });
  }

  return useAdminRouter ? <AppRouter /> : <WebRouter />;
}

export default App
