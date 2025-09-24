/**
 * Web Module - Public Website Exports
 * 
 * Central export file for the public website module.
 */

// =================== TYPES ===================
export type * from './types/auth';

// =================== COMPONENTS ===================
export { WebHeader } from './components/WebHeader';
export { WebFooter } from './components/WebFooter';
export { ProtectedRoute } from './components/ProtectedRoute';

// =================== LAYOUTS ===================
export { WebLayout } from './layouts/WebLayout';

// =================== PAGES ===================
export { LoginPage } from './pages/LoginPage';
export { RegisterPage } from './pages/RegisterPage';
export { HomePage } from './pages/HomePage';
export { AboutPage } from './pages/AboutPage';

// =================== HOOKS ===================
export { useAuth, AuthProvider } from './hooks/useAuth.tsx';

// =================== SCHEMAS ===================
export { 
  loginSchema, 
  registerSchema, 
  passwordResetSchema, 
  passwordChangeSchema 
} from './schemas/authSchemas';

// =================== SERVICES ===================
export { AuthService } from './services/authService';
