# 🎯 Arquitectura de Configuración de API

```
┌─────────────────────────────────────────────────────────────┐
│                    DESARROLLO LOCAL                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📁 .env (tu archivo local)                                 │
│  ┌────────────────────────────────────────────────┐        │
│  │ VITE_API_URL=http://localhost:8000/api         │        │
│  └────────────────────────────────────────────────┘        │
│                          │                                   │
│                          ▼                                   │
│  ⚙️  Vite lee la variable al hacer build                    │
│                          │                                   │
│                          ▼                                   │
│  📦 Todos los servicios usan:                               │
│     import.meta.env.VITE_API_URL                           │
│                          │                                   │
│                          ▼                                   │
│  🔗 Hacen requests a:                                       │
│     http://localhost:8000/api                               │
│                          │                                   │
│                          ▼                                   │
│  🚀 Laravel Backend (local)                                 │
│     127.0.0.1:8000                                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  PRODUCCIÓN (Vercel)                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ☁️  Variables de entorno en Vercel                         │
│  ┌────────────────────────────────────────────────┐        │
│  │ VITE_API_URL=                                  │        │
│  │   https://backendhotelt.onrender.com/api      │        │
│  └────────────────────────────────────────────────┘        │
│                          │                                   │
│                          ▼                                   │
│  ⚙️  Vite lee la variable al hacer build                    │
│                          │                                   │
│                          ▼                                   │
│  📦 Todos los servicios usan:                               │
│     import.meta.env.VITE_API_URL                           │
│                          │                                   │
│                          ▼                                   │
│  🔗 Hacen requests a:                                       │
│     https://backendhotelt.onrender.com/api                 │
│                          │                                   │
│                          ▼                                   │
│  🚀 Laravel Backend (Render)                                │
│     backendhotelt.onrender.com                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 📝 Cómo funciona en el código

### ✅ CORRECTO (lo que tienes ahora):

```typescript
// En cualquier servicio:
const API_URL = import.meta.env.VITE_API_URL;

// Hacer una llamada:
fetch(`${API_URL}/auth/login`, {
  method: 'POST',
  body: JSON.stringify({ email, password })
})

// ✅ En local hace: http://localhost:8000/api/auth/login
// ✅ En producción hace: https://backendhotelt.onrender.com/api/auth/login
```

### ❌ INCORRECTO (rutas relativas):

```typescript
// ❌ NO HAGAS ESTO:
fetch('/api/auth/login')  // Solo funciona con proxy

// ❌ NO HAGAS ESTO:
fetch('http://localhost:8000/api/auth/login')  // Hardcoded, no funciona en producción
```

## 🔧 Archivos modificados

```
✅ .env                              (desarrollo local)
✅ .env.example                      (template)
✅ .env.production                   (template para producción)
✅ src/services/BaseApiService.ts    (fallback actualizado)
✅ src/core/http/httpClient.ts       (fallback actualizado)
✅ src/modules/reservations/lib/apiClient.ts
✅ src/modules/reservations/lib/MultiHttpClient.ts
✅ src/modules/frontdesk/services/apiService.ts
✅ src/config/environment.example
```

## 🎯 Beneficios

1. **Una sola variable** - `VITE_API_URL`
2. **URL completa siempre** - Incluye protocolo, dominio y `/api`
3. **Funciona en todos lados** - Local, preview, producción
4. **Sin proxies** - No depende de configuración de Vite
5. **Fácil de cambiar** - Solo una variable en Vercel

## 🔄 Flujo de deployment

```bash
# 1. Desarrollas en local
VITE_API_URL=http://localhost:8000/api

# 2. Haces commit y push
git add .
git commit -m "feat: nueva feature"
git push

# 3. Vercel detecta el push y hace build
# Usa las variables configuradas en Vercel:
VITE_API_URL=https://backendhotelt.onrender.com/api

# 4. El frontend desplegado usa la URL de producción
# Sin cambios en el código ✨
```

## 🚨 Importante

- Después de cambiar variables en Vercel, **debes hacer Redeploy**
- Las variables de entorno solo se inyectan durante el **build time**
- Un nuevo commit no es suficiente, necesitas **redeplegar**
