/**
 * Web Header Component - Public Website Header
 * 
 * Header for the public-facing website with navigation, user menu, and branding.
 */

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.tsx';

// =================== COMPONENT ===================

export function WebHeader() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white shadow-sm border-b border-una-bg-300 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link 
              to="/" 
              className="text-una-primary-900 text-xl font-bold hover:text-una-primary-800 transition-colors"
            >
              UNA Hotel
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link
              to="/"
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                isActiveRoute('/') 
                  ? 'text-una-primary-900 border-b-2 border-una-primary-600' 
                  : 'text-neutral-600 hover:text-una-primary-900'
              }`}
            >
              Inicio
            </Link>
            <Link
              to="/habitaciones"
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                isActiveRoute('/habitaciones') 
                  ? 'text-una-primary-900 border-b-2 border-una-primary-600' 
                  : 'text-neutral-600 hover:text-una-primary-900'
              }`}
            >
              Habitaciones
            </Link>
            <Link
              to="/servicios"
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                isActiveRoute('/servicios') 
                  ? 'text-una-primary-900 border-b-2 border-una-primary-600' 
                  : 'text-neutral-600 hover:text-una-primary-900'
              }`}
            >
              Servicios
            </Link>
            <Link
              to="/contacto"
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                isActiveRoute('/contacto') 
                  ? 'text-una-primary-900 border-b-2 border-una-primary-600' 
                  : 'text-neutral-600 hover:text-una-primary-900'
              }`}
            >
              Contacto
            </Link>
          </nav>

          {/* User Menu / Auth Buttons */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              /* Authenticated User Menu */
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-neutral-700 transition-colors"
                  style={{ color: 'var(--color-darkGreen1)' }}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-darkGreen1)' }}>
                    <span className="text-white text-sm font-medium">
                      {user.firstName[0]}{user.lastName[0]}
                    </span>
                  </div>
                  <span className="hidden md:block font-medium">
                    {user.firstName}
                  </span>
                  <svg 
                    className="w-4 h-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-una-bg-300">
                    <Link
                      to="/perfil"
                      className="block px-4 py-2 text-sm text-neutral-700 hover:bg-una-bg-100 hover:text-una-primary-900"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Mi Perfil
                    </Link>
                    <Link
                      to="/mis-reservas"
                      className="block px-4 py-2 text-sm text-neutral-700 hover:bg-una-bg-100 hover:text-una-primary-900"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Mis Reservas
                    </Link>
                    <hr className="my-1 border-una-bg-300" />
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        handleLogout();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-una-bg-100 hover:text-una-primary-900"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Guest User Buttons */
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="font-medium transition-colors"
                  style={{ color: 'var(--color-darkGreen1)' }}
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/registro"
                  className="text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity font-medium"
                  style={{ backgroundColor: 'var(--color-darkGreen1)' }}
                >
                  Registrarse
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-neutral-600 hover:text-una-primary-900 hover:bg-una-bg-100 transition-colors"
            >
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-una-bg-300">
            <div className="flex flex-col space-y-2">
              <Link
                to="/"
                className={`px-3 py-2 text-base font-medium transition-colors ${
                  isActiveRoute('/') 
                    ? 'text-una-primary-900 bg-una-bg-100' 
                    : 'text-neutral-600 hover:text-una-primary-900 hover:bg-una-bg-100'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Inicio
              </Link>
              <Link
                to="/habitaciones"
                className={`px-3 py-2 text-base font-medium transition-colors ${
                  isActiveRoute('/habitaciones') 
                    ? 'text-una-primary-900 bg-una-bg-100' 
                    : 'text-neutral-600 hover:text-una-primary-900 hover:bg-una-bg-100'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Habitaciones
              </Link>
              <Link
                to="/servicios"
                className={`px-3 py-2 text-base font-medium transition-colors ${
                  isActiveRoute('/servicios') 
                    ? 'text-una-primary-900 bg-una-bg-100' 
                    : 'text-neutral-600 hover:text-una-primary-900 hover:bg-una-bg-100'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Servicios
              </Link>
              <Link
                to="/contacto"
                className={`px-3 py-2 text-base font-medium transition-colors ${
                  isActiveRoute('/contacto') 
                    ? 'text-una-primary-900 bg-una-bg-100' 
                    : 'text-neutral-600 hover:text-una-primary-900 hover:bg-una-bg-100'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Contacto
              </Link>

              {/* Mobile Auth Actions */}
              {!isAuthenticated && (
                <>
                  <hr className="my-2 border-una-bg-300" />
                  <Link
                    to="/login"
                    className="px-3 py-2 text-base font-medium hover:bg-una-bg-100 transition-colors"
                    style={{ color: 'var(--color-darkGreen1)' }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    to="/registro"
                    className="mx-3 my-1 px-4 py-2 text-white rounded-md hover:opacity-90 transition-opacity font-medium text-center"
                    style={{ backgroundColor: 'var(--color-darkGreen1)' }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close menus */}
      {(isMenuOpen || isUserMenuOpen) && (
        <div 
          className="fixed inset-0 z-40" 
          role="button"
          tabIndex={0}
          aria-label="Cerrar menú"
          onClick={() => {
            setIsMenuOpen(false);
            setIsUserMenuOpen(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
              setIsMenuOpen(false);
              setIsUserMenuOpen(false);
            }
          }}
        />
      )}
    </header>
  );
}
