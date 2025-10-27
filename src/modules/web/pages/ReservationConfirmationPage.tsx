/**
 * Reservation Confirmation Page
 * 
 * Displays successful reservation details with options to:
 * - Print the confirmation
 * - Download as PDF
 * - Return to home page
 */

import { useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import type { Reservation } from '../../reservations/types';
import { formatCurrency } from '../utils/currency';

export function ReservationConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);
  
  // Get reservation from navigation state
  const reservation = location.state?.reservation as Reservation | undefined;

  useEffect(() => {
    // If no reservation data, redirect to home
    if (!reservation) {
      navigate('/web');
    }
  }, [reservation, navigate]);

  if (!reservation) {
    return null;
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate nights
  const calculateNights = () => {
    const checkIn = new Date(reservation.checkInDate);
    const checkOut = new Date(reservation.checkOutDate);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Print handler
  const handlePrint = () => {
    globalThis.print();
  };

  // Download PDF handler (uses browser's print to PDF)
  const handleDownloadPDF = () => {
    // Trigger print dialog - user can choose "Save as PDF"
    globalThis.print();
  };

  const nights = calculateNights();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Action buttons - Hidden when printing */}
        <div className="flex justify-between items-center mb-6 print:hidden">
          <Link 
            to="/web" 
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al inicio
          </Link>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Imprimir
            </button>
            
            <button
              type="button"
              onClick={handleDownloadPDF}
              className="px-4 py-2 text-white rounded-lg hover:opacity-90 flex items-center gap-2"
              style={{ backgroundColor: 'var(--color-darkGreen1)' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Descargar PDF
            </button>
          </div>
        </div>

        {/* Printable confirmation */}
        <div ref={printRef} className="bg-white rounded-lg shadow-lg p-8 print:shadow-none">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4 print:mb-2">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2 print:text-2xl">
              ¡Reserva Confirmada!
            </h1>
            <p className="text-gray-600 print:text-sm">
              Su reserva ha sido procesada exitosamente
            </p>
          </div>

          {/* Confirmation Number */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6 print:p-4 print:mb-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Número de confirmación</p>
              <p className="text-3xl font-bold text-gray-900 print:text-2xl">
                #{reservation.confirmationNumber || reservation.id}
              </p>
            </div>
          </div>

          {/* Guest Information */}
          <div className="border-t border-gray-200 pt-6 mb-6 print:pt-4 print:mb-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 print:text-lg">
              Información del Huésped
            </h2>
            <div className="grid grid-cols-2 gap-4 print:gap-2 print:text-sm">
              <div>
                <p className="text-sm text-gray-600">Nombre completo</p>
                <p className="font-medium text-gray-900">
                  {reservation.guest?.firstName || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{reservation.guest?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Teléfono</p>
                <p className="font-medium text-gray-900">{reservation.guest?.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Nacionalidad</p>
                <p className="font-medium text-gray-900">{reservation.guest?.nationality || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Reservation Details */}
          <div className="border-t border-gray-200 pt-6 mb-6 print:pt-4 print:mb-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 print:text-lg">
              Detalles de la Reserva
            </h2>
            
            {/* Dates */}
            <div className="grid md:grid-cols-3 gap-4 mb-6 print:gap-2 print:mb-4">
              <div className="bg-gray-50 rounded-lg p-4 print:p-2">
                <p className="text-sm text-gray-600 mb-1">Check-in</p>
                <p className="font-semibold text-gray-900 print:text-sm">
                  {formatDate(reservation.checkInDate)}
                </p>
                <p className="text-xs text-gray-500 mt-1">A partir de las 15:00</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 print:p-2">
                <p className="text-sm text-gray-600 mb-1">Check-out</p>
                <p className="font-semibold text-gray-900 print:text-sm">
                  {formatDate(reservation.checkOutDate)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Hasta las 12:00</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 print:p-2">
                <p className="text-sm text-gray-600 mb-1">Duración</p>
                <p className="font-semibold text-gray-900 print:text-sm">
                  {nights} {nights === 1 ? 'noche' : 'noches'}
                </p>
              </div>
            </div>

            {/* Room Information */}
            <div className="space-y-4 print:space-y-2">
              <div>
                <p className="text-sm text-gray-600 mb-2">Habitación</p>
                <div className="bg-gray-50 rounded-lg p-4 print:p-2">
                  <p className="font-semibold text-gray-900">{reservation.room?.name || `Habitación #${reservation.roomId}`}</p>
                  <div className="flex gap-6 mt-2 text-sm text-gray-600 print:text-xs">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>{reservation.numberOfAdults} adulto{reservation.numberOfAdults === 1 ? '' : 's'}</span>
                    </div>
                    {reservation.numberOfChildren > 0 && (
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>{reservation.numberOfChildren} niño{reservation.numberOfChildren === 1 ? '' : 's'}</span>
                      </div>
                    )}
                    {reservation.numberOfInfants > 0 && (
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>{reservation.numberOfInfants} bebé{reservation.numberOfInfants === 1 ? '' : 's'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              {reservation.specialRequests && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Solicitudes especiales</p>
                  <div className="bg-gray-50 rounded-lg p-4 print:p-2">
                    <p className="text-gray-700 print:text-sm">{reservation.specialRequests}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pricing Summary */}
          {reservation.total > 0 && (
            <div className="border-t border-gray-200 pt-6 mb-6 print:pt-4 print:mb-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 print:text-lg">
                Resumen de Costos
              </h2>
              <div className="bg-gray-50 rounded-lg p-4 print:p-2">
                <div className="space-y-2 print:space-y-1">
                  <div className="flex justify-between text-gray-700 print:text-sm">
                    <span>Habitación ({nights} {nights === 1 ? 'noche' : 'noches'})</span>
                    <span>{formatCurrency(reservation.subtotal)}</span>
                  </div>
                  {reservation.servicesTotal > 0 && (
                    <div className="flex justify-between text-gray-700 print:text-sm">
                      <span>Servicios adicionales</span>
                      <span>{formatCurrency(reservation.servicesTotal)}</span>
                    </div>
                  )}
                  {reservation.taxes > 0 && (
                    <div className="flex justify-between text-gray-700 print:text-sm">
                      <span>Impuestos</span>
                      <span>{formatCurrency(reservation.taxes)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-300 pt-2 mt-2 print:pt-1 print:mt-1">
                    <div className="flex justify-between font-bold text-lg text-gray-900 print:text-base">
                      <span>Total</span>
                      <span>{formatCurrency(reservation.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Important Information */}
          <div className="border-t border-gray-200 pt-6 print:pt-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 print:text-lg">
              Información Importante
            </h2>
            <div className="space-y-3 text-sm text-gray-600 print:text-xs print:space-y-2">
              <div className="flex gap-2">
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0 print:w-4 print:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>Se ha enviado un email de confirmación a <strong>{reservation.guest?.email}</strong></p>
              </div>
              <div className="flex gap-2">
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0 print:w-4 print:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>El check-in es a partir de las 15:00 horas y el check-out hasta las 12:00 horas</p>
              </div>
              <div className="flex gap-2">
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0 print:w-4 print:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>Por favor, presente este número de confirmación al momento del check-in</p>
              </div>
              <div className="flex gap-2">
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0 print:w-4 print:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <p>Para cualquier consulta o modificación, contáctenos al (506) 2440-1000</p>
              </div>
            </div>
          </div>

          {/* Footer - Only visible when printing */}
          <div className="hidden print:block mt-8 pt-6 border-t border-gray-200">
            <div className="text-center text-xs text-gray-500">
              <p>Hotel UNA - Sistema de Reservaciones</p>
              <p>Impreso el {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })} a las {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        </div>

        {/* Additional Actions - Hidden when printing */}
        <div className="mt-6 text-center print:hidden">
          <Link 
            to="/web" 
            className="inline-block px-6 py-3 text-white rounded-lg hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'var(--color-darkGreen1)' }}
          >
            Volver al sitio principal
          </Link>
        </div>
      </div>
    </div>
  );
}
