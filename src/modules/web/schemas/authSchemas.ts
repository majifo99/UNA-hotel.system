/**
 * Authentication Schemas - Validation with Zod
 * 
 * Zod schemas for validating authentication forms (login, register, etc.).
 */

import { z } from 'zod';

// =================== LOGIN SCHEMA ===================

export const loginSchema = z.object({
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

export type LoginFormData = z.infer<typeof loginSchema>;

// =================== REGISTER SCHEMA ===================

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'El nombre es requerido')
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(50, 'El nombre no puede exceder 50 caracteres'),
    
    lastName: z
      .string()
      .min(1, 'El apellido es requerido')
      .min(2, 'El apellido debe tener al menos 2 caracteres')
      .max(50, 'El apellido no puede exceder 50 caracteres'),
    
    email: z
      .string()
      .min(1, 'El email es requerido')
      .email('Formato de email inválido'),
    
    password: z
      .string()
      .min(1, 'La contraseña es requerida')
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .refine((password) => {
        // More secure validation without vulnerable regex
        const hasLowercase = /[a-z]/.test(password);
        const hasUppercase = /[A-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        return hasLowercase && hasUppercase && hasNumber;
      }, {
        message: 'La contraseña debe contener al menos una minúscula, una mayúscula y un número'
      }),
    
    confirmPassword: z
      .string()
      .min(1, 'Confirmar contraseña es requerido'),
    
    phone: z
      .string()
      .optional()
      .refine((val) => !val || val.length >= 10, {
        message: 'El teléfono debe tener al menos 10 dígitos',
      }),
    
    nationality: z
      .string()
      .optional(),
    
    acceptTerms: z
      .boolean()
      .refine((val) => val === true, {
        message: 'Debes aceptar los términos y condiciones',
      }),
    
    subscribeNewsletter: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

// =================== PASSWORD RESET SCHEMA ===================

export const passwordResetSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Formato de email inválido'),
});

export type PasswordResetFormData = z.infer<typeof passwordResetSchema>;

// =================== PASSWORD CHANGE SCHEMA ===================

export const passwordChangeSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'La contraseña actual es requerida'),
    
    newPassword: z
      .string()
      .min(1, 'La nueva contraseña es requerida')
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .refine((password) => {
        // More secure validation without vulnerable regex
        const hasLowercase = /[a-z]/.test(password);
        const hasUppercase = /[A-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        return hasLowercase && hasUppercase && hasNumber;
      }, {
        message: 'La contraseña debe contener al menos una minúscula, una mayúscula y un número'
      }),
    
    confirmNewPassword: z
      .string()
      .min(1, 'Confirmar nueva contraseña es requerido'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmNewPassword'],
  });

export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;
