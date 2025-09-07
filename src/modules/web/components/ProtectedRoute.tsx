/**
 * Protected Route Component - Web Public System
 * 
 * Protects routes that require authentication.
 * Redirects to login if user is not authenticated.
 */

import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth.tsx';

// =================== TYPES ===================

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

// =================== COMPONENT ===================

/**
 * ProtectedRoute Component
 * 
 * Renders children if user is authenticated, otherwise redirects to login.
 * Preserves the intended destination in location state for redirect after login.
 */
export function ProtectedRoute({ 
  children, 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="text-neutral-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Render protected content
  return <>{children}</>;
}
