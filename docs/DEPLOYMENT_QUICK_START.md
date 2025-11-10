# Deployment Quick Start Guide

Quick reference for deploying the UNA Hotel System to production.

## ⚠️ Critical: Environment Variables

**REQUIRED for production:** Set `VITE_API_URL` in your hosting platform.

## Vercel Deployment

### Step 1: Set Environment Variables

1. Go to your project on Vercel
2. Navigate to: **Settings → Environment Variables**
3. Add the following variables:

```
VITE_API_URL=https://backendhotelt.onrender.com/api
VITE_MODE=admin
VITE_RECAPTCHA_SITE_KEY=your_key_here
```

### Step 2: Deploy

Push your code or trigger a redeploy. The application will:
- ✅ Start successfully if `VITE_API_URL` is set
- ❌ Show error page if `VITE_API_URL` is missing

## Netlify Deployment

### Step 1: Set Environment Variables

1. Go to your site on Netlify
2. Navigate to: **Site Settings → Build & Deploy → Environment**
3. Add the same variables as above

### Step 2: Deploy

Push your code or trigger a redeploy.

## Local Production Build

To test production build locally:

```bash
# Create .env.production file
cp .env.production.example .env.production

# Edit .env.production and set your variables
nano .env.production

# Build for production
npm run build

# Preview production build
npm run preview
```

## Troubleshooting

### Error: "VITE_API_URL environment variable is required"

**Solution:** Set `VITE_API_URL` in your hosting platform's environment variables.

### API calls return 404 or CORS errors

**Possible causes:**
1. `VITE_API_URL` points to wrong backend URL
2. Backend is not publicly accessible
3. Backend CORS not configured for your frontend domain

**Solutions:**
1. Verify `VITE_API_URL` value is correct
2. Test backend URL directly in browser
3. Update backend CORS configuration to allow your frontend domain

## Environment Variable Values

### For Render Backend

```
VITE_API_URL=https://backendhotelt.onrender.com/api
```

### For Local Backend (development only)

```
VITE_BACKEND_URL=http://localhost:8000
```

## Verification Checklist

Before deploying to production:

- [ ] `VITE_API_URL` is set in hosting platform
- [ ] Backend URL is publicly accessible
- [ ] Backend CORS allows frontend domain
- [ ] reCAPTCHA keys are set (if using)
- [ ] Test production build locally first (`npm run build && npm run preview`)

## Important Notes

1. **Never commit `.env` files** with real values to Git
2. **Vercel doesn't proxy API requests** - Must use full backend URL
3. **Environment variables are embedded at build time** - Redeploy after changing them
4. **Development uses Vite proxy** - Production uses direct backend connection

## Need Help?

See the full documentation:
- [API Configuration Guide](./API_CONFIGURATION.md)
- [Environment Variable Setup](./../.env.example)
- [Production Environment Example](./../.env.production.example)
