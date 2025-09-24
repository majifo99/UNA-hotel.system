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
    <header style={{ backgroundColor: 'var(--color-darkGreen1)' }} className=" shadow-lg border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center mt-5">
            <Link 
              to="/" 
              className="flex items-center hover:opacity-90 transition-opacity"
            >
              <img 
                src="/src/assets/Sol nav.png" 
                alt="Hotel Lanaku" 
                className="h-30 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link
              to="/"
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                isActiveRoute('/') 
                  ? 'text-white border-b-2 border-una-accent-gold' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Inicio
            </Link>
            <Link
              to="/acerca"
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                isActiveRoute('/acerca') 
                  ? 'text-white border-b-2 border-una-accent-gold' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Acerca de Nosotros
            </Link>
            <Link
              to="/habitaciones"
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                isActiveRoute('/habitaciones') 
                  ? 'text-white border-b-2 border-una-accent-gold' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Habitaciones
            </Link>
            <Link
              to="/servicios"
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                isActiveRoute('/servicios') 
                  ? 'text-white border-b-2 border-una-accent-gold' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Servicios
            </Link>
            <Link
              to="/contacto"
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                isActiveRoute('/contacto') 
                  ? 'text-white border-b-2 border-una-accent-gold' 
                  : 'text-gray-300 hover:text-white'
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
                  className="flex items-center space-x-2 text-white transition-colors"
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
                  className="font-medium transition-colors text-gray-300 hover:text-white"
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
              className="md:hidden p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
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
          <div className="md:hidden py-4 border-t border-gray-700">
            <div className="flex flex-col space-y-2">
              <Link
                to="/"
                className={`px-3 py-2 text-base font-medium transition-colors ${
                  isActiveRoute('/') 
                    ? 'text-white bg-gray-700' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Inicio
              </Link>
              <Link
                to="/acerca"
                className={`px-3 py-2 text-base font-medium transition-colors ${
                  isActiveRoute('/acerca') 
                    ? 'text-white bg-gray-700' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Acerca de Nosotros
              </Link>
              <Link
                to="/habitaciones"
                className={`px-3 py-2 text-base font-medium transition-colors ${
                  isActiveRoute('/habitaciones') 
                    ? 'text-white bg-gray-700' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Habitaciones
              </Link>
              <Link
                to="/servicios"
                className={`px-3 py-2 text-base font-medium transition-colors ${
                  isActiveRoute('/servicios') 
                    ? 'text-white bg-gray-700' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Servicios
              </Link>
              <Link
                to="/contacto"
                className={`px-3 py-2 text-base font-medium transition-colors ${
                  isActiveRoute('/contacto') 
                    ? 'text-white bg-gray-700' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Contacto
              </Link>

              {/* Mobile Auth Actions */}
              {!isAuthenticated && (
                <>
                  <hr className="my-2 border-gray-700" />
                  <Link
                    to="/login"
                    className="px-3 py-2 text-base font-medium hover:bg-gray-700 transition-colors text-gray-300 hover:text-white"
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
