/**
 * Centralized API Configuration
 * 
 * This module provides a single source of truth for API base URL configuration
 * across the entire application. It handles environment-specific behavior:
 * 
 * - Development: Uses '/api' (proxied by Vite to VITE_BACKEND_URL)
 * - Production: Requires VITE_API_URL to be set, fails fast if missing
 * 
 * Usage:
 *   import { getApiBaseUrl } from '@/config/api';
 *   const baseUrl = getApiBaseUrl();
 */

/**
 * Get the API base URL based on environment
 * 
 * @returns The API base URL to use for all HTTP requests
 * @throws Error if VITE_API_URL is not set in production
 */
export function getApiBaseUrl(): string {
  // Check if VITE_API_URL is explicitly set
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // In development, use '/api' which will be proxied by Vite dev server
  if (import.meta.env.DEV) {
    return '/api';
  }

  // In production, VITE_API_URL is required
  // Fail fast with clear error message
  throw new Error(
    'VITE_API_URL environment variable is required in production. ' +
    'Please set it to your backend API base URL (e.g., https://backendhotelt.onrender.com/api)'
  );
}

/**
 * Validate API configuration at startup
 * 
 * This should be called when the app initializes to catch configuration
 * issues early rather than waiting for the first API call to fail.
 * 
 * @returns true if configuration is valid, throws Error otherwise
 */
export function validateApiConfig(): boolean {
  try {
    const baseUrl = getApiBaseUrl();
    
    // Log configuration for debugging (but not in production to avoid leaking URLs)
    if (import.meta.env.DEV) {
      console.log('[API Config] Base URL:', baseUrl);
      console.log('[API Config] Environment:', import.meta.env.MODE);
      console.log('[API Config] VITE_API_URL:', import.meta.env.VITE_API_URL || 'not set');
      console.log('[API Config] Using Vite proxy:', baseUrl === '/api');
    }
    
    return true;
  } catch (error) {
    console.error('[API Config] Configuration error:', error);
    throw error;
  }
}

/**
 * Check if we're using the Vite dev proxy
 */
export function isUsingViteProxy(): boolean {
  return import.meta.env.DEV && !import.meta.env.VITE_API_URL;
}

/**
 * Get backend URL for Vite proxy configuration
 * This is only used in vite.config.ts
 */
export function getBackendUrlForProxy(): string {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  
  if (!backendUrl) {
    throw new Error(
      'VITE_BACKEND_URL environment variable is required for development proxy. ' +
      'Please set it in your .env file (e.g., http://localhost:8000)'
    );
  }
  
  return backendUrl;
}
