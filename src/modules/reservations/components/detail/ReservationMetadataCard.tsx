/**
 * Componente compartido: ReservationMetadataCard
 * Muestra metadatos de la reserva (ID, timestamps)
 */

import React from 'react';
import type { Reservation } from '../../types';

interface ReservationMetadataCardProps {
  reservation: Reservation;
}

export const ReservationMetadataCard: React.FC<ReservationMetadataCardProps> = ({ reservation }) => {
  return (
    <section className="border-t border-slate-200 pt-6">
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Metadatos</h4>
      <div className="space-y-2 text-xs text-slate-600">
        <div className="flex justify-between">
          <span>ID interno:</span>
          <span className="font-mono">{reservation.id}</span>
        </div>
        {reservation.createdAt && (
          <div className="flex justify-between">
            <span>Creada:</span>
            <span>{new Date(reservation.createdAt).toLocaleString('es-CR')}</span>
          </div>
        )}
        {reservation.updatedAt && (
          <div className="flex justify-between">
            <span>Última actualización:</span>
            <span>{new Date(reservation.updatedAt).toLocaleString('es-CR')}</span>
          </div>
        )}
      </div>
    </section>
  );
};
