/**
 * Web Reservation Page - Public 3-Step Booking Flow
 * 
 * Multi-step reservation process for public website users
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { roomsData } from '../../reservations/data/roomsData';
import { ProtectedRoute } from '../components/ProtectedRoute';

// Step Components
import { ReservationStepOne } from '../components/reservation/ReservationStepOne';
import { ReservationStepTwo } from '../components/reservation/ReservationStepTwo';
import { ReservationStepThree } from '../components/reservation/ReservationStepThree';

// Types for reservation flow
interface ReservationData {
  // Step 1: Dates and Guests
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  
  // Step 2: Room Selection
  selectedRoomIds: string[];
  
  // Step 3: Guest Info and Special Requests
  guestInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    nationalId: string;
  };
  specialRequests: string;
  additionalAmenities: string[];
}

export function WebReservationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  
  // Pre-selected room from URL parameters
  const preSelectedRoomId = searchParams.get('room');
  
  const [reservationData, setReservationData] = useState<ReservationData>({
    checkIn: '',
    checkOut: '',
    adults: 2,
    children: 0,
    selectedRoomIds: preSelectedRoomId ? [preSelectedRoomId] : [],
    guestInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      nationalId: ''
    },
    specialRequests: '',
    additionalAmenities: []
  });

  // Available rooms based on dates and filters
  const availableRooms = roomsData;
  
  // Capacity warnings and messages
  const [capacityWarning, setCapacityWarning] = useState<string>('');
  const [showSpecialRequestsHint, setShowSpecialRequestsHint] = useState(false);

  // Check if current room selection can accommodate guests
  useEffect(() => {
    if (reservationData.selectedRoomIds.length > 0 && (reservationData.adults + reservationData.children) > 0) {
      const selectedRooms = roomsData.filter(room => reservationData.selectedRoomIds.includes(room.id));
      const totalCapacity = selectedRooms.reduce((sum, room) => sum + room.capacity, 0);
      const totalGuests = reservationData.adults + reservationData.children;
      
      if (totalGuests > totalCapacity) {
        const shortage = totalGuests - totalCapacity;
        setCapacityWarning(`Su selección actual puede acomodar ${totalCapacity} personas, pero necesita espacio para ${totalGuests}. ` +
          `Faltan ${shortage} ${shortage === 1 ? 'espacio' : 'espacios'}.`);
        setShowSpecialRequestsHint(true);
      } else {
        setCapacityWarning('');
        setShowSpecialRequestsHint(false);
      }
    }
  }, [reservationData.selectedRoomIds, reservationData.adults, reservationData.children]);

  const updateReservationData = (updates: Partial<ReservationData>) => {
    setReservationData(prev => ({ ...prev, ...updates }));
  };

  const handleStepComplete = (stepData: any) => {
    switch (currentStep) {
      case 1:
        updateReservationData({
          checkIn: stepData.checkIn,
          checkOut: stepData.checkOut,
          adults: stepData.adults,
          children: stepData.children
        });
        setCurrentStep(2);
        break;
      case 2:
        updateReservationData({
          selectedRoomIds: stepData.selectedRoomIds
        });
        setCurrentStep(3);
        break;
      case 3:
        // Submit reservation
        handleSubmitReservation({
          ...reservationData,
          guestInfo: stepData.guestInfo,
          specialRequests: stepData.specialRequests,
          additionalAmenities: stepData.additionalAmenities
        });
        break;
    }
  };

  const handleSubmitReservation = async (finalData: ReservationData) => {
    try {
      // Here you would submit to your API
      console.log('Submitting reservation:', finalData);
      
      // For now, just show success message and redirect
      alert('¡Reserva creada exitosamente! Pronto recibirá un email de confirmación.');
      navigate('/mis-reservas');
    } catch (error) {
      console.error('Error creating reservation:', error);
      alert('Error al crear la reserva. Por favor intente de nuevo.');
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Fechas y Huéspedes';
      case 2: return 'Selección de Habitaciones';
      case 3: return 'Información Personal y Solicitudes';
      default: return '';
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 
                  ${step <= currentStep 
                    ? 'border-current text-white' 
                    : 'border-gray-300 text-gray-300'
                  }`}
                  style={{ 
                    backgroundColor: step <= currentStep ? 'var(--color-darkGreen1)' : 'transparent'
                  }}
                >
                  {step < currentStep ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className="text-sm font-semibold">{step}</span>
                  )}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 ${step < currentStep ? 'bg-current' : 'bg-gray-300'}`}
                    style={{ backgroundColor: step < currentStep ? 'var(--color-darkGreen1)' : undefined }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
          
          <h1 className="text-3xl font-bold text-center" style={{ color: 'var(--color-darkGreen1)' }}>
            {getStepTitle()}
          </h1>
          <p className="text-center text-gray-600 mt-2">
            Paso {currentStep} de 3
          </p>
        </div>

        {/* Capacity Warning */}
        {capacityWarning && (
          <div className="mb-6 p-4 border border-orange-200 bg-orange-50 rounded-lg">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-orange-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-orange-800 font-medium">Capacidad Excedida</h3>
                <p className="text-orange-700 text-sm mt-1">{capacityWarning}</p>
                {showSpecialRequestsHint && (
                  <p className="text-orange-600 text-sm mt-2 font-medium">
                    💡 Puede continuar con la reserva y solicitar camas extra, cunas, o otras acomodaciones en el paso de "Solicitudes Especiales".
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {currentStep === 1 && (
            <ReservationStepOne
              initialData={{
                checkIn: reservationData.checkIn,
                checkOut: reservationData.checkOut,
                adults: reservationData.adults,
                children: reservationData.children
              }}
              onComplete={handleStepComplete}
            />
          )}

          {currentStep === 2 && (
            <ReservationStepTwo
              checkIn={reservationData.checkIn}
              checkOut={reservationData.checkOut}
              adults={reservationData.adults}
              children={reservationData.children}
              availableRooms={availableRooms}
              preSelectedRoomIds={reservationData.selectedRoomIds}
              onComplete={handleStepComplete}
              onBack={goToPreviousStep}
              capacityWarning={capacityWarning}
              showSpecialRequestsHint={showSpecialRequestsHint}
            />
          )}

          {currentStep === 3 && (
            <ReservationStepThree
              reservationData={reservationData}
              selectedRooms={roomsData.filter(room => reservationData.selectedRoomIds.includes(room.id))}
              onComplete={handleStepComplete}
              onBack={goToPreviousStep}
              capacityWarning={capacityWarning}
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
