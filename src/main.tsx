import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import './index.css'
import App from './App.tsx'
import { QueryProvider } from './providers/QueryProvider'
import { validateApiConfig } from './config/api'

// Validate API configuration at startup
// This will throw an error if VITE_API_URL is not set in production
try {
  validateApiConfig();
} catch (error) {
  console.error('Failed to initialize application:', error);
  // Show user-friendly error message
  document.getElementById('root')!.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; padding: 2rem; text-align: center; font-family: system-ui, -apple-system, sans-serif;">
      <h1 style="color: #dc2626; font-size: 2rem; margin-bottom: 1rem;">Configuration Error</h1>
      <p style="color: #374151; font-size: 1.125rem; max-width: 600px;">
        ${error instanceof Error ? error.message : 'Failed to load application configuration'}
      </p>
      <p style="color: #6b7280; font-size: 0.875rem; margin-top: 1rem;">
        Please contact your system administrator.
      </p>
    </div>
  `;
  throw error;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <App />
      <Toaster 
        position="top-right" 
        richColors 
        expand={false}
        duration={4000}
      />
    </QueryProvider>
  </StrictMode>,
)
