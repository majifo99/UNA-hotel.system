import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import './index.css'
import App from './App.tsx'
import { QueryProvider } from './providers/QueryProvider'

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
