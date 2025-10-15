/**
 * Admin Module Exports
 */

// Auth
export * from './auth/types';
export { AdminAuthService } from './auth/adminAuthService';
export { useAdminAuth, AdminAuthProvider } from './auth/useAdminAuth';
export { adminLoginSchema, adminRegisterSchema } from './auth/schemas';
export type { AdminLoginFormData, AdminRegisterFormData } from './auth/schemas';

// Pages
export { AdminLoginPage } from './pages/AdminLoginPage';

// Components
export { ProtectedRoute } from './components/ProtectedRoute';
