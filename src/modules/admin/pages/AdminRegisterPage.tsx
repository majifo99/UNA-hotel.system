/**
 * Admin Register Page
 * Registro de nuevos usuarios administradores
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { adminRegisterSchema, type AdminRegisterFormData } from '../auth/schemas';
import { useAdminAuth } from '../auth/useAdminAuthHook';

export function AdminRegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const { register: registerUser, isLoading, error } = useAdminAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<AdminRegisterFormData>({
    resolver: zodResolver(adminRegisterSchema),
    defaultValues: {
      id_rol: 2, // Por defecto, rol de administrador (id: 2)
    },
  });

  const password = watch('password');

  const onSubmit = async (data: AdminRegisterFormData) => {
    try {
      await registerUser(data);
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Admin registration failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1A3636] via-[#40534C] to-[#677D6A] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-[#D6BD98] rounded-full flex items-center justify-center mb-4 shadow-lg">
            <svg className="h-10 w-10 text-[#1A3636]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-[#F3EDE3]">
            Registrar Administrador
          </h2>
          <p className="mt-2 text-sm text-[#D6BD98]">
            Crea una nueva cuenta de administrador del sistema
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-[#F3EDE3] rounded-lg shadow-xl p-8 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Nombres y Apellidos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-[#1A3636] mb-2">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('nombre')}
                  type="text"
                  id="nombre"
                  autoComplete="given-name"
                  className={`w-full px-4 py-3 border-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#40534C] focus:border-[#40534C] transition-colors bg-white text-[#1A3636] ${
                    errors.nombre ? 'border-red-300' : 'border-[#D3E2D2]'
                  }`}
                  placeholder="Danier"
                />
                {errors.nombre && (
                  <p className="mt-1 text-sm text-red-600">{errors.nombre.message}</p>
                )}
              </div>

              {/* Primer Apellido */}
              <div>
                <label htmlFor="apellido1" className="block text-sm font-medium text-[#1A3636] mb-2">
                  Primer Apellido <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('apellido1')}
                  type="text"
                  id="apellido1"
                  autoComplete="family-name"
                  className={`w-full px-4 py-3 border-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#40534C] focus:border-[#40534C] transition-colors bg-white text-[#1A3636] ${
                    errors.apellido1 ? 'border-red-300' : 'border-[#D3E2D2]'
                  }`}
                  placeholder="Centeno"
                />
                {errors.apellido1 && (
                  <p className="mt-1 text-sm text-red-600">{errors.apellido1.message}</p>
                )}
              </div>
            </div>

            {/* Segundo Apellido */}
            <div>
              <label htmlFor="apellido2" className="block text-sm font-medium text-[#1A3636] mb-2">
                Segundo Apellido
              </label>
              <input
                {...register('apellido2')}
                type="text"
                id="apellido2"
                className={`w-full px-4 py-3 border-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#40534C] focus:border-[#40534C] transition-colors bg-white text-[#1A3636] ${
                  errors.apellido2 ? 'border-red-300' : 'border-[#D3E2D2]'
                }`}
                placeholder="Loaiza"
              />
              {errors.apellido2 && (
                <p className="mt-1 text-sm text-red-600">{errors.apellido2.message}</p>
              )}
            </div>

            {/* Email y Teléfono */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#1A3636] mb-2">
                  Email Corporativo <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  autoComplete="email"
                  className={`w-full px-4 py-3 border-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#40534C] focus:border-[#40534C] transition-colors bg-white text-[#1A3636] ${
                    errors.email ? 'border-red-300' : 'border-[#D3E2D2]'
                  }`}
                  placeholder="danier@hotel.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Teléfono */}
              <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-[#1A3636] mb-2">
                  Teléfono
                </label>
                <input
                  {...register('telefono')}
                  type="tel"
                  id="telefono"
                  autoComplete="tel"
                  className={`w-full px-4 py-3 border-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#40534C] focus:border-[#40534C] transition-colors bg-white text-[#1A3636] ${
                    errors.telefono ? 'border-red-300' : 'border-[#D3E2D2]'
                  }`}
                  placeholder="88888888"
                />
                {errors.telefono && (
                  <p className="mt-1 text-sm text-red-600">{errors.telefono.message}</p>
                )}
              </div>
            </div>

            {/* Rol */}
            <div>
              <label htmlFor="id_rol" className="block text-sm font-medium text-[#1A3636] mb-2">
                Rol <span className="text-red-500">*</span>
              </label>
              <select
                {...register('id_rol', { valueAsNumber: true })}
                id="id_rol"
                className={`w-full px-4 py-3 border-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#40534C] focus:border-[#40534C] transition-colors bg-white text-[#1A3636] ${
                  errors.id_rol ? 'border-red-300' : 'border-[#D3E2D2]'
                }`}
              >
                <option value={1}>Recepcionista</option>
                <option value={2}>Administrador</option>
              </select>
              {errors.id_rol && (
                <p className="mt-1 text-sm text-red-600">{errors.id_rol.message}</p>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#1A3636] mb-2">
                Contraseña <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="new-password"
                  className={`w-full px-4 py-3 pr-10 border-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#40534C] focus:border-[#40534C] transition-colors bg-white text-[#1A3636] ${
                    errors.password ? 'border-red-300' : 'border-[#D3E2D2]'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <svg 
                    className="h-5 w-5 text-[#677D6A]" 
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
              {password && (
                <div className="mt-2 space-y-1 text-xs">
                  <p className={password.length >= 6 ? 'text-green-600' : 'text-gray-500'}>
                    ✓ Mínimo 6 caracteres
                  </p>
                  <p className={/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-500'}>
                    ✓ Una letra mayúscula
                  </p>
                  <p className={/[a-z]/.test(password) ? 'text-green-600' : 'text-gray-500'}>
                    ✓ Una letra minúscula
                  </p>
                </div>
              )}
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <label htmlFor="password_confirmation" className="block text-sm font-medium text-[#1A3636] mb-2">
                Confirmar Contraseña <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  {...register('password_confirmation')}
                  type={showPasswordConfirmation ? 'text' : 'password'}
                  id="password_confirmation"
                  autoComplete="new-password"
                  className={`w-full px-4 py-3 pr-10 border-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#40534C] focus:border-[#40534C] transition-colors bg-white text-[#1A3636] ${
                    errors.password_confirmation ? 'border-red-300' : 'border-[#D3E2D2]'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                >
                  <svg 
                    className="h-5 w-5 text-[#677D6A]" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    {showPasswordConfirmation ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.636 6.636m0 0L3.757 3.757m0 0L6.636 6.636M9.878 9.878l.636-.636m0 0L13.757 6M19.5 12A10.98 10.98 0 0012 2c-4.478 0-8.268 2.943-9.543 7" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    )}
                  </svg>
                </button>
              </div>
              {errors.password_confirmation && (
                <p className="mt-1 text-sm text-red-600">{errors.password_confirmation.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-[#F3EDE3] bg-gradient-to-r from-[#1A3636] to-[#40534C] hover:from-[#40534C] hover:to-[#677D6A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#677D6A] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#F3EDE3]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creando cuenta...
                </>
              ) : (
                'Registrar Administrador'
              )}
            </button>

            {/* Login Link */}
            <div className="text-center">
              <Link 
                to="/admin/login" 
                className="text-sm text-[#40534C] hover:text-[#1A3636] font-medium transition-colors"
              >
                ¿Ya tienes cuenta? Inicia sesión
              </Link>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-[#D6BD98]">
            UNA Hotel Management System v1.0
          </p>
          <p className="text-xs text-[#BAD9B1] mt-1">
            Solo personal autorizado
          </p>
        </div>
      </div>
    </div>
  );
}
