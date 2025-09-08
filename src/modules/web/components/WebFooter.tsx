/**
 * Web Footer Component - Public Website Footer
 * 
 * Footer for the public-facing website with links, contact info, and branding.
 */

import { Link } from 'react-router-dom';

// =================== COMPONENT ===================

export function WebFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ backgroundColor: 'var(--color-darkGreen1)' }} className="text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Hotel Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold" style={{ color: 'var(--color-sand)' }}>UNA Hotel</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Experimenta la hospitalidad excepcional en nuestro hotel de lujo. 
              Donde cada detalle está diseñado para crear momentos inolvidables.
            </p>
            <div className="flex space-x-4">
              {/* Social Media Icons */}
              <a 
                href="#" 
                className="text-gray-300 transition-colors"
                style={{ color: 'var(--color-sand)' }}
                aria-label="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="text-gray-300 transition-colors"
                style={{ color: 'var(--color-sand)' }}
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zm4.25 3.25a5.25 5.25 0 1 1 0 10.5 5.25 5.25 0 0 1 0-10.5zm0 1.5a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5zm5.5.75a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="text-gray-300 transition-colors"
                style={{ color: 'var(--color-sand)' }}
                aria-label="Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold" style={{ color: 'var(--color-sand)' }}>Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/habitaciones" 
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Habitaciones
                </Link>
              </li>
              <li>
                <Link 
                  to="/servicios" 
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Servicios
                </Link>
              </li>
              <li>
                <Link 
                  to="/promociones" 
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Promociones
                </Link>
              </li>
              <li>
                <Link 
                  to="/galeria" 
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Galería
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold" style={{ color: 'var(--color-sand)' }}>Servicios</h4>
            <ul className="space-y-2">
              <li>
                <span className="text-gray-300 text-sm">Restaurante</span>
              </li>
              <li>
                <span className="text-gray-300 text-sm">Spa & Wellness</span>
              </li>
              <li>
                <span className="text-gray-300 text-sm">Centro de Negocios</span>
              </li>
              <li>
                <span className="text-gray-300 text-sm">Servicio a la Habitación</span>
              </li>
              <li>
                <span className="text-gray-300 text-sm">Transporte</span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold" style={{ color: 'var(--color-sand)' }}>Contacto</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--color-sand)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-gray-300 text-sm">
                  Av. Principal 123<br />
                  Ciudad, País 12345
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-sand)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <p className="text-gray-300 text-sm">+1 (555) 123-4567</p>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-sand)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-300 text-sm">info@unahotel.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-una-primary-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300 text-sm">
              © {currentYear} UNA Hotel. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link 
                to="/privacidad" 
                className="text-gray-300 hover:text-white transition-colors text-sm"
              >
                Política de Privacidad
              </Link>
              <Link 
                to="/terminos" 
                className="text-gray-300 hover:text-white transition-colors text-sm"
              >
                Términos de Uso
              </Link>
              <Link 
                to="/cookies" 
                className="text-gray-300 hover:text-white transition-colors text-sm"
              >
                Política de Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
