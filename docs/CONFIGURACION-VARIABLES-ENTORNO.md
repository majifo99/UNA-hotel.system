# 🚀 Guía de Configuración de Variables de Entorno para Producción

## 📋 Resumen

Este proyecto usa **UNA SOLA variable de entorno** para la API: `VITE_API_URL`

Esta variable debe contener la **URL COMPLETA** del backend incluyendo `/api`:

```bash
VITE_API_URL=https://backendhotelt.onrender.com/api
```

## 🔧 Configuración en Vercel

### Paso 1: Accede a tu proyecto en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Selecciona tu proyecto
3. Ve a **Settings** → **Environment Variables**

### Paso 2: Agrega las variables de entorno

Agrega las siguientes variables:

| Variable | Valor para Producción | Descripción |
|----------|----------------------|-------------|
| `VITE_API_URL` | `https://backendhotelt.onrender.com/api` | URL completa del backend Laravel |
| `VITE_DEBUG` | `false` | Desactiva logs de debug en producción |
| `VITE_USE_MOCKS` | `false` | Desactiva datos mock en producción |

### Paso 3: Configura los Environments

Para cada variable, selecciona los environments donde se aplicará:

- ✅ **Production** - Para el ambiente de producción
- ✅ **Preview** - Para previews de branches
- ⬜ **Development** - NO seleccionar (usarás tu `.env` local)

### Paso 4: Redeploy

Después de agregar las variables:

1. Ve a la pestaña **Deployments**
2. Encuentra el último deployment
3. Haz clic en los tres puntos `⋮`
4. Selecciona **Redeploy**

## 🏠 Desarrollo Local

Para desarrollo local, usa tu archivo `.env`:

```bash
# .env (para desarrollo local)
VITE_API_URL=http://localhost:8000/api
VITE_DEBUG=true
VITE_USE_MOCKS=false
```

## ✅ Ventajas de esta Configuración

1. **✔️ Funciona en local y producción** - No dependes de proxies ni rutas relativas
2. **✔️ URL completa siempre** - El frontend siempre sabe dónde está el backend
3. **✔️ Fácil de cambiar** - Solo cambias una variable en Vercel
4. **✔️ Sin dependencias del dominio** - No importa en qué dominio esté desplegado el frontend

## 🔍 Verificación

Para verificar que está funcionando correctamente:

1. Abre la consola del navegador en tu sitio de producción
2. Ejecuta:
   ```javascript
   console.log(import.meta.env.VITE_API_URL)
   ```
3. Deberías ver: `https://backendhotelt.onrender.com/api`

## 🐛 Troubleshooting

### Problema: "Cannot connect to API"

**Solución:**
1. Verifica que `VITE_API_URL` esté configurada en Vercel
2. Asegúrate de que el backend en Render esté activo
3. Verifica que el backend tenga CORS configurado para tu dominio de Vercel

### Problema: "Variables no se actualizan"

**Solución:**
1. Después de cambiar variables en Vercel, debes hacer **Redeploy**
2. Las variables de entorno solo se inyectan durante el build
3. No basta con hacer un nuevo commit, debes redeplegar

### Problema: "Mixed Content" (HTTP/HTTPS)

**Solución:**
- Asegúrate de que `VITE_API_URL` use `https://` en producción
- Render provee HTTPS automáticamente
- Nunca uses `http://` en producción

## 📝 Archivos Importantes

- `.env` - Tu configuración local (NO se sube a Git)
- `.env.example` - Plantilla de ejemplo
- `.env.production` - Plantilla para producción
- `.gitignore` - Asegura que `.env` no se suba

## 🔐 Seguridad

- ✅ `.env` está en `.gitignore`
- ✅ Las variables se configuran directamente en Vercel
- ✅ Nunca subas secrets o tokens al repositorio
- ✅ Usa variables diferentes para desarrollo y producción

## 📚 Referencias

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Render CORS Configuration](https://render.com/docs/deploy-laravel)
