# 🚀 CHECKLIST: Desplegar en Vercel

## ✅ Pre-requisitos

- [ ] Tienes cuenta en Vercel
- [ ] Tu backend Laravel está desplegado en Render
- [ ] Tu backend tiene CORS configurado correctamente

## 📋 Pasos para Desplegar

### 1️⃣ Conectar Repositorio

1. Ve a [vercel.com/new](https://vercel.com/new)
2. Selecciona tu repositorio de GitHub
3. Haz clic en **Import**

### 2️⃣ Configurar el Proyecto

| Campo | Valor |
|-------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | `.` (raíz del proyecto) |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

### 3️⃣ Configurar Variables de Entorno

Antes de hacer deploy, haz clic en **Environment Variables** y agrega:

```bash
# Variable principal (OBLIGATORIA)
VITE_API_URL=https://backendhotelt.onrender.com/api

# Variables opcionales
VITE_DEBUG=false
VITE_USE_MOCKS=false
```

**⚠️ IMPORTANTE:**
- La URL debe incluir `/api` al final
- Debe usar `https://` (no `http://`)
- No incluyas barra final después de `/api`

### 4️⃣ Hacer Deploy

1. Haz clic en **Deploy**
2. Espera a que termine el build (2-5 minutos)
3. Verás "✅ Ready" cuando termine

### 5️⃣ Verificar que Funciona

1. Abre tu sitio en Vercel
2. Abre la consola del navegador (F12)
3. Ejecuta:
   ```javascript
   console.log(import.meta.env.VITE_API_URL)
   ```
4. Deberías ver: `https://backendhotelt.onrender.com/api`

### 6️⃣ Probar Login

1. Ve a la página de login
2. Intenta hacer login
3. Abre la pestaña **Network** en DevTools
4. Deberías ver requests a: `https://backendhotelt.onrender.com/api/auth/login`

## 🔧 Si Algo Sale Mal

### ❌ Error: "Cannot connect to API"

**Posibles causas:**

1. **Variable no configurada**
   - Ve a Settings → Environment Variables
   - Verifica que `VITE_API_URL` esté configurada
   - Redeploy

2. **Backend no responde**
   - Abre `https://backendhotelt.onrender.com/api/health` en el navegador
   - Debería responder con 200 OK
   - Si no responde, el problema es del backend

3. **Error CORS**
   - El backend debe permitir requests desde tu dominio de Vercel
   - En Laravel: `config/cors.php` debe incluir tu dominio
   - O usar `'allowed_origins' => ['*']` para desarrollo

### ❌ Error: "Mixed Content"

**Solución:**
- Asegúrate de que `VITE_API_URL` use `https://` (no `http://`)
- Render provee HTTPS automáticamente

### ❌ Variables no se actualizan

**Solución:**
1. Cambia la variable en Vercel
2. Ve a Deployments
3. En el último deployment, haz clic en `⋮` → **Redeploy**
4. Las variables solo se inyectan durante el build

## 🔄 Actualizar después de Cambios

Cada vez que hagas cambios en el código:

```bash
# 1. Commitear cambios
git add .
git commit -m "feat: descripción del cambio"
git push origin main  # o tu branch principal

# 2. Vercel detecta el push y hace auto-deploy
# No necesitas hacer nada más
```

Si cambias variables de entorno:

```bash
# 1. Actualiza la variable en Vercel Settings
# 2. Ve a Deployments → Redeploy
# (No basta con hacer push, debes redeplegar)
```

## 🎯 Configuración Recomendada de Branches

```
main (producción)
  ├── develop (staging/preview)
  └── feature/* (preview por PR)
```

En Vercel Settings → Git:

- **Production Branch:** `main`
- **Preview Branches:** Todas las branches
- **Automatic Deployments:** ✅ Enabled

Esto te permite:
- `main` → Deploy a producción
- `develop` → Preview URL para testing
- PRs → Preview URL temporal

## 📊 Monitoreo

Después del deploy, verifica:

- [ ] ✅ Login funciona
- [ ] ✅ Check-in funciona
- [ ] ✅ API responde correctamente
- [ ] ✅ No hay errores en consola
- [ ] ✅ Network tab muestra requests exitosos

## 🔐 Seguridad

- [ ] ✅ Variables sensibles solo en Vercel (no en el código)
- [ ] ✅ `.env` está en `.gitignore`
- [ ] ✅ Backend tiene CORS configurado correctamente
- [ ] ✅ Backend usa HTTPS
- [ ] ✅ No hay secrets en el repositorio

## 📞 Soporte

Si sigues teniendo problemas:

1. Revisa los logs de Vercel (Runtime Logs)
2. Revisa los logs de Render (Backend)
3. Verifica que el backend esté activo
4. Prueba hacer un request manual con `curl`:

```bash
curl https://backendhotelt.onrender.com/api/health
```

## 🎉 ¡Listo!

Si todo funciona, tu aplicación debería estar disponible en:
- `https://tu-proyecto.vercel.app`

Y debería conectarse automáticamente a:
- `https://backendhotelt.onrender.com/api`
