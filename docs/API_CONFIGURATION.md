# API Configuration Guide

This document explains how the UNA Hotel System handles API configuration across different environments.

## Overview

The application uses a centralized API configuration module (`src/config/api.ts`) to manage backend URLs consistently across all services. This ensures that:

- Development works smoothly with Vite's dev proxy
- Production requires explicit configuration
- Configuration errors are caught early at startup
- All services use the same base URL

## Environment Variables

### Development

For local development, you have two options:

#### Option 1: Use Vite Proxy (Recommended)

```env
# .env (development)
VITE_BACKEND_URL=http://localhost:8000
# Do not set VITE_API_URL
```

With this setup:
- Frontend makes requests to `/api/*`
- Vite dev server proxies these to `http://localhost:8000/api/*`
- No CORS issues during development
- Matches production URL structure

#### Option 2: Direct Backend Connection

```env
# .env (development)
VITE_API_URL=http://localhost:8000/api
```

With this setup:
- Frontend makes requests directly to `http://localhost:8000/api`
- Bypasses Vite proxy
- May encounter CORS issues if backend not configured properly

### Production

**REQUIRED:** You must set `VITE_API_URL` for production deployments.

```env
# .env.production (Vercel, Netlify, etc.)
VITE_API_URL=https://backendhotelt.onrender.com/api
```

**Important:** Unlike Vite dev server, production hosting platforms (Vercel, Netlify, etc.) do not provide automatic API proxying. The frontend must know the exact backend URL.

## How It Works

### Centralized Configuration

All API services use the `getApiBaseUrl()` function from `src/config/api.ts`:

```typescript
import { getApiBaseUrl } from '@config/api';

const baseURL = getApiBaseUrl();
```

This function:
1. Returns `VITE_API_URL` if set (highest priority)
2. Returns `/api` if in development mode and no `VITE_API_URL` set
3. Throws an error in production if `VITE_API_URL` not set

### Startup Validation

The application validates configuration at startup in `src/main.tsx`:

```typescript
import { validateApiConfig } from './config/api';

try {
  validateApiConfig();
} catch (error) {
  // Shows user-friendly error page
}
```

This ensures configuration errors are caught immediately rather than when the first API call is made.

### Vite Proxy Configuration

The Vite dev server proxy is configured in `vite.config.ts`:

```typescript
server: {
  proxy: {
    '/api': {
      target: env.VITE_BACKEND_URL,
      changeOrigin: true,
      secure: true,
    },
  },
}
```

## Migration Guide

If you're updating existing code to use the centralized configuration:

### Before (inconsistent patterns)

```typescript
// ❌ Old pattern - hardcoded logic
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// ❌ Old pattern - duplication
const API_URL = (() => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (import.meta.env.DEV) {
    return '/api';
  }
  throw new Error('VITE_API_URL required in production');
})();
```

### After (centralized)

```typescript
// ✅ New pattern - centralized
import { getApiBaseUrl } from '@config/api';

const API_URL = getApiBaseUrl();
```

## Deployment Checklist

### Vercel

1. Go to your project settings on Vercel
2. Navigate to Environment Variables
3. Add `VITE_API_URL` with your backend URL (e.g., `https://backendhotelt.onrender.com/api`)
4. Redeploy the application

### Netlify

1. Go to Site Settings → Build & Deploy → Environment
2. Add `VITE_API_URL` with your backend URL
3. Redeploy the application

### Other Platforms

Set the `VITE_API_URL` environment variable according to your platform's documentation.

## Troubleshooting

### "VITE_API_URL environment variable is required in production"

**Cause:** The application is running in production mode without `VITE_API_URL` set.

**Solution:** Set the `VITE_API_URL` environment variable in your hosting platform's settings.

### API calls fail with 404 in production

**Possible causes:**
1. `VITE_API_URL` not set → Application won't start (you'll see the error page)
2. `VITE_API_URL` set incorrectly → API calls go to wrong URL
3. Backend not accessible from production frontend

**Solutions:**
1. Verify `VITE_API_URL` is set correctly in production environment
2. Check that the backend URL is publicly accessible
3. Verify backend CORS configuration allows requests from your frontend domain

### CORS errors in production

**Cause:** Backend not configured to accept requests from your frontend domain.

**Solution:** Update your Laravel backend's CORS configuration:

```php
// config/cors.php
'allowed_origins' => [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
],
```

## Best Practices

1. **Never commit `.env` files** - Use `.env.example` as template
2. **Use Vite proxy in development** - Avoids CORS issues
3. **Always set VITE_API_URL in production** - Required for deployment
4. **Use environment-specific `.env` files** - `.env.development`, `.env.production`
5. **Verify configuration early** - Check environment variables in CI/CD pipeline

## Related Files

- `src/config/api.ts` - Centralized API configuration
- `vite.config.ts` - Vite dev server proxy configuration
- `.env.example` - Environment variable template
- `src/main.tsx` - Startup validation
- `vercel.json` - Vercel routing configuration (SPA only, no API proxy)

## Support

If you encounter issues not covered in this guide, please:
1. Check the console for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure your backend is accessible from your production domain
4. Review CORS configuration on your backend
