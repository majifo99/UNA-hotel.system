import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '../schemas/authSchemas';
import { useAuth } from '../hooks/useAuth.tsx';

// =================== COMPONENT ===================

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the intended destination from location state
  const from = (location.state as { from?: Location })?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      navigate(from, { replace: true });
    } catch (error) {
      // Error is handled by the auth context
      console.error('Login failed:', error);
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
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            ¿No tienes cuenta?{' '}
            <Link 
              to="/registro" 
              className="font-medium text-una-primary-600 hover:text-una-primary-900 transition-colors"
            >
              Regístrate aquí
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

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                autoComplete="email"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-una-primary-600 focus:border-una-primary-600 transition-colors ${
                  errors.email ? 'border-red-300' : 'border-una-bg-300'
                }`}
                placeholder="tu@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-una-primary-600 focus:border-una-primary-600 transition-colors ${
                    errors.password ? 'border-red-300' : 'border-una-bg-300'
                  }`}
                  placeholder="Tu contraseña"
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    )}
                  </svg>
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  {...register('rememberMe')}
                  id="rememberMe"
                  type="checkbox"
                  className="h-4 w-4 text-una-primary-600 focus:ring-una-primary-600 border-una-bg-300 rounded"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-neutral-700">
                  Recordarme
                </label>
              </div>

              <Link
                to="/reset-password"
                className="text-sm text-una-primary-600 hover:text-una-primary-900 transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
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
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </div>
        </form>

        {/* Demo Credentials */}
        <div className="bg-una-accent-gold/10 border border-una-accent-gold/20 rounded-lg p-4">
          <h3 className="text-sm font-medium text-una-primary-900 mb-2">Ejemplo de formato:</h3>
          <div className="text-sm text-neutral-600 space-y-1">
            <p><strong>Email:</strong> cliente@example.com</p>
            <p><strong>Contraseña:</strong> Mínimo 8 caracteres con mayúsculas, minúsculas y números</p>
          </div>
        </div>
      </div>
    </div>
  );
}
