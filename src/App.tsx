import './App.css'
import AppRouter from './router/AppRouter'
import { WebRouter } from './router/WebRouter'

function App() {
  // Determine which router to use
  // Check for admin mode via URL parameter or environment variable
  const urlParams = new URLSearchParams(window.location.search);
  const isAdminMode = urlParams.get('admin') === 'true' || 
                     window.location.pathname.startsWith('/admin') ||
                     import.meta.env.VITE_MODE === 'admin';

  // For development, you can switch between modes:
  // - Public site: http://localhost:5173/
  // - Admin system: http://localhost:5173/?admin=true
  // - Or set VITE_MODE=admin in .env file

  return isAdminMode ? <AppRouter /> : <WebRouter />;
}

export default App
