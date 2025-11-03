import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../auth/useAdminAuth';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute Component
 * 
 * Protects admin routes by checking if user is authenticated.
 * If not authenticated, redirects to /admin/login.
 * 
 * Usage:
 * ```tsx
 * <Route path="/admin/dashboard" element={
 *   <ProtectedRoute>
 *     <AdminDashboard />
 *   </ProtectedRoute>
 * } />
 * ```
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAdminAuth();
  const location = useLocation();

  // Show loading spinner while checking auth status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  // Save the attempted location to redirect back after login
  if (!user && !isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
}
