import { z } from 'zod';

// Schema para la validación de datos del huésped
export const guestFormSchema = z.object({
  firstName: z
    .string()
    .min(1, 'Nombre es requerido')
    .trim(),
    
  firstLastName: z
    .string()
    .min(1, 'Primer apellido es requerido')
    .trim(),
    
  secondLastName: z
    .string()
    .optional(),
    
  email: z
    .string()
    .min(1, 'Email es requerido')
    .email('Email no válido'),
    
  phone: z
    .string()
    .min(1, 'Teléfono es requerido')
    .trim(),
    
  documentNumber: z
    .string()
    .min(1, 'Número de documento es requerido')
    .trim(),
    
  documentType: z
    .enum(['passport', 'license', 'id_card']),
    
  nationality: z
    .string()
    .min(1, 'Nacionalidad es requerida'),
    
  // Campos opcionales
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),
  }).optional(),
  
  city: z.string().optional(),
  country: z.string().optional(),
  birthDate: z.string().optional(),
  dateOfBirth: z.string().optional(),
  preferredLanguage: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  allergies: z.array(z.string()).optional(),
  specialRequests: z.string().optional(),
  notes: z.string().optional(),
  medicalNotes: z.string().optional(),
  dietaryRestrictions: z.array(z.string()).optional(),
  
  communicationPreferences: z.object({
    email: z.boolean().optional(),
    sms: z.boolean().optional(),
    phone: z.boolean().optional(),
    whatsapp: z.boolean().optional(),
  }).optional(),
  
  roomPreferences: z.object({
    floor: z.enum(['low', 'high', 'middle']).optional(),
    view: z.enum(['ocean', 'mountain', 'city', 'garden']).optional(),
    bedType: z.enum(['single', 'double', 'queen', 'king', 'twin']).optional(),
    smokingAllowed: z.boolean().optional(),
  }).optional(),
  
  emergencyContact: z.object({
    name: z.string().optional(),
    relationship: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
  }).optional(),
  
  vipStatus: z.boolean().optional(),
  
  loyaltyProgram: z.object({
    memberId: z.string().optional(),
    tier: z.enum(['bronze', 'silver', 'gold', 'platinum']).optional(),
    points: z.number().optional(),
  }).optional(),
  
  isActive: z.boolean().optional(),
});

// Schema para actualización (con id)
export const updateGuestFormSchema = guestFormSchema.extend({
  id: z.string().min(1, 'ID es requerido'),
});

// Tipos inferidos de los schemas
export type GuestFormData = z.infer<typeof guestFormSchema>;
export type UpdateGuestFormData = z.infer<typeof updateGuestFormSchema>;

// Función helper para formatear errores de Zod
export const formatZodErrors = <T>(error: z.ZodError): Partial<T> => {
  const formattedErrors: any = {};
  
  error.issues.forEach((issue) => {
    const path = issue.path.join('.');
    formattedErrors[path] = issue.message;
  });
  
  return formattedErrors;
};