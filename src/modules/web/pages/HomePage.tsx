/**
 * Home Page - Public Website
 * 
 * Main landing page for the public website with hero section and rooms showcase.
 * Features Lanaku Hotel - "Un Hogar para Descansar y Disfrutar"
 */

import { Link } from 'react-router-dom';
import { RoomsSection } from '../components/RoomsSection';

// =================== COMPONENT ===================

export function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section 
        className="relative h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/src/assets/Playa.webp')`
        }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Lanaku: Un Hogar para Descansar y Disfrutar
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-neutral-200">
            En nuestro hotel, nos enorgullecemos de ofrecer un espacio acogedor y cálido que se sienta como un verdadero hogar para nuestros huéspedes
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

      {/* About Lanaku Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-una-primary-900 mb-6">
                Un Refugio en el Corazón de Nicoya
              </h2>
              <div className="space-y-4 text-lg text-neutral-700">
                <p>
                  La palabra <strong>"Lanaku"</strong>, de origen Chorotega, significa <em>"casa u hogar"</em>, 
                  y es precisamente eso lo que buscamos crear para cada persona que se hospeda con nosotros.
                </p>
                <p>
                  Nuestro hotel Lanaku es un oasis de tranquilidad y confort, donde podrás relajarte 
                  y disfrutar de la hospitalidad de nuestra región. Con habitaciones diseñadas para 
                  ofrecer comodidad y descanso, nuestro hotel es el lugar perfecto para escapar del 
                  estrés diario y recargar energías.
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <img 
                src="/src/assets/Lanaku.png" 
                alt="Logo Hotel Lanaku" 
                className="max-w-md w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="py-16 bg-una-bg-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-una-primary-900 mb-4">
              Experiencias que te Harán Sentir en Casa
            </h2>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
              En Lanaku, nos esforzamos por crear experiencias que te hagan sentir como en casa. 
              Desde nuestra deliciosa cocina local hasta nuestras actividades y servicios diseñados 
              para que disfrutes al máximo de tu estancia, cada detalle está pensado para que te 
              sientas acogido y atendido.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Experience 1 */}
            <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--color-darkGreen1)' }}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">Ambiente Hogareño</h3>
              <p className="text-neutral-600 text-center">
                Cada rincón de nuestro hotel está diseñado para hacerte sentir como en tu propio hogar
              </p>
            </div>

            {/* Experience 2 */}
            <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--color-darkGreen1)' }}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">Hospitalidad Chorotega</h3>
              <p className="text-neutral-600 text-center">
                Disfruta de la calidez y tradición de nuestra cultura local en cada servicio
              </p>
            </div>

            {/* Experience 3 */}
            <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--color-darkGreen1)' }}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">Cocina Local</h3>
              <p className="text-neutral-600 text-center">
                Saborea auténticos platillos locales preparados con ingredientes frescos de la región
              </p>
            </div>
          </div>
        </div>
      </section>

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
            Ven y Vive la Experiencia Lanaku
          </h2>
          <p className="text-xl mb-8 text-white">
            ¿Estás listo para sentirte en casa en nuestro hotel Lanaku? ¡Ven y descubre por qué 
            somos el lugar perfecto para descansar y disfrutar!
          </p>
          <Link
            to="/reservar"
            style={{ backgroundColor: 'var(--color-sand)', color: 'var(--color-darkGreen1)' }}
            className="inline-block px-8 py-3 rounded-md text-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Reserva Ahora y Experimenta la Calidez de Nuestro Hogar
          </Link>
        </div>
      </section>
    </div>
  );
}
