/**
 * useRecaptcha Hook
 * 
 * Reusable hook for Google reCAPTCHA v3 integration.
 * Provides invisible bot protection without interrupting user experience.
 * 
 * Features:
 * - Lazy loads reCAPTCHA script on demand
 * - Generates tokens for specific actions
 * - Handles errors gracefully
 * - TypeScript strict mode compliant
 * - Memory leak prevention with cleanup
 * 
 * @example
 * ```tsx
 * const { executeRecaptcha, isLoading, error } = useRecaptcha();
 * 
 * const handleSubmit = async () => {
 *   const token = await executeRecaptcha('submit_reservation');
 *   if (token) {
 *     // Include token in API call
 *     await createReservation({ ...data, recaptcha_token: token });
 *   }
 * };
 * ```
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// Extend window interface for reCAPTCHA
declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

interface UseRecaptchaReturn {
  /** Executes reCAPTCHA and returns a token */
  executeRecaptcha: (action: string) => Promise<string | null>;
  /** Loading state while script loads */
  isLoading: boolean;
  /** Error message if something went wrong */
  error: string | null;
  /** Whether reCAPTCHA is ready to use */
  isReady: boolean;
}

/**
 * Custom hook for reCAPTCHA v3 integration
 */
export const useRecaptcha = (): UseRecaptchaReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);
  
  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef<boolean>(true);
  
  // Get site key from environment variables
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined;

  /**
   * Loads reCAPTCHA script dynamically
   */
  useEffect(() => {
    // Validate site key
    if (!siteKey) {
      console.warn('[useRecaptcha] VITE_RECAPTCHA_SITE_KEY not configured. reCAPTCHA disabled.');
      setError('reCAPTCHA not configured');
      setIsLoading(false);
      return;
    }

    // Check if script is already loaded
    if (window.grecaptcha) {
      setIsReady(true);
      setIsLoading(false);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector(
      `script[src*="recaptcha"]`
    );
    
    if (existingScript) {
      // Script is loading, wait for it
      const checkReady = setInterval(() => {
        if (window.grecaptcha && isMountedRef.current) {
          setIsReady(true);
          setIsLoading(false);
          clearInterval(checkReady);
        }
      }, 100);
      
      // Cleanup timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkReady);
        if (!window.grecaptcha && isMountedRef.current) {
          setError('reCAPTCHA script loading timeout');
          setIsLoading(false);
        }
      }, 10000);
      
      return;
    }

    // Load reCAPTCHA script
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.grecaptcha && isMountedRef.current) {
        window.grecaptcha.ready(() => {
          if (isMountedRef.current) {
            setIsReady(true);
            setIsLoading(false);
          }
        });
      }
    };

    script.onerror = () => {
      if (isMountedRef.current) {
        setError('Failed to load reCAPTCHA script');
        setIsLoading(false);
      }
    };

    document.head.appendChild(script);

    // Cleanup function
    return () => {
      isMountedRef.current = false;
      // Note: We don't remove the script to avoid conflicts with other components
      // reCAPTCHA script can be safely reused across the application
    };
  }, [siteKey]);

  /**
   * Executes reCAPTCHA and returns a token
   * @param action - Action name for tracking (e.g., 'submit_reservation')
   * @returns Promise with token or null if failed
   */
  const executeRecaptcha = useCallback(
    async (action: string): Promise<string | null> => {
      // Validate configuration
      if (!siteKey) {
        console.error('[useRecaptcha] Site key not configured');
        return null;
      }

      // Check if reCAPTCHA is ready
      if (!isReady || !window.grecaptcha) {
        console.error('[useRecaptcha] reCAPTCHA not ready');
        setError('reCAPTCHA not ready. Please try again.');
        return null;
      }

      try {
        // Execute reCAPTCHA
        const token = await window.grecaptcha.execute(siteKey, { action });
        
        if (!token) {
          throw new Error('No token returned from reCAPTCHA');
        }

        // Clear any previous errors
        setError(null);
        
        return token;
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('[useRecaptcha] Error executing reCAPTCHA:', errorMessage);
        setError('reCAPTCHA verification failed');
        return null;
      }
    },
    [siteKey, isReady]
  );

  return {
    executeRecaptcha,
    isLoading,
    error,
    isReady
  };
};
