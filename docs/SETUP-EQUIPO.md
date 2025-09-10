# 🔧 Configuración para el Equipo de Desarrollo

## 🚨 IMPORTANTE: Acceso al Sistema Administrativo

### ❗ Problema Común
Si al abrir `http://localhost:5173/` ves la página web pública del hotel en lugar del dashboard administrativo, necesitas seguir estos pasos:

### ✅ Solución Rápida

1. **Crear archivo `.env` en la raíz del proyecto:**
   ```bash
   echo "VITE_MODE=admin" > .env
   ```

2. **Reiniciar el servidor:**
   ```bash
   npm run dev
   ```

3. **Abrir:** `http://localhost:5173/`

### 🎯 URLs del Sistema Administrativo

Una vez configurado correctamente, estas son las URLs disponibles:

| Módulo | URL | Descripción |
|--------|-----|-------------|
| 🏠 Dashboard Principal | `http://localhost:5173/` | Página de inicio del sistema |
| 🏢 Front Desk | `http://localhost:5173/frontdesk` | Gestión de recepción |
| ✅ Check-in | `http://localhost:5173/frontdesk/checkin` | Proceso de check-in |
| ❌ Check-out | `http://localhost:5173/frontdesk/checkout` | Proceso de check-out |
| 🧹 Housekeeping | `http://localhost:5173/housekeeping` | Gestión de limpieza |
| 📅 Reservas | `http://localhost:5173/reservations/create` | Crear reservaciones |
| 👥 Huéspedes | `http://localhost:5173/guests` | Gestión de huéspedes |

### 🔄 Alternativas si no funciona el .env

**Opción 1: URL con parámetro**
```
http://localhost:5173/?admin=true
```

**Opción 2: URL con prefijo admin**
```
http://localhost:5173/admin
```

### 🐛 Troubleshooting

**Si ves "404 Página no encontrada":**
- Verifica que el archivo `.env` existe en la raíz del proyecto
- Reinicia el servidor (`Ctrl+C` y luego `npm run dev`)
- Verifica que la variable `VITE_MODE=admin` esté en el `.env`

**Si sigues viendo la página web pública:**
- Usa la URL: `http://localhost:5173/?admin=true`
- Borra la caché del navegador (`Ctrl+Shift+R`)

### 📁 Estructura del Proyecto

```
UNA-hotel.system/
├── .env                          # ← CREAR ESTE ARCHIVO
├── src/
│   ├── router/
│   │   ├── AppRouter.tsx         # Router administrativo
│   │   └── WebRouter.tsx         # Router web público
│   ├── modules/
│   │   ├── frontdesk/            # Módulo de recepción
│   │   ├── reservations/         # Módulo de reservas
│   │   ├── guests/               # Módulo de huéspedes
│   │   └── housekeeping/         # Módulo de limpieza
│   └── App.tsx                   # Lógica de routing
```

### 👥 Para nuevos miembros del equipo

1. Clona el repositorio
2. `npm install`
3. **Crear `.env` con `VITE_MODE=admin`**
4. `npm run dev`
5. Ir a `http://localhost:5173/`

### 💡 Tip
Agrega el archivo `.env` a tu `.gitignore.local` para evitar subirlo por accidente, pero asegúrate de que todos los miembros del equipo lo tengan configurado.
