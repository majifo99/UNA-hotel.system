/**
 * useAdminAuth Hook
 * 
 * Hook para usar el contexto de autenticación administrativo.
 */

import { useContext } from 'react';
import type { AdminAuthContextType } from './types';
import { AdminAuthContext } from './useAdminAuth';

export function useAdminAuth(): AdminAuthContextType {
  const context = useContext(AdminAuthContext);
  
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  
  return context;
}