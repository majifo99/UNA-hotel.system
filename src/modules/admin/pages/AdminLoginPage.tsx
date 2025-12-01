/**
 * Admin Login Page
 */

import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { adminLoginSchema, type AdminLoginFormData } from '../auth/schemas';
import { useAdminAuth } from '../auth/useAdminAuthHook';

export function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: Location })?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginFormData>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      rememberMe: false,
    },
  });

  const onSubmit = async (data: AdminLoginFormData) => {
    try {
      await login(data);
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Admin login failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1A3636] via-[#40534C] to-[#677D6A]">
      <div className="max-w-md w-full space-y-8 p-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-[#D6BD98] rounded-full flex items-center justify-center mb-4 shadow-lg">
            <svg className="h-10 w-10 text-[#1A3636]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-[#F3EDE3]">
            Panel Administrativo
          </h2>
          <p className="mt-2 text-sm text-[#D6BD98]">
            Ingresa tus credenciales para continuar
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-[#F3EDE3] rounded-lg shadow-xl p-6 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#1A3636] mb-2">
                Email Corporativo
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                autoComplete="email"
                className={`w-full px-4 py-3 border-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#40534C] focus:border-[#40534C] transition-colors bg-white text-[#1A3636] ${
                  errors.email ? 'border-red-300' : 'border-[#D3E2D2]'
                }`}
                placeholder="admin@unahotel.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#1A3636] mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
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
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                {...register('rememberMe')}
                id="rememberMe"
                type="checkbox"
                className="h-4 w-4 text-[#40534C] focus:ring-[#40534C] border-[#D3E2D2] rounded"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-[#1A3636]">
                Mantener sesión iniciada
              </label>
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
                  Verificando credenciales...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>

            {/* Register Link */}
            <div className="text-center">
              <Link 
                to="/admin/register" 
                className="text-sm text-[#40534C] hover:text-[#1A3636] font-medium transition-colors"
              >
                ¿No tienes cuenta? Regístrate
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
