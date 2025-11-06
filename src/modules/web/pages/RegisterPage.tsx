/**
 * Register Page - Public Website
 * 
 * User registration form with validation and error handling.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormData } from '../schemas/authSchemas';
import { useAuth } from '../hooks/useAuth.tsx';

// =================== COMPONENT ===================

export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      acceptTerms: false,
      subscribeNewsletter: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data);
      // Redirect to profile completion page after successful registration
      navigate('/perfil/completar', { replace: true });
    } catch (error) {
      // Error is handled by the auth context
      console.error('Registration failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-una-bg-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link 
            to="/" 
            className="text-una-primary-900 text-2xl font-bold hover:text-una-primary-800 transition-colors"
          >
            UNA Hotel
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-neutral-900">
            Crear Cuenta
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            ¿Ya tienes cuenta?{' '}
            <Link 
              to="/login" 
              className="font-medium text-una-primary-600 hover:text-una-primary-900 transition-colors"
            >
              Inicia sesión aquí
            </Link>
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white rounded-lg shadow-sm border border-una-bg-300 p-6 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-neutral-700 mb-2">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('firstName')}
                  type="text"
                  id="firstName"
                  autoComplete="given-name"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-una-primary-600 focus:border-una-primary-600 transition-colors ${
                    errors.firstName ? 'border-red-300' : 'border-una-bg-300'
                  }`}
                  placeholder="Frander"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-neutral-700 mb-2">
                  Apellido <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('lastName')}
                  type="text"
                  id="lastName"
                  autoComplete="family-name"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-una-primary-600 focus:border-una-primary-600 transition-colors ${
                    errors.lastName ? 'border-red-300' : 'border-una-bg-300'
                  }`}
                  placeholder="Centeno"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                autoComplete="email"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-una-primary-600 focus:border-una-primary-600 transition-colors ${
                  errors.email ? 'border-red-300' : 'border-una-bg-300'
                }`}
                placeholder="cliente@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-2">
                Teléfono <span className="text-red-500">*</span>
              </label>
              <input
                {...register('phone')}
                type="tel"
                id="phone"
                autoComplete="tel"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-una-primary-600 focus:border-una-primary-600 transition-colors ${
                  errors.phone ? 'border-red-300' : 'border-una-bg-300'
                }`}
                placeholder="+506 8888 7777"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
              <p className="mt-1 text-xs text-neutral-500">
                Formato: +506 8888 7777 o similar
              </p>
            </div>

            {/* Password Fields */}
            <div className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                  Contraseña <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="new-password"
                    className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-una-primary-600 focus:border-una-primary-600 transition-colors ${
                      errors.password ? 'border-red-300' : 'border-una-bg-300'
                    }`}
                    placeholder="Password123!"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <svg 
                      className="h-5 w-5 text-neutral-400" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      {showPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.636 6.636m0 0L3.757 3.757m0 0L6.636 6.636M9.878 9.878l.636-.636m0 0L13.757 6M19.5 12A10.98 10.98 0 0012 2c-4.478 0-8.268 2.943-9.543 7" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      )}
                    </svg>
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-2">
                  Confirmar Contraseña <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    {...register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    autoComplete="new-password"
                    className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-una-primary-600 focus:border-una-primary-600 transition-colors ${
                      errors.confirmPassword ? 'border-red-300' : 'border-una-bg-300'
                    }`}
                    placeholder="Password123!"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <svg 
                      className="h-5 w-5 text-neutral-400" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      {showConfirmPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.636 6.636m0 0L3.757 3.757m0 0L6.636 6.636M9.878 9.878l.636-.636m0 0L13.757 6M19.5 12A10.98 10.98 0 0012 2c-4.478 0-8.268 2.943-9.543 7" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      )}
                    </svg>
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-una-bg-100 rounded-md p-4">
              <h4 className="text-sm font-medium text-neutral-700 mb-2">
                Requisitos de contraseña:
              </h4>
              <ul className="text-xs text-neutral-600 space-y-1 list-disc list-inside">
                <li>Mínimo 8 caracteres</li>
                <li>Al menos una letra minúscula</li>
                <li>Al menos una letra mayúscula</li>
                <li>Al menos un número</li>
                <li>Al menos un carácter especial (!@#$%^&*)</li>
              </ul>
            </div>

            {/* Terms and Newsletter */}
            <div className="space-y-4">
              <div className="flex items-start">
                <input
                  {...register('acceptTerms')}
                  id="acceptTerms"
                  type="checkbox"
                  className="h-4 w-4 text-una-primary-600 focus:ring-una-primary-600 border-una-bg-300 rounded mt-0.5"
                />
                <label htmlFor="acceptTerms" className="ml-2 block text-sm text-neutral-700">
                  Acepto los{' '}
                  <Link to="/terminos" className="text-una-primary-600 hover:text-una-primary-900 underline">
                    términos y condiciones
                  </Link>{' '}
                  y la{' '}
                  <Link to="/privacidad" className="text-una-primary-600 hover:text-una-primary-900 underline">
                    política de privacidad
                  </Link>
                  <span className="text-red-500"> *</span>
                </label>
              </div>
              {errors.acceptTerms && (
                <p className="text-sm text-red-600">{errors.acceptTerms.message}</p>
              )}

              <div className="flex items-start">
                <input
                  {...register('subscribeNewsletter')}
                  id="subscribeNewsletter"
                  type="checkbox"
                  className="h-4 w-4 text-una-primary-600 focus:ring-una-primary-600 border-una-bg-300 rounded mt-0.5"
                />
                <label htmlFor="subscribeNewsletter" className="ml-2 block text-sm text-neutral-700">
                  Quiero recibir ofertas especiales y noticias del hotel por email
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--color-darkGreen1)', borderColor: 'var(--color-darkGreen1)' }}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creando cuenta...
                </>
              ) : (
                'Crear Cuenta'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
