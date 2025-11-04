/**
 * EmptyState Component
 * 
 * Componente que muestra un estado vacío cuando no hay reservas.
 * Incluye ilustración, mensaje y call-to-action opcional.
 * 
 * Características:
 * - Ilustración amigable
 * - Mensaje personalizable
 * - Acción opcional (ej: crear nueva reserva)
 * - Diseño centrado y responsivo
 * 
 * @module components/web
 */

import React from 'react';
import { Calendar, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface EmptyStateProps {
  readonly title?: string;
  readonly message?: string;
  readonly actionLabel?: string;
  readonly actionLink?: string;
  readonly showAction?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No tienes reservas',
  message = 'Aún no has realizado ninguna reserva. ¡Comienza a planificar tu próxima estadía!',
  actionLabel = 'Nueva Reserva',
  actionLink = '/reservas/nueva',
  showAction = true
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="max-w-md text-center">
        {/* Ilustración */}
        <div className="mb-6 flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary-100 rounded-full blur-2xl opacity-60"></div>
            <div className="relative bg-gradient-to-br from-primary-50 to-primary-100 rounded-full p-8">
              <Calendar className="w-20 h-20 text-primary-600" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Texto */}
        <h3 className="text-2xl font-bold text-neutral-900 mb-3">
          {title}
        </h3>
        <p className="text-neutral-600 text-lg mb-8 leading-relaxed">
          {message}
        </p>

        {/* Acción */}
        {showAction && (
          <Link
            to={actionLink}
            className="inline-flex items-center px-6 py-3 text-base font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-md hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 transform hover:scale-105"
          >
            <Plus className="w-5 h-5 mr-2" />
            {actionLabel}
          </Link>
        )}

        {/* Mensaje adicional */}
        <p className="text-neutral-500 text-sm mt-6">
          ¿Tienes alguna pregunta? 
          <Link 
            to="/contacto" 
            className="text-primary-600 hover:text-primary-700 font-medium ml-1 underline"
          >
            Contáctanos
          </Link>
        </p>
      </div>
    </div>
  );
};
