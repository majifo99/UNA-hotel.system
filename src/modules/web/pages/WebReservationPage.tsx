/**
 * Web Reservation Page - Public 3-Step Booking Flow
 * 
 * Multi-step reservation process for public website users.
 * 
 * AUTHENTICATION INTEGRATION:
 * - Uses authenticated user's id_cliente from Laravel Sanctum session
 * - No longer creates duplicate guest records
 * - Token stored in localStorage as 'authToken' (set by AuthService.login/register)
 * - useAuth() hook provides current user context (user.id === id_cliente from backend)
 * - API requests automatically include Bearer token via apiClient interceptors
 * 
 * FLOW:
 * 1. User must be logged in (ProtectedRoute ensures authentication)
 * 2. Step 1: Select dates and guest counts
 * 3. Step 2: Choose available rooms
 * 4. Step 3: Add special requests and services
 * 5. Submit: Creates reservation with authenticated user's id_cliente
 * 
 * BACKEND INTEGRATION:
 * - Endpoint: POST /api/reservas
 * - Payload includes: id_cliente (from auth user), habitaciones[], notas, id_fuente, id_estado_res
 * - Response returns created reservation with confirmation number
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { roomService } from '../../reservations/services/roomService';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { useCreateNewReservation } from '../../reservations/hooks/useReservationQueries';
import { useAuth } from '../hooks/useAuth.tsx';
import type { Room } from '../../../types/core';
import type { CreateReservationDto, CreateReservationRoomDto } from '../../reservations/types';
import { toast } from 'sonner';

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
  babies: number;
  
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
  selectedServices: Array<{ id_servicio: number; cantidad: number }>;
}

// Step-specific data types
interface StepOneData {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  babies: number;
}

interface StepTwoData {
  selectedRoomIds: string[];
}

interface StepThreeData {
  guestInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    nationalId: string;
  };
  specialRequests: string;
  selectedServices: Array<{ id_servicio: number; cantidad: number }>;
}

type StepData = StepOneData | StepTwoData | StepThreeData;

export function WebReservationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  
  // Pre-selected room from URL parameters
  const preSelectedRoomId = searchParams.get('room');
  
  // Pre-filled dates from URL (when coming from room detail page)
  const preFilledCheckIn = searchParams.get('checkIn');
  const preFilledCheckOut = searchParams.get('checkOut');
  
  // TanStack Query mutation for creating reservation
  const { mutate: createReservation, isPending: isCreating } = useCreateNewReservation();
  
  const [reservationData, setReservationData] = useState<ReservationData>({
    checkIn: preFilledCheckIn || '',
    checkOut: preFilledCheckOut || '',
    adults: 2,
    children: 0,
    babies: 0,
    selectedRoomIds: preSelectedRoomId ? [preSelectedRoomId] : [],
    guestInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      nationalId: ''
    },
    specialRequests: '',
    selectedServices: []
  });

  // Capacity warnings and messages
  const [capacityWarning, setCapacityWarning] = useState<string>('');
  const [showSpecialRequestsHint, setShowSpecialRequestsHint] = useState(false);

  // Auto-advance to step 2 if dates are pre-filled from URL
  useEffect(() => {
    if (preFilledCheckIn && preFilledCheckOut && currentStep === 1) {
      console.log('[WebReservationPage] Dates pre-filled from URL, advancing to room selection');
      // Small delay to ensure state is updated
      setTimeout(() => {
        setCurrentStep(2);
      }, 100);
    }
  }, [preFilledCheckIn, preFilledCheckOut, currentStep]);

  // Fetch available rooms when dates change
  useEffect(() => {
    const fetchAvailableRooms = async () => {
      if (!reservationData.checkIn || !reservationData.checkOut) {
        return;
      }

      try {
        const rooms = await roomService.getAvailableRooms(
          reservationData.checkIn,
          reservationData.checkOut,
          reservationData.adults + reservationData.children + reservationData.babies
        );
        setAvailableRooms(rooms);
      } catch (error) {
        console.error('Error fetching available rooms:', error);
        setAvailableRooms([]);
      }
    };

    fetchAvailableRooms();
  }, [reservationData.checkIn, reservationData.checkOut, reservationData.adults, reservationData.children, reservationData.babies]);

  // Check if current room selection can accommodate guests
  useEffect(() => {
    if (reservationData.selectedRoomIds.length > 0 && (reservationData.adults + reservationData.children + reservationData.babies) > 0) {
      const selectedRooms = availableRooms.filter((room: Room) => reservationData.selectedRoomIds.includes(room.id));
      const totalCapacity = selectedRooms.reduce((sum: number, room: Room) => sum + room.capacity, 0);
      const totalGuests = reservationData.adults + reservationData.children + reservationData.babies;
      
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
  }, [reservationData.selectedRoomIds, reservationData.adults, reservationData.children, reservationData.babies, availableRooms]);

  const updateReservationData = (updates: Partial<ReservationData>) => {
    setReservationData(prev => ({ ...prev, ...updates }));
  };

  const handleStepComplete = (stepData: StepData) => {
    switch (currentStep) {
      case 1: {
        const step1Data = stepData as StepOneData;
        updateReservationData({
          checkIn: step1Data.checkIn,
          checkOut: step1Data.checkOut,
          adults: step1Data.adults,
          children: step1Data.children,
          babies: step1Data.babies
        });
        setCurrentStep(2);
        break;
      }
      case 2: {
        const step2Data = stepData as StepTwoData;
        updateReservationData({
          selectedRoomIds: step2Data.selectedRoomIds
        });
        setCurrentStep(3);
        break;
      }
      case 3: {
        const step3Data = stepData as StepThreeData;
        // Submit reservation
        handleSubmitReservation({
          ...reservationData,
          guestInfo: step3Data.guestInfo,
          specialRequests: step3Data.specialRequests,
          selectedServices: step3Data.selectedServices
        });
        break;
      }
    }
  };

  const handleSubmitReservation = async (finalData: ReservationData) => {
    try {
      // Verify user is authenticated
      if (!user || !isAuthenticated) {
        toast.error('Sesión expirada', {
          description: 'Por favor inicie sesión nuevamente.',
          duration: 5000
        });
        navigate('/login');
        return;
      }

      // Use authenticated user's id_cliente
      const idCliente = Number(user.id);
      
      if (!idCliente || Number.isNaN(idCliente)) {
        toast.error('Error de autenticación', {
          description: 'No se pudo obtener la información del usuario. Por favor intente nuevamente.',
          duration: 5000
        });
        return;
      }
      
      console.log('[WebReservationPage] Creating reservation for authenticated user:', {
        userId: user.id,
        idCliente,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`
      });
      
      toast.info('Creando reserva...', { duration: 2000 });
      
      // Create the reservation with the authenticated user's id_cliente
      const habitaciones: CreateReservationRoomDto[] = finalData.selectedRoomIds.map(roomId => ({
        id_habitacion: Number(roomId),
        fecha_llegada: finalData.checkIn,
        fecha_salida: finalData.checkOut,
        adultos: finalData.adults,
        ninos: finalData.children,
        bebes: finalData.babies
      }));
      
      const reservationPayload: CreateReservationDto = {
        id_cliente: idCliente, // Use authenticated user's ID
        id_estado_res: 1, // Estado "Pendiente" o "Confirmada"
        id_fuente: 2, // Fuente "Sitio Web"
        notas: finalData.specialRequests || undefined,
        habitaciones
      };
      
      createReservation(reservationPayload, {
        onSuccess: (reservation) => {
          toast.success('¡Reserva creada exitosamente!', {
            description: `Reserva #${reservation.id} confirmada. Recibirá un email de confirmación.`,
            duration: 5000
          });
          navigate('/web/confirmation', {
            state: { reservation }
          });
        },
        onError: (error: unknown) => {
          console.error('Error creating reservation:', error);
          toast.error('Error al crear la reserva', {
            description: 'Por favor intente nuevamente o contacte con soporte.',
            duration: 5000
          });
        }
      });
      
    } catch (error: unknown) {
      console.error('Error preparing reservation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error('Error al preparar la reserva', {
        description: errorMessage,
        duration: 5000
      });
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
                children: reservationData.children,
                babies: reservationData.babies
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

          {currentStep === 3 && user && (
            <ReservationStepThree
              reservationData={reservationData}
              selectedRooms={availableRooms.filter((room: Room) => reservationData.selectedRoomIds.includes(room.id))}
              authenticatedUser={user}
              onComplete={handleStepComplete}
              onBack={goToPreviousStep}
              capacityWarning={capacityWarning}
              isSubmitting={isCreating}
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
