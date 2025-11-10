# 🏨 Sistema de Gestión Hotelera UNA

## 📋 Descripción del Proyecto

Sistema integral de gestión hotelera desarrollado con **React 19 + TypeScript + Vite**. Diseñado para manejar todas las operaciones de un hotel: recepción, reservas, huéspedes y limpieza.

### Características Principales

- 🏠 **Gestión de Recepción (Frontdesk)**: Check-in/out, estado de habitaciones, dashboard operativo
- 📅 **Sistema de Reservas**: Creación, modificación y seguimiento de reservaciones
- 👥 **Gestión de Huéspedes**: Perfiles completos, historial y preferencias
- 🧹 **Control de Limpieza**: Asignación de tareas, seguimiento de estado de habitaciones
- 📊 **Reportes y Estadísticas**: Dashboard con métricas en tiempo real

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/majifo99/UNA-hotel.system.git
cd UNA-hotel.system

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Abrir en el navegador
# http://localhost:5173
```

## 📚 Documentación

Para guías detalladas y documentación técnica, consulta la carpeta [`/docs`](./docs/):

- **[Guía de Atajos](./docs/GUIA-ATAJOS.md)** - Referencia rápida de navegación con teclado
- **[Sistema de Navegación](./docs/NAVEGACION-README.md)** - Documentación completa del sistema de navegación
- **[Guía de Desarrollo](./docs/GUIA-DESARROLLO.md)** - Estándares y mejores prácticas para desarrolladores
- **[Setup del Equipo](./docs/SETUP-EQUIPO.md)** - Configuración del entorno de desarrollo
- **[API Configuration Guide](./docs/API_CONFIGURATION.md)** - Backend API configuration for dev & production
- **[Deployment Quick Start](./docs/DEPLOYMENT_QUICK_START.md)** - Deploy to Vercel, Netlify, or other platforms

## �🔐 **IMPORTANTE: Acceso al Sistema Administrativo**

El proyecto tiene **DOS interfaces separadas**:

### 🌐 **Sitio Web Público** (por defecto)
- **URL**: `http://localhost:5173/`
- **Descripción**: Página web pública del hotel para huéspedes
- **Funciones**: Reservas online, información del hotel, etc.

### 🏢 **Sistema Administrativo** (para empleados)
- **Descripción**: Dashboard completo para gestión hotelera
- **Funciones**: Check-in/out, gestión de habitaciones, reportes, etc.

#### **Formas de acceder al Sistema Administrativo:**

**📋 Opción 1: Variable de entorno (RECOMENDADO para desarrollo)**
```bash
# Crear archivo .env en la raíz del proyecto
echo "VITE_MODE=admin" > .env
npm run dev
# Luego ir a: http://localhost:5173/
```

**📋 Opción 2: URL con parámetro**
```
http://localhost:5173/?admin=true
```

**📋 Opción 3: URL con prefijo admin**
```
http://localhost:5173/admin
```

### 🎯 **URLs del Sistema Administrativo:**
- **Dashboard Principal**: `http://localhost:5173/`
- **Front Desk**: `http://localhost:5173/frontdesk`
- **Check-in**: `http://localhost:5173/frontdesk/checkin`
- **Check-out**: `http://localhost:5173/frontdesk/checkout`
- **Housekeeping**: `http://localhost:5173/housekeeping`
- **Reservas**: `http://localhost:5173/reservations/create`
- **Huéspedes**: `http://localhost:5173/guests`

### Scripts Disponibles

```bash
npm run dev          # Modo desarrollo con hot reload
npm run build        # Compilar para producción
npm run preview      # Vista previa de build de producción
npm run type-check   # Verificar tipos TypeScript
npm run lint         # Ejecutar ESLint
```

## 🚀 Deployment to Production

### ⚠️ Critical: Environment Variables

**REQUIRED:** Set `VITE_API_URL` in your production environment.

```bash
# For Vercel, Netlify, or other platforms
VITE_API_URL=https://backendhotelt.onrender.com/api
```

### Quick Deploy to Vercel

1. Set environment variable: `VITE_API_URL` in Vercel dashboard
2. Push your code or trigger redeploy
3. Application will fail to start if `VITE_API_URL` is not set

### Development vs Production

| Environment | API Configuration |
|------------|-------------------|
| **Development** | Uses Vite proxy (`/api` → `VITE_BACKEND_URL`) |
| **Production** | Requires `VITE_API_URL` (full backend URL) |

📖 **See full guide:** [Deployment Quick Start](./docs/DEPLOYMENT_QUICK_START.md)

## 🏗️ Tecnologías Utilizadas

### Frontend
- **React 19** - Framework principal
- **TypeScript** - Tipado estático y seguridad
- **Vite** - Build tool y dev server ultrarrápido
- **Tailwind CSS** - Framework de estilos utility-first
- **Lucide React** - Iconografía moderna

### Estado y Datos
- **TanStack Query** - Gestión de estado del servidor
- **React Hook Form** - Manejo de formularios
- **Zod** - Validación de esquemas
- **Mock Data** - Datos simulados para desarrollo

### Herramientas de Desarrollo
- **ESLint** - Linting y calidad de código
- **TypeScript** - Type checking
- **Prettier** - Formateo de código (recomendado)

## 📦 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
├── layouts/            # Layouts principales
├── pages/              # Páginas de la aplicación
├── router/             # Configuración de rutas
├── services/           # Servicios API base
├── types/core/         # Tipos centralizados
├── modules/            # Módulos especializados
│   ├── frontdesk/      # Módulo de recepción
│   ├── reservations/   # Módulo de reservas
│   ├── guests/         # Módulo de huéspedes
│   └── housekeeping/   # Módulo de limpieza
└── utils/              # Utilidades y helpers
```

## 🎯 Funcionalidades por Módulo

### 🏠 Frontdesk (Recepción)
- Dashboard con estadísticas en tiempo real
- Gestión de estado de habitaciones
- Calendario visual de ocupación
- Check-in y check-out rápidos
- Vista de habitaciones disponibles/ocupadas

### 📅 Reservations (Reservas)
- Formulario de creación de reservas
- Selección de habitaciones por tipo
- Gestión de servicios adicionales
- Cálculo automático de precios
- Búsqueda de huéspedes existentes

### 👥 Guests (Huéspedes)
- Perfiles completos de huéspedes
- Información de contacto y documentos
- Historial de estadías
- Preferencias y alergias
- Búsqueda y filtrado avanzado

### 🧹 Housekeeping (Limpieza)
- Dashboard de estado de habitaciones
- Asignación de tareas a personal
- Seguimiento de habitaciones limpias/pendientes
- Reportes de mantenimiento
- Gestión de personal de limpieza

## 🔧 Configuración de Desarrollo

### Variables de Entorno

Crear archivo `.env.local`:

```env
VITE_API_URL=http://localhost:3000/api
VITE_ENABLE_MOCKING=true
VITE_MOCK_DELAY=500
```

### Mock Data

El proyecto incluye datos simulados para desarrollo:
- Habitaciones con diferentes estados
- Huéspedes con perfiles completos
- Reservas de ejemplo
- Servicios adicionales

### Hot Reload

El servidor de desarrollo incluye:
- ⚡ Hot Module Replacement (HMR)
- 🔄 Auto-refresh en cambios
- � Overlay de errores TypeScript
- 🎨 Recarga automática de estilos

## 📈 Estado del Proyecto

### ✅ Completado
- Arquitectura modular implementada
- Sistema de tipos centralizados
- Módulos de frontdesk y reservas funcionales
- Gestión básica de huéspedes
- Dashboard de limpieza
- Routing y navegación

### 🚧 En Desarrollo
- Integración con API real
- Sistema de autenticación
- Reportes avanzados
- Notificaciones en tiempo real
- Módulo de pagos

### 📋 Próximas Características
- **Pagos**: Integración con pasarelas de pago
- **Reportes**: Dashboard ejecutivo con métricas
- **Inventario**: Gestión de amenities y suministros
- **Staff**: Gestión de empleados y turnos
- **Mantenimiento**: Seguimiento de reparaciones

## 🤝 Contribuir al Proyecto

### Para Desarrolladores

1. **Leer la documentación**: Revisar `GUIA-DESARROLLO.md` antes de comenzar
2. **Seguir convenciones**: Usar patrones establecidos de tipos e imports
3. **Testing**: Verificar que el build pase antes de commit
4. **Code Review**: Seguir las guías de revisión de código

### Flujo de Trabajo

```bash
# Crear nueva rama
git checkout -b feature/nueva-funcionalidad

# Realizar cambios y verificar build
npm run build
npm run type-check

# Commit y push
git add .
git commit -m "feat: nueva funcionalidad"
git push origin feature/nueva-funcionalidad

# Crear Pull Request
```

### Estándares de Código

- **TypeScript**: Tipado estricto obligatorio
- **Imports**: Usar rutas desde `@/types/core` para entidades principales
- **Componentes**: Functional components con hooks
- **Estilos**: Tailwind CSS con clases utility
- **Documentación**: JSDoc en funciones públicas

## � Licencia

Este proyecto es desarrollado para la Universidad Nacional de Costa Rica (UNA).

## 📞 Contacto y Soporte

- **Repositorio**: [GitHub - UNA Hotel System](https://github.com/majifo99/UNA-hotel.system)
- **Documentación de Desarrollo**: Ver `GUIA-DESARROLLO.md`
- **Issues**: Reportar bugs y solicitar características en GitHub

---

## 🚀 Inicio Rápido

```bash
git clone https://github.com/majifo99/UNA-hotel.system.git
cd UNA-hotel.system
npm install
npm run dev
```

**¡Sistema listo para desarrollo! 🎉**

> **Nota para Desarrolladores**: Asegúrate de leer `GUIA-DESARROLLO.md` para entender la arquitectura de tipos y patrones de desarrollo.
