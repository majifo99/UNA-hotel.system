import React from 'react';
import { CreateReservationForm } from '../components/CreateReservationForm';

/**
 * Create Reservation Page
 * 
 * Full-page layout for the reservation creation form.
 */
export const CreateReservationPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <CreateReservationForm />
    </div>
  );
};
