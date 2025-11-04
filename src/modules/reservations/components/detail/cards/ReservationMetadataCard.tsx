/**
 * Componente compartido: ReservationMetadataCard
 * Muestra metadatos de la reserva (código, ID, timestamps, fuente)
 */

import React from 'react';
import { Hash, Calendar, Clock, Globe } from 'lucide-react';
import type { Reservation } from '../../../types';

interface ReservationMetadataCardProps {
  reservation: Reservation;
}

export const ReservationMetadataCard: React.FC<ReservationMetadataCardProps> = ({ reservation }) => {
  return (
    <section className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-sm">
      <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-[#304D3C] flex items-center gap-2">
        <Hash className="h-4 w-4" />
        Información del Sistema
      </h4>
      
      <div className="space-y-4">
        {/* Código de reserva destacado */}
        <div className="bg-gradient-to-r from-[#304D3C]/5 to-[#3d6149]/5 border border-[#304D3C]/20 rounded-xl p-4">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 block mb-2">
            Código de Reserva
          </span>
          <span className="font-mono font-bold text-[#304D3C] text-2xl tracking-wider">
            {reservation.confirmationNumber}
          </span>
        </div>

        {/* Detalles en grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <Hash className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">ID Interno</span>
            </div>
            <span className="font-mono font-semibold text-slate-800">#{reservation.id}</span>
          </div>

          {reservation.source && (
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Globe className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">Fuente</span>
              </div>
              <span className="font-semibold text-slate-800 capitalize">{reservation.source}</span>
            </div>
          )}
        </div>

        {/* Timestamps */}
        <div className="space-y-3 text-xs">
          {reservation.createdAt && (
            <div className="flex items-start gap-2">
              <Calendar className="h-3.5 w-3.5 text-emerald-600 mt-0.5" />
              <div className="flex-1">
                <span className="text-slate-500">Creada:</span>
                <span className="ml-2 font-medium text-slate-800">
                  {new Date(reservation.createdAt).toLocaleString('es-CR', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })}
                </span>
              </div>
            </div>
          )}
          {reservation.updatedAt && (
            <div className="flex items-start gap-2">
              <Clock className="h-3.5 w-3.5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <span className="text-slate-500">Última actualización:</span>
                <span className="ml-2 font-medium text-slate-800">
                  {new Date(reservation.updatedAt).toLocaleString('es-CR', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
