/**
 * Admin Authentication Schema - Validation with Zod
 */

import { z } from 'zod';

// =================== ADMIN LOGIN SCHEMA ===================

export const adminLoginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Formato de email inválido'),
  
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  
  rememberMe: z.boolean().optional(),
});

export type AdminLoginFormData = z.infer<typeof adminLoginSchema>;

// =================== ADMIN REGISTER SCHEMA ===================

export const adminRegisterSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  
  apellido1: z
    .string()
    .min(2, 'El primer apellido debe tener al menos 2 caracteres')
    .max(100, 'El primer apellido no puede exceder 100 caracteres'),
  
  apellido2: z
    .string()
    .max(100, 'El segundo apellido no puede exceder 100 caracteres')
    .optional(),
  
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Formato de email inválido'),
  
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'La contraseña debe contener al menos una minúscula'),
  
  password_confirmation: z
    .string()
    .min(1, 'La confirmación de contraseña es requerida'),
  
  telefono: z
    .string()
    .min(8, 'El teléfono debe tener al menos 8 dígitos')
    .optional(),
  
  id_rol: z
    .number()
    .int()
    .positive('El rol es requerido'),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Las contraseñas no coinciden',
  path: ['password_confirmation'],
});

export type AdminRegisterFormData = z.infer<typeof adminRegisterSchema>;
