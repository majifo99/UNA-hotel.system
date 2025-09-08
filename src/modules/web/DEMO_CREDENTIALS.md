# Credenciales Demo - UNA Hotel System

⚠️ **SOLO PARA DESARROLLO Y DEMOSTRACIÓN**

Estas credenciales son **temporales** y solo funcionan en el entorno de desarrollo local.

## Usuarios de Prueba

### Usuario Demo
- **Email:** `demo@unahotel.com`
- **Contraseña:** `DemoPass2024!`
- **Perfil:** Usuario regular para pruebas

### Administrador Demo
- **Email:** `admin@unahotel.com`
- **Contraseña:** `AdminDemo2024!`
- **Perfil:** Administrador del sistema

## Notas de Seguridad

🔒 **IMPORTANTE:**
- Estas contraseñas están hasheadas usando una función básica
- En producción se debe usar bcrypt, argon2 u otro algoritmo seguro
- Los tokens generados son mock y no son seguros para producción
- Toda la autenticación actual es simulada

## Para Producción

Antes de desplegar a producción:
1. Reemplazar el sistema de autenticación mock
2. Implementar hash seguro de contraseñas (bcrypt)
3. Usar JWT reales con firma segura
4. Configurar base de datos real
5. Implementar rate limiting
6. Configurar HTTPS
7. Auditar todas las funciones de seguridad

---
*Este archivo debe ser eliminado antes del despliegue a producción*
