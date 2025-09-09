/**
 * Home Page - Public Website
 * 
 * Main landing page for the public website with hero section and rooms showcase.
 */

import { Link } from 'react-router-dom';
import { RoomsSection } from '../components/RoomsSection';

// =================== COMPONENT ===================

export function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-r from-una-primary-900 to-una-primary-600">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Bienvenido a UNA Hotel
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-neutral-200">
            Experimenta la hospitalidad excepcional donde cada detalle está diseñado para crear momentos inolvidables
          </p>
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <Link
              to="/habitaciones"
              className="inline-block bg-una-accent-gold text-una-primary-900 px-8 py-3 rounded-md text-lg font-semibold hover:bg-una-accent-gold/90 transition-colors"
            >
              Ver Habitaciones
            </Link>
            <Link
              to="/reservar"
              className="inline-block bg-transparent border-2 border-white text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-white hover:text-una-primary-900 transition-colors"
            >
              Reservar Ahora
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Rooms - Using Dynamic Data */}
      <RoomsSection 
        title="Nuestras Habitaciones"
        subtitle="Descubre nuestras elegantes habitaciones diseñadas para tu comodidad y relajación"
        maxRooms={3}
        showViewAllButton={true}
      />

      {/* Services */}
      <section className="bg-una-bg-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-una-primary-900 mb-4">
              Nuestros Servicios
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Disfruta de una amplia gama de servicios diseñados para hacer tu estancia memorable
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Service 1 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--color-darkGreen1)' }}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Spa & Wellness</h3>
              <p className="text-neutral-600">Relájate en nuestro spa con tratamientos de lujo</p>
            </div>

            {/* Service 2 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--color-darkGreen1)' }}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Restaurante</h3>
              <p className="text-neutral-600">Cocina gourmet con ingredientes locales frescos</p>
            </div>

            {/* Service 3 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--color-darkGreen1)' }}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Centro de Negocios</h3>
              <p className="text-neutral-600">Instalaciones completas para reuniones y eventos</p>
            </div>

            {/* Service 4 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--color-darkGreen1)' }}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Concierge 24/7</h3>
              <p className="text-neutral-600">Asistencia personalizada las 24 horas del día</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ backgroundColor: 'var(--color-darkGreen1)' }} className="text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            ¿Listo para una experiencia inolvidable?
          </h2>
          <p className="text-xl mb-8 text-white">
            Reserva ahora y disfruta de nuestras ofertas especiales
          </p>
          <Link
            to="/reservar"
            style={{ backgroundColor: 'var(--color-sand)', color: 'var(--color-darkGreen1)' }}
            className="inline-block px-8 py-3 rounded-md text-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Reservar Ahora
          </Link>
        </div>
      </section>
    </div>
  );
}
