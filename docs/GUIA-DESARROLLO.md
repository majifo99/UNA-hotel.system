# 🚀 Guía de Desarrollo - Sistema Hotelero UNA

## 📖 Introducción para Desarrolladores

Esta guía detalla los patrones, arquitectura y mejores prácticas para desarrollar en el sistema hotelero UNA. **Es esencial leer este documento antes de contribuir al proyecto**.

## 🏗️ Arquitectura Centralizada de Tipos

### 🎯 Sistema de Tipos Centralizados

El proyecto utiliza un **single source of truth** para todos los tipos principales. Esta arquitectura elimina duplicaciones y garantiza consistencia.

```
src/types/core/                    # 🎯 CENTRO DE TIPOS
├── domain.ts                      # Entidades principales (Guest, Room, etc.)
├── api.ts                         # Tipos de respuesta API
├── forms.ts                       # Formularios y validaciones
├── enums.ts                       # Enums y constantes
├── entities.ts                    # Entidades complejas
└── index.ts                       # Exportación centralizada
```

### ✅ Migración Completada - Estado Actual

- **✅ 0 errores TypeScript** (anteriormente 35+)
- **✅ Tipos centralizados** en `src/types/core/`
- **✅ Eliminadas duplicaciones** en todos los módulos
- **✅ Arquitectura escalable** implementada

## 📋 Reglas de Desarrollo OBLIGATORIAS

### 🟢 QUÉ HACER SIEMPRE

#### 1. Importar Entidades Principales desde Core

```typescript
// ✅ CORRECTO - Importar desde tipos centralizados
import type { Guest, Room, AdditionalService } from '@/types/core';

// ✅ Para formularios
import type { 
  CreateGuestData, 
  UpdateGuestData,
  ReservationFormData 
} from '@/types/core';

// ✅ Para respuestas API
import type { 
  ApiResponse, 
  GuestListResponse,
  PaginatedResponse 
} from '@/types/core';
```

#### 2. Usar Tipos Específicos del Módulo

```typescript
// ✅ Tipos específicos del módulo frontdesk
import type { 
  FrontdeskRoom, 
  RoomFilters, 
  DashboardStats 
} from '@/modules/frontdesk/types';

// ✅ Tipos específicos de reservaciones
import type { 
  ReservationFilters,
  CalendarEvent 
} from '@/modules/reservations/types';
```

#### 3. Extender Tipos Core para Casos Específicos

```typescript
// ✅ Extender entidades principales
interface FrontdeskGuest extends Guest {
  currentRoom?: Room;
  checkInTime?: string;
  preferences?: string[];
}

// ✅ Especializar para módulos
interface HousekeepingRoom extends Room {
  cleaningStatus: 'clean' | 'dirty' | 'in_progress';
  assignedStaff?: string;
  lastCleaned?: string;
}
```

### 🔴 QUÉ NO HACER NUNCA

#### 1. NO Crear Tipos Duplicados

```typescript
// ❌ PROHIBIDO - Ya existe en /types/core
export interface Guest {
  id: string;
  // ... otros campos
}

// ❌ PROHIBIDO - Usar los centralizados
export interface Room { ... }
export interface AdditionalService { ... }
```

#### 2. NO Importar desde Archivos Deprecated

```typescript
// ❌ PROHIBIDO - Archivo marcado como @deprecated
import type { Guest } from '@/modules/guests/types/GuestInterface';

// ❌ PROHIBIDO - Usar rutas obsoletas
import type { Room } from '@/modules/frontdesk/types/frontdesk';
```

#### 3. NO Crear APIs Duplicadas

```typescript
// ❌ PROHIBIDO - Usar las centralizadas
export interface ApiResponse<T> {
  data: T;
  success: boolean;
}
```

## 🔧 Flujo de Trabajo para Nuevos Tipos

### Agregar Nueva Entidad Principal

1. **Crear en `src/types/core/domain.ts`**:
```typescript
export interface NewEntity {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}
```

2. **Exportar desde `src/types/core/index.ts`**:
```typescript
export type { NewEntity } from './domain';
```

3. **Crear tipos de formulario en `src/types/core/forms.ts`**:
```typescript
export interface CreateNewEntityData {
  name: string;
  // otros campos del formulario
}

export interface UpdateNewEntityData extends Partial<CreateNewEntityData> {
  id: string;
}
```

4. **Agregar respuestas API en `src/types/core/api.ts`**:
```typescript
export interface NewEntityListResponse extends ApiResponse<NewEntity[]> {
  pagination: PaginationInfo;
}
```

### Tipos Específicos del Módulo

Para funcionalidad específica del módulo:

```typescript
// En /modules/mi-modulo/types/index.ts

import type { NewEntity } from '@/types/core';

// ✅ Extender la entidad core
export interface ModuleSpecificEntity extends NewEntity {
  moduleSpecificField: string;
  customBehavior?: boolean;
}

// ✅ Filtros específicos del módulo
export interface ModuleFilters {
  status?: 'active' | 'inactive';
  dateRange?: {
    from: string;
    to: string;
  };
}
```

## 🎨 Patrones de Componentes

### Componentes con Tipos Centralizados

```typescript
// ✅ Ejemplo de componente bien tipado
import type { Guest, Room } from '@/types/core';
import type { FrontdeskRoom } from '@/modules/frontdesk/types';

interface GuestCardProps {
  guest: Guest;
  room?: FrontdeskRoom;
  onEdit?: (guest: Guest) => void;
  onCheckOut?: (guestId: string, roomId: string) => void;
}

export const GuestCard: React.FC<GuestCardProps> = ({
  guest,
  room,
  onEdit,
  onCheckOut
}) => {
  // Implementación del componente
};
```

### Hooks con TanStack Query

```typescript
// ✅ Hook bien tipado con tipos centralizados
import type { Guest, ApiResponse } from '@/types/core';
import { useQuery } from '@tanstack/react-query';

export const useGuests = () => {
  return useQuery<ApiResponse<Guest[]>>({
    queryKey: ['guests'],
    queryFn: async () => {
      const response = await guestService.getAll();
      return response;
    }
  });
};
```

## 🔌 Servicios API Estandarizados

### BaseApiService

Todos los servicios extienden de `BaseApiService`:

```typescript
// ✅ Servicio que extiende BaseApiService
import { BaseApiService } from '@/services/BaseApiService';
import type { Guest, CreateGuestData, ApiResponse } from '@/types/core';

class GuestService extends BaseApiService {
  protected baseUrl = '/guests';

  async getAll(): Promise<ApiResponse<Guest[]>> {
    return this.get<Guest[]>('');
  }

  async create(data: CreateGuestData): Promise<ApiResponse<Guest>> {
    return this.post<Guest>('', data);
  }

  async update(id: string, data: Partial<CreateGuestData>): Promise<ApiResponse<Guest>> {
    return this.put<Guest>(`/${id}`, data);
  }
}

export const guestService = new GuestService();
```

### Características del BaseApiService

- **Type Safety Completo**: Todos los métodos tipados
- **Manejo de Errores**: Consistente en toda la aplicación
- **Mocking**: Soporte automático para datos simulados
- **Interceptors**: Para autenticación y logging

## 📚 Estructura de Módulos

### Módulo Estándar

```
modules/mi-modulo/
├── components/              # Componentes específicos del módulo
├── hooks/                   # Hooks de TanStack Query
├── pages/                   # Páginas del módulo
├── services/               # Servicios API específicos
├── types/                  # Tipos específicos del módulo
├── utils/                  # Utilidades del módulo
└── index.ts               # Exportación del módulo
```

### Ejemplo de Estructura Completa

```typescript
// modules/reservations/types/index.ts
import type { Guest, Room, AdditionalService } from '@/types/core';

export interface ReservationFilters {
  status?: 'confirmed' | 'pending' | 'cancelled';
  checkInDate?: string;
  checkOutDate?: string;
}

export interface CalendarEvent {
  id: string;
  guest: Guest;
  room: Room;
  checkIn: string;
  checkOut: string;
  services: AdditionalService[];
}
```

## 🛠️ Herramientas de Desarrollo

### Verificación de Tipos

```bash
# Verificar todos los tipos
npm run type-check

# Build completo para verificar errores
npm run build

# Desarrollo con hot reload
npm run dev
```

### ESLint y Prettier

```bash
# Ejecutar linting
npm run lint

# Auto-fix de problemas de ESLint
npm run lint -- --fix

# Formatear código (si Prettier está configurado)
npm run format
```

## 🔄 Migración de Código Legacy

### Archivos Marcados como @deprecated

Estos archivos mantienen compatibilidad pero **deben migrarse**:

```typescript
// ⚠️ DEPRECATED - Migrar a @/types/core
// modules/guests/types/GuestInterface.ts
/**
 * @deprecated Use Guest from @/types/core instead
 */
export interface GuestInterface extends Guest {}
```

### Proceso de Migración

1. **Identificar imports deprecated**:
```bash
# Buscar imports que necesitan migración
grep -r "from.*GuestInterface" src/
```

2. **Reemplazar imports**:
```typescript
// ❌ Antes
import type { GuestInterface } from '@/modules/guests/types/GuestInterface';

// ✅ Después
import type { Guest } from '@/types/core';
```

3. **Verificar build**:
```bash
npm run build
```

## 🎯 Mejores Prácticas de Desarrollo

### 1. Type Safety

```typescript
// ✅ Usar satisfies para validar objetos
const guestFormConfig = {
  fields: ['firstName', 'lastName', 'email'],
  validation: 'strict'
} satisfies FormConfig<Guest>;

// ✅ Usar const assertions para mayor precisión
const ROOM_STATUSES = ['available', 'occupied', 'maintenance'] as const;
type RoomStatus = typeof ROOM_STATUSES[number];
```

### 2. Componentización

```typescript
// ✅ Props interface clara y específica
interface RoomCardProps {
  room: Room;
  variant?: 'compact' | 'detailed';
  showActions?: boolean;
  onStatusChange?: (roomId: string, status: RoomStatus) => Promise<void>;
}

// ✅ Componente con manejo de errores
export const RoomCard: React.FC<RoomCardProps> = ({ 
  room, 
  variant = 'compact',
  showActions = true,
  onStatusChange 
}) => {
  // Implementación
};
```

### 3. Hooks Especializados

```typescript
// ✅ Hook específico con tipos claros
export const useRoomStatus = (roomId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (status: RoomStatus) => {
      return roomService.updateStatus(roomId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    }
  });
};
```

## 🚨 Debugging y Solución de Problemas

### Errores Comunes

#### 1. "Cannot find module '@/types/core'"

**Solución**: Verificar que el path alias esté configurado en `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

#### 2. "Type 'Guest' is not assignable"

**Solución**: Verificar que estés importando desde `@/types/core`:

```typescript
// ❌ Incorrecto
import type { Guest } from './types/guest';

// ✅ Correcto
import type { Guest } from '@/types/core';
```

#### 3. "Duplicate identifier 'Guest'"

**Solución**: Eliminar definiciones duplicadas y usar solo las centralizadas.

### Herramientas de Debug

```typescript
// ✅ Type checking en runtime (desarrollo)
const isGuest = (obj: unknown): obj is Guest => {
  return typeof obj === 'object' && 
         obj !== null && 
         'id' in obj && 
         'firstName' in obj;
};

// ✅ Logging tipado
const logGuestAction = (guest: Guest, action: string) => {
  console.log(`Guest ${guest.firstName} ${guest.lastName}: ${action}`);
};
```

## 📈 Performance y Optimización

### 1. Lazy Loading de Módulos

```typescript
// ✅ Lazy loading de páginas
const ReservationsPage = lazy(() => import('@/modules/reservations/pages/ReservationsPage'));
const GuestsPage = lazy(() => import('@/modules/guests/pages/GuestsPage'));
```

### 2. Memoización de Componentes

```typescript
// ✅ Memo con tipos específicos
interface GuestListProps {
  guests: Guest[];
  filters: GuestFilters;
}

export const GuestList = memo<GuestListProps>(({ guests, filters }) => {
  // Implementación
});
```

### 3. Query Optimization

```typescript
// ✅ Queries optimizadas con select
const useGuestNames = () => {
  return useQuery({
    queryKey: ['guests'],
    queryFn: guestService.getAll,
    select: (data) => data.data.map(guest => ({
      id: guest.id,
      name: `${guest.firstName} ${guest.lastName}`
    }))
  });
};
```

## 🤝 Código Review Guidelines

### Checklist para Pull Requests

- [ ] **Tipos centralizados**: ¿Se usan tipos de `@/types/core`?
- [ ] **No duplicaciones**: ¿Se evitaron tipos duplicados?
- [ ] **Build exitoso**: ¿Pasa `npm run build`?
- [ ] **Type check**: ¿Pasa `npm run type-check`?
- [ ] **ESLint clean**: ¿No hay errores de ESLint?
- [ ] **Documentación**: ¿Se documentaron tipos complejos?
- [ ] **Tests**: ¿Se agregaron/actualizaron tests relevantes?

### Estándares de Código

#### Naming Conventions

```typescript
// ✅ Interfaces y tipos en PascalCase
interface GuestFormData {}
type RoomStatus = 'available' | 'occupied';

// ✅ Constantes en SCREAMING_SNAKE_CASE
const API_ENDPOINTS = {
  GUESTS: '/api/guests',
  ROOMS: '/api/rooms'
} as const;

// ✅ Variables y funciones en camelCase
const guestService = new GuestService();
const handleGuestCreate = () => {};
```

#### Documentation

```typescript
/**
 * Represents a hotel guest with complete profile information
 * 
 * @example
 * ```typescript
 * const guest: Guest = {
 *   id: '123',
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   email: 'john@example.com',
 *   // ... otros campos
 * };
 * ```
 */
export interface Guest {
  /** Unique identifier for the guest */
  id: string;
  
  /** Guest's first name */
  firstName: string;
  
  /** Guest's last name */
  lastName: string;
  
  // ... otros campos documentados
}
```

## 🎉 Próximos Pasos

### Funcionalidades en Desarrollo

1. **Autenticación**: Sistema de login y roles
2. **Payments**: Integración con pasarelas de pago
3. **Notifications**: Sistema de notificaciones en tiempo real
4. **Reports**: Dashboard ejecutivo con métricas

### Mejoras Técnicas Planificadas

1. **Testing**: Implementar Jest y React Testing Library
2. **Storybook**: Documentación visual de componentes
3. **Performance**: Implementar lazy loading y memoización
4. **Accessibility**: Mejorar a11y en todos los componentes

---

## 🎨 Componentes UI Reutilizables

### Sistema de Alertas

El proyecto incluye un sistema de alertas profesional y reutilizable que reemplaza los `alert()` del navegador.

#### Componente Alert

```typescript
import { Alert, useAlert } from '@/components/ui';

// En tu componente
const MyComponent = () => {
  const { alert, showAlert, hideAlert } = useAlert();

  const handleSuccess = () => {
    showAlert({
      type: 'success',
      title: 'Operación exitosa',
      message: 'Los datos se guardaron correctamente',
      autoClose: true,
      duration: 5000 // 5 segundos
    });
  };

  const handleError = () => {
    showAlert({
      type: 'error',
      title: 'Error al procesar',
      message: 'Por favor revise los datos e intente nuevamente'
    });
  };

  return (
    <div>
      {/* Mostrar la alerta si existe */}
      {alert && (
        <Alert
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onClose={hideAlert}
        />
      )}
      
      {/* Tu contenido */}
      <button onClick={handleSuccess}>Éxito</button>
      <button onClick={handleError}>Error</button>
    </div>
  );
};
```

#### Tipos de Alerta Disponibles

```typescript
// ✅ Éxito (verde)
showAlert({
  type: 'success',
  title: 'Reserva creada',
  message: 'La reserva se registró exitosamente'
});

// ❌ Error (rojo)
showAlert({
  type: 'error',
  title: 'Error de validación',
  message: 'Por favor complete todos los campos requeridos'
});

// ⚠️ Advertencia (amarillo)
showAlert({
  type: 'warning',
  title: 'Atención',
  message: 'Esta acción no se puede deshacer'
});

// ℹ️ Información (azul)
showAlert({
  type: 'info',
  title: 'Información',
  message: 'El sistema se actualizará en 5 minutos'
});
```

#### Configuración de Auto-cierre

```typescript
// Auto-cierre por defecto (3 segundos)
showAlert({
  type: 'success',
  message: 'Guardado exitosamente'
});

// Auto-cierre personalizado
showAlert({
  type: 'info',
  message: 'Procesando...',
  autoClose: true,
  duration: 10000 // 10 segundos
});

// Sin auto-cierre (requiere cierre manual)
showAlert({
  type: 'error',
  message: 'Error crítico',
  autoClose: false
});
```

### Otros Componentes UI Disponibles

#### Modal Reutilizable

```typescript
import { Modal } from '@/components/ui';

const MyModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="Mi Modal"
      size="lg" // sm, md, lg, xl
    >
      <p>Contenido del modal...</p>
    </Modal>
  );
};
```

---

## 🔍 Validaciones con Zod - Estándar del Proyecto

### ¿Por qué Zod?

- **Type Safety**: Validación tipada en tiempo de compilación y ejecución
- **Integración perfecta** con React Hook Form
- **Mensajes de error personalizables**
- **Validaciones complejas** con `refine()` y `superRefine()`
- **Reutilización** de schemas entre módulos

### Estructura de Schemas

#### 1. Schemas Básicos

```typescript
// En /modules/mi-modulo/schemas/miSchema.ts
import { z } from 'zod';

// Schema básico
export const guestSchema = z.object({
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(8, 'El teléfono debe tener al menos 8 dígitos'),
  age: z.number().min(18, 'Debe ser mayor de edad').max(100, 'Edad inválida'),
});

// Tipos derivados automáticamente
export type GuestFormData = z.infer<typeof guestSchema>;
```

#### 2. Validaciones Complejas

```typescript
// Validaciones con lógica personalizada
export const reservationSchema = z.object({
  checkInDate: z.string().min(1, 'La fecha de entrada es requerida'),
  checkOutDate: z.string().min(1, 'La fecha de salida es requerida'),
  numberOfGuests: z.number().min(1, 'Mínimo 1 huésped').max(10, 'Máximo 10 huéspedes'),
  roomType: z.enum(['single', 'double', 'suite'], {
    message: 'Seleccione un tipo de habitación válido'
  }),
}).superRefine((data, ctx) => {
  // Validación de fechas
  const checkIn = new Date(data.checkInDate);
  const checkOut = new Date(data.checkOutDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Fecha no puede ser anterior a hoy
  if (checkIn < today) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'La fecha de entrada no puede ser anterior a hoy',
      path: ['checkInDate'],
    });
  }

  // Fecha de salida debe ser posterior a entrada
  if (checkOut <= checkIn) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'La fecha de salida debe ser posterior a la fecha de entrada',
      path: ['checkOutDate'],
    });
  }
});
```

#### 3. Schemas Reutilizables

```typescript
// Schemas base que se pueden extender
const baseEntitySchema = z.object({
  id: z.string().uuid('ID inválido'),
  createdAt: z.string().datetime('Fecha de creación inválida'),
  updatedAt: z.string().datetime('Fecha de actualización inválida'),
});

// Extender schema base
export const roomSchema = baseEntitySchema.extend({
  number: z.string().min(1, 'Número de habitación requerido'),
  type: z.enum(['single', 'double', 'suite']),
  pricePerNight: z.number().min(0, 'El precio no puede ser negativo'),
  isAvailable: z.boolean(),
});
```

### Integración con React Hook Form

#### Hook Estándar con Zod

```typescript
// En /modules/mi-modulo/hooks/useMyForm.ts
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { mySchema, type MyFormData } from '../schemas/mySchema';

export const useMyForm = () => {
  const form = useForm<MyFormData>({
    resolver: zodResolver(mySchema),
    defaultValues: {
      // valores por defecto
    },
    mode: 'onChange', // Validación en tiempo real
  });

  const { handleSubmit, formState: { errors, isValid } } = form;

  const onSubmit = handleSubmit(async (data) => {
    try {
      // Procesar datos validados
      await myService.save(data);
      showAlert({
        type: 'success',
        message: 'Datos guardados exitosamente'
      });
    } catch (error) {
      showAlert({
        type: 'error',
        message: 'Error al guardar los datos'
      });
    }
  });

  return {
    form,
    errors,
    isValid,
    onSubmit,
  };
};
```

#### Componente con Validación

```typescript
// En el componente
const MyForm = () => {
  const { form, errors, isValid, onSubmit } = useMyForm();
  const { register } = form;

  // Helper para extraer mensajes de error
  const getErrorMessage = (error: any): string | undefined => {
    return error?.message || undefined;
  };

  return (
    <form onSubmit={onSubmit}>
      <div>
        <label>Nombre *</label>
        <input
          {...register('firstName')}
          className={errors.firstName ? 'border-red-500' : 'border-gray-300'}
        />
        {errors.firstName && (
          <p className="text-red-600 text-sm">{getErrorMessage(errors.firstName)}</p>
        )}
      </div>

      <button 
        type="submit" 
        disabled={!isValid}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        Guardar
      </button>
    </form>
  );
};
```

### Patrones de Validación Recomendados

#### 1. Validaciones Comunes Reutilizables

```typescript
// /utils/validationUtils.ts
import { z } from 'zod';

// Validadores reutilizables
export const validators = {
  // Documentos de identidad
  costaRicanId: z.string().regex(/^\d{9}$/, 'Cédula debe tener 9 dígitos'),
  passport: z.string().min(6, 'Pasaporte inválido').max(12, 'Pasaporte inválido'),
  
  // Teléfonos
  phoneNumber: z.string().regex(/^[\d\-\+\(\)\s]+$/, 'Teléfono inválido'),
  
  // Fechas
  futureDate: z.string().refine((date) => {
    return new Date(date) > new Date();
  }, 'La fecha debe ser futura'),
  
  // Monedas
  currency: z.number().min(0, 'El monto no puede ser negativo').multipleOf(0.01, 'Máximo 2 decimales'),
};

// Usar en schemas
export const guestSchema = z.object({
  documentNumber: validators.costaRicanId,
  phone: validators.phoneNumber,
  // ...otros campos
});
```

#### 2. Mensajes de Error Personalizados

```typescript
// Configuración global de mensajes
const customErrorMap: z.ZodErrorMap = (issue, ctx) => {
  switch (issue.code) {
    case z.ZodIssueCode.invalid_type:
      return { message: `Se esperaba ${issue.expected}, pero se recibió ${issue.received}` };
    case z.ZodIssueCode.too_small:
      if (issue.type === 'string') {
        return { message: `Debe tener al menos ${issue.minimum} caracteres` };
      }
      break;
    case z.ZodIssueCode.too_big:
      if (issue.type === 'string') {
        return { message: `No puede tener más de ${issue.maximum} caracteres` };
      }
      break;
  }
  return { message: ctx.defaultError };
};

// Aplicar globalmente
z.setErrorMap(customErrorMap);
```

### Mejores Prácticas

#### ✅ DO - Buenas Prácticas

```typescript
// ✅ Schemas específicos por módulo
const reservationSchema = z.object({...});

// ✅ Tipos derivados automáticamente
type ReservationData = z.infer<typeof reservationSchema>;

// ✅ Validación en tiempo real
mode: 'onChange'

// ✅ Mensajes de error claros
z.string().min(2, 'El nombre debe tener al menos 2 caracteres')

// ✅ Validaciones de negocio específicas
.superRefine((data, ctx) => {
  // lógica de validación compleja
})
```

#### ❌ DON'T - Evitar

```typescript
// ❌ Validaciones manuales cuando ya tienes Zod
if (!email.includes('@')) {
  setError('Email inválido');
}

// ❌ Schemas demasiado genéricos
const genericSchema = z.object({ data: z.any() });

// ❌ No usar los tipos derivados
interface MyData { // usar z.infer<> en su lugar
  name: string;
}

// ❌ Validación solo en submit
mode: 'onSubmit' // usar 'onChange' para UX mejor
```

---

## 🆘 Soporte y Contacto

### Para Dudas Técnicas

1. **Revisar este documento** primero
2. **Verificar `/src/types/core/`** para tipos disponibles
3. **Consultar comentarios JSDoc** en el código
4. **Crear issue en GitHub** con detalles específicos

### Recursos Adicionales

- **TypeScript Handbook**: Para conceptos avanzados de tipos
- **React 19 Docs**: Para nuevas características de React
- **TanStack Query**: Para manejo de estado del servidor
- **Tailwind CSS**: Para estilos y componentes UI

---

**¡Happy coding! 🚀 Construyamos un sistema hotelero excepcional.**
