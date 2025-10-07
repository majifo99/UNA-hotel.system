# Backend Hotel API - Documentación para Frontend

## Información General

**Tecnología**: Laravel 12.0 con PHP 8.2  
**Autenticación**: Laravel Sanctum (Token-based)  
**Base de datos**: Relacional (MySQL/PostgreSQL)  
**URL Base**: `/api`

---

## Autenticación

Todos los endpoints (excepto login y register) requieren autenticación mediante Bearer Token.

**Headers requeridos**:
```
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

---

## Endpoints de Autenticación

### POST `/api/auth/login`
**Descripción**: Iniciar sesión  
**Autenticación**: No requerida

**Request Body**:
```json
{
  "email": "usuario@email.com",
  "password": "password123"
}
```

**Response Success (200)**:
```json
{
  "token": "1|abc123...",
  "user": {
    "id_usuario": 1,
    "nombre": "Juan",
    "apellido1": "Pérez",
    "apellido2": "García",
    "email": "juan@email.com",
    "rol": "Administrador"
  }
}
```

**Response Error (401)**:
```json
{
  "message": "Credenciales inválidas"
}
```

### POST `/api/auth/register`
**Descripción**: Registrar nuevo usuario  
**Autenticación**: No requerida

**Request Body**:
```json
{
  "id_rol": 1,
  "nombre": "Juan",
  "apellido1": "Pérez",
  "apellido2": "García",
  "email": "juan@email.com",
  "password": "password123",
  "telefono": "+506 8888-8888"
}
```

**Response Success (200)**:
```json
{
  "token": "1|abc123...",
  "user": {
    "id_usuario": 1,
    "nombre": "Juan",
    "apellido1": "Pérez",
    "apellido2": "García",
    "email": "juan@email.com",
    "rol": "Administrador"
  }
}
```

### GET `/api/auth/me`
**Descripción**: Obtener información del usuario autenticado  
**Autenticación**: Requerida

**Response Success (200)**:
```json
{
  "id_usuario": 1,
  "nombre": "Juan",
  "apellido1": "Pérez",
  "apellido2": "García",
  "email": "juan@email.com",
  "rol": "Administrador"
}
```

### POST `/api/auth/logout`
**Descripción**: Cerrar sesión  
**Autenticación**: Requerida

**Response Success (200)**:
```json
{
  "message": "Logout ok"
}
```

---

## Endpoints de Usuarios

### GET `/api/usuarios`
**Descripción**: Listar usuarios (paginado)  
**Autenticación**: Requerida

**Response Success (200)**:
```json
{
  "data": [
    {
      "id_usuario": 1,
      "id_rol": 1,
      "nombre": "Juan",
      "apellido1": "Pérez",
      "apellido2": "García",
      "email": "juan@email.com",
      "telefono": "+506 8888-8888",
      "created_at": "2025-09-17T10:00:00.000000Z",
      "updated_at": "2025-09-17T10:00:00.000000Z",
      "rol": {
        "id_rol": 1,
        "nombre": "Administrador",
        "descripcion": "Usuario con acceso total"
      }
    }
  ],
  "links": {...},
  "meta": {...}
}
```

### POST `/api/usuarios`
**Descripción**: Crear nuevo usuario  
**Autenticación**: Requerida

**Request Body**:
```json
{
  "id_rol": 1,
  "nombre": "Juan",
  "apellido1": "Pérez",
  "apellido2": "García",
  "email": "juan@email.com",
  "password": "password123",
  "telefono": "+506 8888-8888"
}
```

### GET `/api/usuarios/{id}`
**Descripción**: Obtener usuario por ID  
**Autenticación**: Requerida

### PUT `/api/usuarios/{id}`
**Descripción**: Actualizar usuario  
**Autenticación**: Requerida

### DELETE `/api/usuarios/{id}`
**Descripción**: Eliminar usuario  
**Autenticación**: Requerida

---

## Endpoints de Roles

### GET `/api/roles`
**Descripción**: Listar todos los roles

**Response Success (200)**:
```json
[
  {
    "id_rol": 1,
    "nombre": "Administrador",
    "descripcion": "Usuario con acceso total",
    "created_at": "2025-09-17T10:00:00.000000Z",
    "updated_at": "2025-09-17T10:00:00.000000Z"
  }
]
```

### POST `/api/roles`
**Request Body**:
```json
{
  "nombre": "Recepcionista",
  "descripcion": "Personal de front desk"
}
```

### GET `/api/roles/{id}`
### PUT `/api/roles/{id}`
### DELETE `/api/roles/{id}`

---

## Endpoints de Clientes

### GET `/api/clientes`
**Descripción**: Listar clientes (paginado)

**Response Success (200)**:
```json
{
  "data": [
    {
      "id_cliente": 1,
      "nombre": "María",
      "apellido1": "González",
      "apellido2": "López",
      "email": "maria@email.com",
      "telefono": "+506 7777-7777",
      "id_tipo_doc": 1,
      "numero_doc": "123456789",
      "nacionalidad": "Costarricense",
      "direccion": "San José, Costa Rica",
      "fecha_nacimiento": "1990-05-15",
      "genero": "Femenino",
      "created_at": "2025-09-17T10:00:00.000000Z",
      "updated_at": "2025-09-17T10:00:00.000000Z"
    }
  ],
  "links": {...},
  "meta": {...}
}
```

### POST `/api/clientes`
**Request Body**:
```json
{
  "nombre": "María",
  "apellido1": "González",
  "apellido2": "López",
  "email": "maria@email.com",
  "telefono": "+506 7777-7777",
  "id_tipo_doc": 1,
  "numero_doc": "123456789",
  "nacionalidad": "Costarricense",
  "direccion": "San José, Costa Rica",
  "fecha_nacimiento": "1990-05-15",
  "genero": "Femenino"
}
```

**Validaciones**:
- `nombre`: requerido, máximo 60 caracteres
- `apellido1`: requerido, máximo 60 caracteres
- `apellido2`: opcional, máximo 60 caracteres
- `email`: requerido, formato email, máximo 50 caracteres, único
- `telefono`: requerido, máximo 50 caracteres, único
- `id_tipo_doc`: opcional, debe existir en tabla tipo_doc
- `numero_doc`: opcional, máximo 40 caracteres
- `nacionalidad`: requerido, máximo 60 caracteres
- `direccion`: opcional, máximo 200 caracteres
- `fecha_nacimiento`: opcional, formato fecha
- `genero`: opcional

### GET `/api/clientes/{id}`
### PUT `/api/clientes/{id}`
### DELETE `/api/clientes/{id}`

---

## Endpoints de Habitaciones

### GET `/api/habitaciones`
**Descripción**: Listar habitaciones

**Response Success (200)**:
```json
[
  {
    "id_habitacion": 1,
    "id_estado_hab": 1,
    "tipo_habitacion_id": 1,
    "nombre": "Suite Presidencial",
    "numero": "101",
    "piso": 1,
    "capacidad": 4,
    "medida": "45 m²",
    "descripcion": "Suite con vista al mar",
    "created_at": "2025-09-17T10:00:00.000000Z",
    "updated_at": "2025-09-17T10:00:00.000000Z"
  }
]
```

### POST `/api/habitaciones`
**Request Body**:
```json
{
  "id_estado_hab": 1,
  "tipo_habitacion_id": 1,
  "nombre": "Suite Presidencial",
  "numero": "101",
  "piso": 1,
  "capacidad": 4,
  "medida": "45 m²",
  "descripcion": "Suite con vista al mar"
}
```

### GET `/api/habitaciones/{id}`
### PUT `/api/habitaciones/{id}`

---

## Endpoints de Catálogos

### Estados de Habitación
- **GET** `/api/estados-habitacion`
- **POST** `/api/estados-habitacion`
- **GET** `/api/estados-habitacion/{id}`
- **PUT** `/api/estados-habitacion/{id}`
- **DELETE** `/api/estados-habitacion/{id}`

### Tipos de Habitación
- **GET** `/api/tipos-habitacion`
- **POST** `/api/tipos-habitacion`
- **GET** `/api/tipos-habitacion/{id}`
- **PUT** `/api/tipos-habitacion/{id}`
- **DELETE** `/api/tipos-habitacion/{id}`

### Amenidades
- **GET** `/api/amenidades`
- **POST** `/api/amenidades`
- **GET** `/api/amenidades/{id}`
- **PUT** `/api/amenidades/{id}`
- **DELETE** `/api/amenidades/{id}`

### Fuentes
- **GET** `/api/fuentes`
- **POST** `/api/fuentes`
- **GET** `/api/fuentes/{id}`
- **PUT** `/api/fuentes/{id}`
- **DELETE** `/api/fuentes/{id}`

### Tipos de Documento
- **GET** `/api/tipos-doc`
- **POST** `/api/tipos-doc`
- **GET** `/api/tipos-doc/{id}`
- **PUT** `/api/tipos-doc/{id}`
- **DELETE** `/api/tipos-doc/{id}`

### Estados de Reserva
- **GET** `/api/estados-reserva`
- **POST** `/api/estados-reserva`
- **GET** `/api/estados-reserva/{id}`
- **PUT** `/api/estados-reserva/{id}`
- **DELETE** `/api/estados-reserva/{id}`

---

## Endpoints de Reservas

### GET `/api/reservas`
**Descripción**: Listar reservas (paginado)

**Response Success (200)**:
```json
{
  "data": [
    {
      "id_reserva": 1,
      "id_cliente": 1,
      "id_estado_res": 1,
      "fecha_creacion": "2025-09-17T10:00:00.000000Z",
      "total_monto_reserva": 1500.00,
      "notas": "Reserva para luna de miel",
      "adultos": 2,
      "ninos": 0,
      "bebes": 0,
      "id_fuente": 1,
      "created_at": "2025-09-17T10:00:00.000000Z",
      "updated_at": "2025-09-17T10:00:00.000000Z"
    }
  ],
  "links": {...},
  "meta": {...}
}
```

### POST `/api/reservas`
**Request Body**:
```json
{
  "id_cliente": 1,
  "id_estado_res": 1,
  "total_monto_reserva": 1500.00,
  "notas": "Reserva para luna de miel",
  "adultos": 2,
  "ninos": 0,
  "bebes": 0,
  "id_fuente": 1
}
```

**Validaciones**:
- `id_cliente`: requerido, debe existir en tabla clientes
- `id_estado_res`: requerido, debe existir en tabla estado_reserva
- `id_fuente`: opcional, debe existir en tabla fuentes
- `adultos`: requerido, mínimo 1
- `ninos`: requerido, mínimo 0
- `bebes`: requerido, mínimo 0
- `total_monto_reserva`: requerido, numérico, mínimo 0
- `notas`: opcional, máximo 300 caracteres

### GET `/api/reservas/{id}`
### PUT `/api/reservas/{id}`
### DELETE `/api/reservas/{id}`

### Acciones de Reserva
- **POST** `/api/reservas/{id}/confirmar`
- **POST** `/api/reservas/{id}/cancelar`
- **POST** `/api/reservas/{id}/cotizar`
- **POST** `/api/reservas/{id}/no-show`
- **POST** `/api/reservas/{id}/checkin`

---

## Endpoints de Habitaciones por Reserva

### GET `/api/reservas/{reserva}/habitaciones`
**Descripción**: Obtener habitaciones asignadas a una reserva

### POST `/api/reservas/{reserva}/habitaciones`
**Descripción**: Asignar habitación a una reserva

**Request Body**:
```json
{
  "id_habitacion": 1,
  "fecha_llegada": "2025-12-20T15:00:00",
  "fecha_salida": "2025-12-22",
  "pax_total": 2
}
```

### DELETE `/api/reservas/{reserva}/habitaciones/{id}`
**Descripción**: Remover habitación de una reserva

---

## Endpoints de Servicios por Reserva

### GET `/api/reservas/{reserva}/servicios`
**Descripción**: Obtener servicios de una reserva

### POST `/api/reservas/{reserva}/servicios`
**Descripción**: Agregar servicio a una reserva

**Request Body**:
```json
{
  "id_servicio": 1,
  "cantidad": 2,
  "precio_unitario": 50.00,
  "descripcion": "Servicio de spa"
}
```

### PUT `/api/reservas/{reserva}/servicios/{id}`
### DELETE `/api/reservas/{reserva}/servicios/{id}`

---

## Endpoints de Políticas por Reserva

### GET `/api/reservas/{reserva}/politicas`
### POST `/api/reservas/{reserva}/politicas`
**Request Body**:
```json
{
  "id_politica": 1,
  "motivo": "Política de cancelación especial"
}
```
### DELETE `/api/reservas/{reserva}/politicas/{id}`

---

## Endpoints de Disponibilidad

### GET `/api/disponibilidad`
**Descripción**: Consultar disponibilidad de habitaciones

**Query Parameters**:
- `fecha_llegada`: fecha de llegada (YYYY-MM-DD)
- `fecha_salida`: fecha de salida (YYYY-MM-DD)
- `tipo_habitacion_id`: opcional, filtrar por tipo de habitación
- `capacidad`: opcional, capacidad mínima

---

## Endpoints de Bloqueos Operativos

### GET `/api/bloqueos`
**Descripción**: Listar bloqueos operativos

### POST `/api/bloqueos`
**Descripción**: Crear bloqueo operativo

### GET `/api/bloqueos/{id}`
### DELETE `/api/bloqueos/{id}`

---

## Endpoints de House Keeping

### GET `/api/limpiezas`
**Descripción**: Listar tareas de limpieza
**Autenticación**: Requerida (auth:sanctum)

### POST `/api/limpiezas`
**Descripción**: Crear nueva tarea de limpieza
**Autenticación**: Requerida (auth:sanctum)

### GET `/api/limpiezas/{id}`
**Autenticación**: Requerida (auth:sanctum)

### PUT `/api/limpiezas/{id}`
**Autenticación**: Requerida (auth:sanctum)

### DELETE `/api/limpiezas/{id}`
**Autenticación**: Requerida (auth:sanctum)

### GET `/api/mantenimientos`
**Descripción**: Listar tareas de mantenimiento
**Autenticación**: Requerida (auth:sanctum)

### POST `/api/mantenimientos`
**Descripción**: Crear nueva tarea de mantenimiento
**Autenticación**: Requerida (auth:sanctum)

### GET `/api/mantenimientos/{id}`
**Autenticación**: Requerida (auth:sanctum)

### PUT `/api/mantenimientos/{id}`
**Autenticación**: Requerida (auth:sanctum)

### DELETE `/api/mantenimientos/{id}`
**Autenticación**: Requerida (auth:sanctum)

---

## Endpoints de Front Desk

### POST `/api/frontdesk/walkin`
**Descripción**: Crear walk-in (huésped sin reserva previa)

### POST `/api/frontdesk/reserva/{reserva}/checkin`
**Descripción**: Realizar check-in desde reserva

### GET `/api/frontdesk/estado-estadia`
**Descripción**: Obtener estados de estadía

### POST `/api/frontdesk/estado-estadia`
**Descripción**: Crear nuevo estado de estadía

### GET `/api/frontdesk/estadias`
**Descripción**: Listar estadías (paginado)

### GET `/api/frontdesk/estadia/{estadia}`
**Descripción**: Obtener detalle de estadía

### POST `/api/frontdesk/estadia/{estadia}/room-move`
**Descripción**: Cambio de habitación

### PATCH `/api/frontdesk/estadia/{estadia}/fechas`
**Descripción**: Ajustar fechas de estadía

### POST `/api/frontdesk/estadia/{estadia}/checkout`
**Descripción**: Realizar check-out

---

## Entidades del Sistema

### 1. User (Usuario)
**Tabla**: `users`  
**Primary Key**: `id_usuario`

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| id_usuario | bigint | Sí | ID único del usuario |
| id_rol | bigint | Sí | ID del rol (FK) |
| nombre | string(60) | Sí | Nombre del usuario |
| apellido1 | string(60) | Sí | Primer apellido |
| apellido2 | string(60) | No | Segundo apellido |
| email | string(120) | Sí | Email (único) |
| password | string(255) | Sí | Contraseña encriptada |
| telefono | string(60) | No | Teléfono |
| created_at | timestamp | No | Fecha de creación |
| updated_at | timestamp | No | Fecha de actualización |

**Relaciones**:
- Pertenece a un `Rol` (belongsTo)

---

### 2. Rol
**Tabla**: `rols`  
**Primary Key**: `id_rol`

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| id_rol | bigint | Sí | ID único del rol |
| nombre | string | Sí | Nombre del rol |
| descripcion | string | Sí | Descripción del rol |
| created_at | timestamp | No | Fecha de creación |
| updated_at | timestamp | No | Fecha de actualización |

**Relaciones**:
- Tiene muchos `Users` (hasMany)

---

### 3. Cliente
**Tabla**: `clientes`  
**Primary Key**: `id_cliente`

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| id_cliente | bigint | Sí | ID único del cliente |
| nombre | string(60) | Sí | Nombre del cliente |
| apellido1 | string(60) | Sí | Primer apellido |
| apellido2 | string(60) | No | Segundo apellido |
| email | string(50) | Sí | Email (único) |
| telefono | string(50) | Sí | Teléfono (único) |
| id_tipo_doc | bigint | No | ID tipo de documento (FK) |
| numero_doc | string(40) | No | Número de documento |
| nacionalidad | string(60) | Sí | Nacionalidad |
| direccion | string(200) | No | Dirección |
| fecha_nacimiento | date | No | Fecha de nacimiento |
| genero | string | No | Género |
| created_at | timestamp | No | Fecha de creación |
| updated_at | timestamp | No | Fecha de actualización |

**Relaciones**:
- Pertenece a un `TipoDoc` (belongsTo)
- Tiene muchas `Reservas` (hasMany)
- Tiene muchas `Estadias` (hasMany)

---

### 4. Habitacione (Habitación)
**Tabla**: `habitaciones`  
**Primary Key**: `id_habitacion`

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| id_habitacion | bigint | Sí | ID único de la habitación |
| id_estado_hab | bigint | Sí | ID estado habitación (FK) |
| tipo_habitacion_id | bigint | Sí | ID tipo de habitación (FK) |
| nombre | string | Sí | Nombre de la habitación |
| numero | string | Sí | Número de la habitación |
| piso | integer | Sí | Piso donde está ubicada |
| capacidad | integer | Sí | Capacidad de personas |
| medida | string | Sí | Medidas de la habitación |
| descripcion | string | Sí | Descripción |
| created_at | timestamp | No | Fecha de creación |
| updated_at | timestamp | No | Fecha de actualización |
| deleted_at | timestamp | No | Fecha de eliminación (soft delete) |

**Relaciones**:
- Pertenece a un `EstadoHabitacion` (belongsTo)
- Pertenece a un `TiposHabitacion` (belongsTo)
- Tiene muchas `HabitacionAmenidad` (hasMany)
- Tiene muchas `ReservaHabitacion` (hasMany)
- Tiene muchos `BloqueoOperativo` (hasMany)
- Tiene muchas `Limpiezas` (hasMany)
- Tiene muchos `Mantenimientos` (hasMany)

---

### 5. Reserva
**Tabla**: `reserva`  
**Primary Key**: `id_reserva`

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| id_reserva | bigint | Sí | ID único de la reserva |
| id_cliente | bigint | Sí | ID del cliente (FK) |
| id_estado_res | bigint | Sí | ID estado reserva (FK) |
| fecha_creacion | datetime | Sí | Fecha de creación |
| total_monto_reserva | decimal(10,2) | Sí | Monto total |
| notas | string(300) | No | Notas adicionales |
| adultos | integer | Sí | Número de adultos |
| ninos | integer | Sí | Número de niños |
| bebes | integer | Sí | Número de bebés |
| id_fuente | bigint | No | ID fuente (FK) |
| created_at | timestamp | No | Fecha de creación |
| updated_at | timestamp | No | Fecha de actualización |

**Relaciones**:
- Pertenece a un `Cliente` (belongsTo)
- Pertenece a un `EstadoReserva` (belongsTo)
- Pertenece a una `Fuente` (belongsTo)
- Tiene muchas `ReservaHabitacion` (hasMany)
- Tiene muchos `ReservaServicio` (hasMany)
- Tiene muchas `ReservaPolitica` (hasMany)
- Tiene muchos `ReservaPago` (hasMany)

---

### 6. ReservaHabitacion
**Tabla**: `reserva_habitacions`  
**Primary Key**: `id_reserva_hab`

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| id_reserva_hab | bigint | Sí | ID único |
| id_reserva | bigint | No | ID de la reserva (FK) |
| id_habitacion | bigint | No | ID de la habitación (FK) |
| fecha_llegada | datetime | Sí | Fecha y hora de llegada |
| fecha_salida | date | Sí | Fecha de salida |
| pax_total | integer | Sí | Total de personas |
| created_at | timestamp | No | Fecha de creación |
| updated_at | timestamp | No | Fecha de actualización |

**Relaciones**:
- Pertenece a una `Reserva` (belongsTo)
- Pertenece a una `Habitacion` (belongsTo)

---

### 7. Servicio
**Tabla**: `servicio`  
**Primary Key**: `id_servicio`

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| id_servicio | bigint | Sí | ID único del servicio |
| nombre | string(80) | Sí | Nombre del servicio (único) |
| precio | decimal(10,2) | Sí | Precio del servicio |
| descripcion | string(200) | No | Descripción |
| created_at | timestamp | No | Fecha de creación |
| updated_at | timestamp | No | Fecha de actualización |

**Relaciones**:
- Tiene muchos `ReservaServicio` (hasMany)

---

### 8. ReservaServicio
**Tabla**: `reserva_servicio`  
**Primary Key**: `id_reserva_serv`

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| id_reserva_serv | bigint | Sí | ID único |
| id_reserva | bigint | Sí | ID de la reserva (FK) |
| id_servicio | bigint | Sí | ID del servicio (FK) |
| cantidad | integer | Sí | Cantidad del servicio |
| precio_unitario | decimal(10,2) | Sí | Precio unitario |
| descripcion | string(200) | No | Descripción adicional |
| created_at | timestamp | No | Fecha de creación |
| updated_at | timestamp | No | Fecha de actualización |

**Relaciones**:
- Pertenece a una `Reserva` (belongsTo)
- Pertenece a un `Servicio` (belongsTo)

---

## Tablas de Catálogo

### EstadoHabitacion
**Tabla**: `estado_habitacion`
- `id_estado_hab`, `nombre`, `descripcion`, `tipo`

### TiposHabitacion
**Tabla**: `tipos_habitacion`
- `tipo_habitacion_id`, `nombre`, `descripcion`, `precio_base`

### Amenidad
**Tabla**: `amenidades`
- `id_amenidad`, `nombre`, `descripcion`

### HabitacionAmenidad
**Tabla**: `habitacion_amenidad`
- `id_hab_amenidad`, `id_habitacion`, `id_amenidad`

### EstadoReserva
**Tabla**: `estado_reserva`
- `id_estado_res`, `nombre`, `descripcion`

### Fuente
**Tabla**: `fuentes`
- `id_fuente`, `nombre`, `descripcion`

### TipoDoc
**Tabla**: `tipo_doc`
- `id_tipo_doc`, `nombre`, `descripcion`

---

## Códigos de Respuesta HTTP

- **200**: OK - Operación exitosa
- **201**: Created - Recurso creado exitosamente
- **204**: No Content - Operación exitosa sin contenido (ej: DELETE)
- **400**: Bad Request - Error en los datos enviados
- **401**: Unauthorized - No autenticado
- **403**: Forbidden - No autorizado
- **404**: Not Found - Recurso no encontrado
- **409**: Conflict - Conflicto (ej: no se puede eliminar por restricciones FK)
- **422**: Unprocessable Entity - Error de validación
- **500**: Internal Server Error - Error del servidor

---

## Estructura de Respuestas de Error

### Error de Validación (422)
```json
{
  "message": "Los datos proporcionados no son válidos.",
  "errors": {
    "email": ["El campo email es obligatorio."],
    "password": ["El campo password debe tener al menos 8 caracteres."]
  }
}
```

### Error de Autorización (401)
```json
{
  "message": "Unauthenticated."
}
```

### Error General
```json
{
  "message": "Descripción del error"
}
```

---

## Notas Importantes para el Frontend

1. **Paginación**: Varios endpoints devuelven datos paginados con estructura estándar de Laravel que incluye `data`, `links`, y `meta`.

2. **Soft Deletes**: La tabla `habitaciones` utiliza soft deletes, por lo que los registros eliminados pueden ser recuperados.

3. **Timestamps**: Todas las entidades principales incluyen `created_at` y `updated_at`.

4. **Foreign Keys**: Las relaciones están definidas con restricciones de integridad referencial. Algunos deletes están restringidos y otros en cascada.

5. **Autenticación**: Todos los endpoints de house keeping requieren autenticación con Sanctum.

6. **Validación única**: Campos como email de usuarios y clientes, y teléfono de clientes deben ser únicos.

7. **Campos opcionales**: Muchos campos son opcionales (nullable), especialmente en la información personal de clientes.

8. **Fechas**: Las fechas deben enviarse en formato ISO 8601 (YYYY-MM-DDTHH:mm:ss).

Este README debe servir como referencia completa para que el frontend pueda integrar correctamente con el backend del sistema hotelero.

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework.

You may also try the [Laravel Bootcamp](https://bootcamp.laravel.com), where you will be guided through building a modern Laravel application from scratch.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## Laravel Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the [Laravel Partners program](https://partners.laravel.com).

### Premium Partners

- **[Vehikl](https://vehikl.com)**
- **[Tighten Co.](https://tighten.co)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel)**
- **[DevSquad](https://devsquad.com/hire-laravel-developers)**
- **[Redberry](https://redberry.international/laravel-development)**
- **[Active Logic](https://activelogic.com)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
