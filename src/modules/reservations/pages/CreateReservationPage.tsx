import React from 'react';
import { CreateReservationForm } from '../components/CreateReservationForm';

/**
 * Create Reservation Page
 * 
 * Full-page layout for the reservation creation form.
 * Uses UNA Hotel design system for elegant and professional styling.
 */
export const CreateReservationPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Enhanced Page Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-white via-una-neutral-cream to-white rounded-2xl shadow-lg border border-una-bg-300">
        <div className="absolute inset-0 bg-gradient-to-br from-una-bg-100/30 to-transparent"></div>
        <div className="relative p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-una-primary-900 to-una-primary-600 bg-clip-text text-transparent mb-3">
                Nueva Reservación
              </h1>
              <p className="text-lg text-una-primary-600 max-w-2xl">
                Complete la información necesaria para crear una nueva reservación. 
                Nuestro sistema guiará el proceso paso a paso para garantizar una experiencia fluida.
              </p>
            </div>
            <div className="hidden lg:flex items-center justify-center w-20 h-20 bg-gradient-to-br from-una-accent-gold to-una-bg-400 rounded-2xl shadow-lg">
              <div className="text-2xl font-bold text-una-primary-900">📋</div>
            </div>
          </div>
          
          {/* Progress indicator - Optional enhancement */}
          <div className="flex items-center space-x-2 mt-6">
            <div className="w-3 h-3 bg-una-accent-gold rounded-full"></div>
            <div className="w-12 h-0.5 bg-gradient-to-r from-una-accent-gold to-una-primary-600"></div>
            <div className="w-3 h-3 bg-una-primary-600 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Enhanced Form Container */}
      <div className="bg-gradient-to-br from-white to-una-neutral-cream rounded-2xl shadow-xl border border-una-bg-300 overflow-hidden">
        <div className="bg-gradient-to-r from-una-primary-900 to-una-primary-800 p-2">
          <div className="w-full h-1 bg-gradient-to-r from-una-accent-gold via-una-bg-400 to-una-accent-gold rounded-full"></div>
        </div>
        <div className="p-8">
          <CreateReservationForm />
        </div>
      </div>
    </div>
  );
};
