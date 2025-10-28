import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Home, Users, MessageSquare, Loader2, Star, AlertTriangle, CheckCircle, Info, Search, X, Calendar, TrendingDown } from 'lucide-react';
import { useModificacionReserva } from '../hooks/useModificacionReserva';
import { useRoomSelection } from '../hooks/useRoomSelection';
import { useInputValidation } from '../../../hooks/useInputValidation';
import { useReservationByCode } from '../../reservations/hooks/useReservationQueries';
import { ROUTES } from '../../../router/routes';
import FrontdeskService from '../services/frontdeskService';
import RoomChangeResultModal from './modals/RoomChangeResultModal';
import DateModification from './DateModification';
import ReduceStay from './ReduceStay';
import type { RoomChangeReason } from '../types/roomChange';
import type { RoomInfo } from '../types/room';
import type { CambiarHabitacionResponse } from '../services/ModificacionReservaService';

// Interfaces para el sistema de recomendaciones inteligente
interface RoomRecommendation extends RoomInfo {
  recommendationScore: number;
  recommendationReasons: RecommendationReason[];
  suitabilityLevel: 'perfect' | 'good' | 'acceptable' | 'problematic';
  issues: RoomIssue[];
}

interface RecommendationReason {
  type: 'capacity_match' | 'same_type' | 'same_floor' | 'upgrade' | 'downgrade' | 'available';
  description: string;
  score: number;
}

interface RoomIssue {
  type: 'over_capacity' | 'under_capacity' | 'occupied' | 'maintenance' | 'type_mismatch';
  severity: 'error' | 'warning' | 'info';
  description: string;
}

interface ReservationRoomInfo {
  currentRooms: string[];
  totalCapacity: number;
  roomTypes: string[];
  totalGuests: number;
  multipleRooms: boolean;
}

// Helper functions to replace nested ternary operations
const getSuitabilityBorderClass = (suitabilityLevel: string, isSelected: boolean): string => {
  if (isSelected) return 'border-blue-500 bg-blue-100';
  if (suitabilityLevel === 'perfect') return 'border-green-300 bg-green-50 hover:border-green-400';
  if (suitabilityLevel === 'good') return 'border-blue-300 bg-blue-50 hover:border-blue-400';
  if (suitabilityLevel === 'acceptable') return 'border-yellow-300 bg-yellow-50 hover:border-yellow-400';
  return 'border-red-300 bg-red-50 hover:border-red-400';
};

const getStatusTextClass = (status: string): string => {
  if (status === 'available') return 'text-green-600';
  if (status === 'occupied') return 'text-red-600';
  return 'text-yellow-600';
};

const getStatusText = (status: string): string => {
  if (status === 'available') return 'Disponible';
  if (status === 'occupied') return 'Ocupada';
  if (status === 'maintenance') return 'Mantenimiento';
  return 'Reservada';
};

const getSuitabilityClass = (suitabilityLevel: string): string => {
  if (suitabilityLevel === 'perfect') return 'bg-green-100 text-green-800';
  if (suitabilityLevel === 'good') return 'bg-blue-100 text-blue-800';
  if (suitabilityLevel === 'acceptable') return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

const getSuitabilityText = (suitabilityLevel: string): string => {
  if (suitabilityLevel === 'perfect') return '⭐ Perfecta';
  if (suitabilityLevel === 'good') return '👍 Muy Buena';
  if (suitabilityLevel === 'acceptable') return '✅ Aceptable';
  return '⚠️ Problemática';
};

const getSuitabilityShortText = (suitabilityLevel: string): string => {
  if (suitabilityLevel === 'perfect') return 'Perfecta';
  if (suitabilityLevel === 'good') return 'Muy Buena';
  if (suitabilityLevel === 'acceptable') return 'Aceptable';
  return 'Problemática';
};

const getIssueSeverityClass = (severity: string): string => {
  if (severity === 'error') return 'bg-red-100 text-red-700';
  if (severity === 'warning') return 'bg-yellow-100 text-yellow-700';
  return 'bg-blue-100 text-blue-700';
};

// Type for room data from API
interface RoomData {
  id: string;
  number?: string;
  type: string;
  capacity: number;
  floor?: number;
  status?: string;
  amenities: string[];
  pricePerNight: number;
}

interface RoomAssignment {
  roomId: string;
  roomNumber: string;
  guestName: string;
  reservationId: string;
  checkInDate: string;
  checkOutDate: string;
}

// Helper function to map room data to RoomInfo
const mapRoomToRoomInfo = (room: RoomData, assignments: RoomAssignment[]): RoomInfo => {
  const assignment = assignments.find(a => a.roomId === room.id || a.roomNumber === (room.number || room.id));

  // Extract nested ternary operation into independent statement
  const mapRoomStatus = (roomStatus?: string): 'maintenance' | 'occupied' | 'available' | 'reserved' => {
    if (roomStatus === 'available') return 'available';
    if (roomStatus === 'occupied') return 'occupied';
    if (roomStatus === 'maintenance') return 'maintenance';
    return 'reserved';
  };

  return {
    number: room.number || room.id,
    type: room.type,
    capacity: {
      adults: Math.floor(room.capacity * 0.7),
      children: Math.floor(room.capacity * 0.3),
      total: room.capacity
    },
    floor: room.floor || 1,
    status: assignment ? 'occupied' : mapRoomStatus(room.status),
    amenities: room.amenities,
    price: { base: room.pricePerNight, currency: 'USD' },
    features: {
      hasBalcony: false,
      hasSeaView: false,
      hasKitchen: room.amenities.includes('kitchen'),
      smokingAllowed: false
    },
    guestName: assignment?.guestName
  };
};

type LocalState = {
  currentRoomNumber: string;
  newRoomId: number | '';
  changeDate: string;
  adultos: number;
  ninos: number;
  bebes: number;
  reason: RoomChangeReason | '';
  motivo: string;
  observaciones: string;
  guestName: string;
  reservationId: string;
  reservationSearchId: string; // Para búsqueda directa por ID
  idReservaHabitacion: number | null; // ID de la reserva_habitacion actual
};

const RoomChange = () => {
  const navigate = useNavigate();
  
  // Estado para las pestañas
  const [activeTab, setActiveTab] = useState<'room-change' | 'date-modification' | 'reduce-stay'>('room-change');
  const { cambiarHabitacion, isCambiandoHabitacion, error } = useModificacionReserva();
  const { searchRooms } = useRoomSelection();
  useInputValidation();

  const [allRooms, setAllRooms] = useState<RoomInfo[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  
  // Estados para búsqueda directa por ID de reserva
  const [reservationSearchId, setReservationSearchId] = useState<string>('');
  const [hasLoadedReservationData, setHasLoadedReservationData] = useState(false);

  // Estado para el modal de resultado
  const [showResultModal, setShowResultModal] = useState(false);
  const [changeResult, setChangeResult] = useState<CambiarHabitacionResponse | null>(null);

  // Hook para búsqueda directa de reserva por CÓDIGO DE RESERVA (igual que en CheckIn)
  const { 
    data: foundReservation, 
    isLoading: isLoadingReservation, 
    isError: isReservationError,
    error: reservationError 
  } = useReservationByCode(reservationSearchId, !!reservationSearchId);

  const [formData, setFormData] = useState<LocalState>({
    currentRoomNumber: '',
    newRoomId: '',
    changeDate: new Date().toISOString().split('T')[0],
    adultos: 2,
    ninos: 0,
    bebes: 0,
    reason: '',
    motivo: '',
    observaciones: '',
    guestName: '',
    reservationId: '',
    reservationSearchId: '', // Nuevo campo para búsqueda directa
    idReservaHabitacion: null, // ID de la reserva_habitacion
  });

  // Define helper functions before useCallback
  const getCurrentRoomFloor = useCallback((currentRooms: string[]): number | null => {
    if (currentRooms.length === 0) return null;
    // Asumimos que el primer dígito del número de habitación indica el piso
    const roomNumber = currentRooms[0];
    const floor = Number.parseInt(roomNumber.charAt(0)) || 1;
    return floor;
  }, []);

  const calculateRecommendationScore = useCallback((
    recommendation: RoomRecommendation, 
    reservationInfo: ReservationRoomInfo, 
    totalGuests: number
  ) => {
    let score = 0;
    const reasons: RecommendationReason[] = [];

    // Puntuación por disponibilidad (crítico)
    if (recommendation.status === 'available') {
      score += 50;
      reasons.push({
        type: 'available',
        description: 'Habitación disponible',
        score: 50
      });
    } else if (recommendation.status === 'occupied') {
      score -= 100; // Penalización severa
    }

    // Puntuación por capacidad adecuada
    const capacityDiff = recommendation.capacity.total - totalGuests;
    if (capacityDiff >= 0 && capacityDiff <= 2) {
      score += 30; // Capacidad perfecta o ligeramente mayor
      reasons.push({
        type: 'capacity_match',
        description: `Capacidad ideal (${recommendation.capacity.total} personas)`,
        score: 30
      });
    } else if (capacityDiff > 2) {
      score += 15; // Capacidad mayor pero aceptable
      reasons.push({
        type: 'upgrade',
        description: `Habitación más amplia (${recommendation.capacity.total} personas)`,
        score: 15
      });
    } else {
      score -= 50; // Capacidad insuficiente
    }

    // Puntuación por tipo de habitación similar
    if (reservationInfo.roomTypes.includes(recommendation.type)) {
      score += 20;
      reasons.push({
        type: 'same_type',
        description: `Mismo tipo de habitación (${recommendation.type})`,
        score: 20
      });
    }

    // Puntuación por piso (preferencia por mismo piso)
    const currentRoomFloor = getCurrentRoomFloor(reservationInfo.currentRooms);
    if (currentRoomFloor && recommendation.floor === currentRoomFloor) {
      score += 10;
      reasons.push({
        type: 'same_floor',
        description: `Mismo piso (Piso ${recommendation.floor})`,
        score: 10
      });
    }

    // Bonus por amenidades especiales
    if (recommendation.amenities.length > 0) {
      score += Math.min(recommendation.amenities.length * 2, 10);
    }

    recommendation.recommendationScore = Math.max(0, score);
    recommendation.recommendationReasons = reasons;
  }, [getCurrentRoomFloor]);

  const determineSuitabilityLevel = useCallback((recommendation: RoomRecommendation, totalGuests: number) => {
    if (recommendation.status !== 'available') {
      recommendation.suitabilityLevel = 'problematic';
    } else if (recommendation.capacity.total < totalGuests) {
      recommendation.suitabilityLevel = 'problematic';
    } else if (recommendation.recommendationScore >= 80) {
      recommendation.suitabilityLevel = 'perfect';
    } else if (recommendation.recommendationScore >= 60) {
      recommendation.suitabilityLevel = 'good';
    } else if (recommendation.recommendationScore >= 40) {
      recommendation.suitabilityLevel = 'acceptable';
    } else {
      recommendation.suitabilityLevel = 'problematic';
    }
  }, []);

  const identifyRoomIssues = useCallback((recommendation: RoomRecommendation, totalGuests: number) => {
    const issues: RoomIssue[] = [];

    if (recommendation.status === 'occupied') {
      issues.push({
        type: 'occupied',
        severity: 'error',
        description: `Ocupada por ${recommendation.guestName || 'otro huésped'}`
      });
    }

    if (recommendation.status === 'maintenance') {
      issues.push({
        type: 'maintenance',
        severity: 'error',
        description: 'Habitación en mantenimiento'
      });
    }

    if (recommendation.capacity.total < totalGuests) {
      issues.push({
        type: 'over_capacity',
        severity: 'error',
        description: `Insuficiente para ${totalGuests} huéspedes (capacidad: ${recommendation.capacity.total})`
      });
    } else if (recommendation.capacity.total > totalGuests + 3) {
      issues.push({
        type: 'under_capacity',
        severity: 'warning',
        description: `Habitación muy grande para ${totalGuests} huéspedes`
      });
    }

    recommendation.issues = issues;
  }, []);

  // Sistema de recomendaciones inteligente
  const generateRecommendations = useCallback((
    allRooms: RoomInfo[], 
    reservationInfo: ReservationRoomInfo, 
    totalGuests: number
  ): RoomRecommendation[] => {
    return allRooms.map(room => {
      const recommendation: RoomRecommendation = {
        ...room,
        recommendationScore: 0,
        recommendationReasons: [],
        suitabilityLevel: 'acceptable',
        issues: []
      };

      calculateRecommendationScore(recommendation, reservationInfo, totalGuests);
      determineSuitabilityLevel(recommendation, totalGuests);
      identifyRoomIssues(recommendation, totalGuests);

      return recommendation;
    }).sort((a, b) => b.recommendationScore - a.recommendationScore);
  }, [calculateRecommendationScore, determineSuitabilityLevel, identifyRoomIssues]);

  const getReservationRoomInfo = useCallback((reservation: { 
    room?: { number?: string; capacity?: number; type?: string };
    numberOfAdults?: number;
    numberOfChildren?: number;
    numberOfInfants?: number;
  } | null): ReservationRoomInfo => {
    if (!reservation) {
      return {
        currentRooms: [],
        totalCapacity: 0,
        roomTypes: [],
        totalGuests: formData.adultos + formData.ninos + formData.bebes,
        multipleRooms: false
      };
    }

    return {
      currentRooms: reservation.room?.number ? [reservation.room.number] : [],
      totalCapacity: reservation.room?.capacity || 0,
      roomTypes: reservation.room?.type ? [reservation.room.type] : [],
      totalGuests: (reservation.numberOfAdults || 0) + (reservation.numberOfChildren || 0) + (reservation.numberOfInfants || 0),
      multipleRooms: false // Podríamos expandir esto para múltiples habitaciones
    };
  }, [formData.adultos, formData.ninos, formData.bebes]);

  // Generar recomendaciones cuando cambien los datos relevantes
  const roomRecommendations = useMemo(() => {
    if (!foundReservation || allRooms.length === 0) return [];
    
    const reservationInfo = getReservationRoomInfo(foundReservation);
    const totalGuests = formData.adultos + formData.ninos + formData.bebes;
    
    return generateRecommendations(allRooms, reservationInfo, totalGuests);
  }, [allRooms, foundReservation, formData.adultos, formData.ninos, formData.bebes, generateRecommendations, getReservationRoomInfo]);

  // Load all rooms on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load rooms
        setIsLoadingRooms(true);
        const rooms = await FrontdeskService.getRooms();
        const roomInfos: RoomInfo[] = rooms.map(room => mapRoomToRoomInfo(room, []));
        setAllRooms(roomInfos);

      } catch (error) {
        console.error('Error loading data:', error);
        setAllRooms([]);
      } finally {
        setIsLoadingRooms(false);
      }
    };
    loadData();
  }, []);

  // Efecto para autorellenar datos cuando se encuentra una reserva por ID (igual que en CheckIn)
  useEffect(() => {
    if (foundReservation && !hasLoadedReservationData) {
      console.log('📋 Autofilling from reservation by ID:', foundReservation);
      
      // Autorellenar datos del huésped si existen
      if (foundReservation.guest) {
        const guest = foundReservation.guest;
        const fullLastName = guest.secondLastName 
          ? `${guest.firstLastName} ${guest.secondLastName}`
          : guest.firstLastName;
        
        const fullName = `${guest.firstName} ${fullLastName}`.trim();
        
        // Extraer id_reserva_habitacion de la respuesta
        const idReservaHab = (foundReservation as { idReservaHabitacion?: number }).idReservaHabitacion || null;
        
        console.log('📌 ID Reserva Habitación:', idReservaHab);
        
        setFormData(prev => ({
          ...prev,
          guestName: fullName,
          reservationId: foundReservation.id,
          currentRoomNumber: foundReservation.room?.number || prev.currentRoomNumber,
          adultos: foundReservation.numberOfAdults || prev.adultos,
          ninos: foundReservation.numberOfChildren || prev.ninos,
          bebes: foundReservation.numberOfInfants || prev.bebes,
          idReservaHabitacion: idReservaHab,
        }));
      }
      
      setHasLoadedReservationData(true);
    }
  }, [foundReservation, hasLoadedReservationData]);

  // Resetear datos cargados cuando se limpia la búsqueda
  useEffect(() => {
    if (!reservationSearchId) {
      setHasLoadedReservationData(false);
    }
  }, [reservationSearchId]);

  // Load available rooms when guest count changes
  useEffect(() => {
    if (!isLoadingRooms) {
      searchRooms({ guests: formData.adultos + formData.ninos + formData.bebes });
    }
  }, [searchRooms, formData.adultos, formData.ninos, formData.bebes, isLoadingRooms]);

  // Función para buscar reserva por ID (igual que en CheckIn)
  const handleSearchReservation = () => {
    if (formData.reservationSearchId.trim()) {
      setReservationSearchId(formData.reservationSearchId.trim());
      setHasLoadedReservationData(false);
    }
  };

  // Función para limpiar búsqueda de reserva
  const handleClearReservation = () => {
    setFormData(prev => ({
      ...prev,
      reservationSearchId: '',
      reservationId: '',
      guestName: '',
      currentRoomNumber: '',
    }));
    setReservationSearchId('');
    setHasLoadedReservationData(false);
  };

  // Opciones de motivos de cambio
  const changeReasons = [
    { value: 'guest_request', label: 'Solicitud del huésped' },
    { value: 'maintenance', label: 'Mantenimiento de habitación' },
    { value: 'upgrade', label: 'Upgrade de habitación' },
    { value: 'downgrade', label: 'Downgrade por disponibilidad' },
    { value: 'noise_complaint', label: 'Queja por ruido' },
    { value: 'room_issue', label: 'Problema con la habitación' },
    { value: 'preference', label: 'Preferencia del huésped' },
    { value: 'other', label: 'Otro motivo' },
  ] as const;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones previas
    if (!formData.newRoomId) {
      console.error('❌ No se ha seleccionado una habitación');
      return;
    }

    if (!formData.reservationId) {
      console.error('❌ No se ha seleccionado una reserva');
      return;
    }

    if (!formData.idReservaHabitacion) {
      console.error('⚠️ No se encontró el ID de reserva_habitacion. Usando método alternativo.');
      // En este caso, necesitarás obtener el id_reserva_habitacion del backend primero
      // o asumir que es la primera habitación de la reserva
    }

    // Determinar el motivo final
    const motivoFinal = formData.reason === 'other' 
      ? formData.motivo 
      : changeReasons.find(r => r.value === formData.reason)?.label || formData.motivo;

    console.log('🔄 Iniciando cambio de habitación:', {
      idReserva: formData.reservationId,
      idReservaHabitacion: formData.idReservaHabitacion,
      idHabitacionNueva: formData.newRoomId,
      motivo: motivoFinal
    });

    // Llamar al servicio de modificación
    const result = await cambiarHabitacion(
      formData.reservationId,
      formData.idReservaHabitacion || Number.parseInt(formData.reservationId), // Fallback temporal
      formData.newRoomId,
      motivoFinal
    );

    if (result) {
      console.log('✅ Cambio de habitación exitoso:', result);
      
      // Mostrar modal de resultado
      setChangeResult(result);
      setShowResultModal(true);
    } else {
      console.error('❌ Error: No se recibió respuesta del servidor');
    }
  };

  // Función para cerrar el modal y navegar al dashboard
  const handleCloseResultModal = () => {
    setShowResultModal(false);
    navigate(ROUTES.FRONTDESK.BASE);
  };

  const totalGuests = formData.adultos + formData.ninos + formData.bebes;
  const selectedRoom = allRooms.find(room => room.number === formData.newRoomId);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="relative flex items-center justify-center mb-8">
            <div className="flex items-center gap-3">
              {isLoadingRooms ? (
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              ) : (
                <RefreshCw className="w-8 h-8 text-blue-600" />
              )}
              <h1 className="text-3xl font-bold text-gray-900">Modificación de Reservas</h1>
            </div>
            
            <button
              type="button"
              onClick={() => navigate(ROUTES.FRONTDESK.BASE)}
              className="absolute left-0 flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              title="Regresar al Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Regresar</span>
            </button>
          </div>

          {/* Pestañas de Navegación */}
          <div className="flex gap-2 border-b border-gray-200 mb-6">
            <button
              type="button"
              onClick={() => setActiveTab('room-change')}
              className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'room-change'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Home className="w-5 h-5" />
              Cambio de Habitación
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('date-modification')}
              className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'date-modification'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Calendar className="w-5 h-5" />
              Modificar Fechas
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('reduce-stay')}
              className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'reduce-stay'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <TrendingDown className="w-5 h-5" />
              Reducir Estadía
            </button>
          </div>

          {/* Contenido según pestaña activa */}
          {activeTab === 'room-change' && (
            <>
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              )}

          {!formData.reservationId && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>Busque y seleccione una reserva antes de continuar con el cambio de habitación.</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Actual */}
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Información Actual</h2>
                <button
                  type="button"
                  onClick={() => globalThis.location.reload()}
                  className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                  title="Actualizar datos"
                >
                  <RefreshCw className="w-4 h-4" />
                  Actualizar
                </button>
              </div>

              {/* Búsqueda por ID de Reserva */}
              <div className="mb-4">
                <label htmlFor="reservationSearchId" className="block text-sm font-medium text-gray-700 mb-2">
                  Código de Reserva
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      id="reservationSearchId"
                      type="text"
                      value={formData.reservationSearchId}
                      onChange={(e) => {
                        // Permitir letras, números, guiones
                        const value = e.target.value.toUpperCase();
                        if (/^[A-Z0-9-]*$/.test(value)) {
                          setFormData(prev => ({ ...prev, reservationSearchId: value }));
                          if (hasLoadedReservationData) {
                            setHasLoadedReservationData(false);
                          }
                        }
                      }}
                      className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: 6XPYU4TJ o 6XPY-U4TJ"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSearchReservation();
                        }
                      }}
                      disabled={isLoadingReservation}
                    />
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleSearchReservation}
                    disabled={!formData.reservationSearchId.trim() || isLoadingReservation}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isLoadingReservation ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Buscando
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        Buscar
                      </>
                    )}
                  </button>
                  
                  {hasLoadedReservationData && (
                    <button
                      type="button"
                      onClick={handleClearReservation}
                      className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Limpiar
                    </button>
                  )}
                </div>

                {/* Estados de búsqueda */}
                {isLoadingReservation && (
                  <div className="mt-4 flex items-center gap-3 p-4 bg-blue-100 border border-blue-300 rounded-lg">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    <div>
                      <p className="font-semibold text-blue-900">Buscando reserva...</p>
                      <p className="text-sm text-blue-700">Esto tomará solo un momento</p>
                    </div>
                  </div>
                )}

                {isReservationError && reservationError && (
                  <div className="mt-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-red-900">No se encontró la reserva</p>
                        <p className="text-sm text-red-700 mt-1">{reservationError.message}</p>
                      </div>
                    </div>
                  </div>
                )}

                {foundReservation && hasLoadedReservationData && (
                  <div className="mt-4 space-y-3">
                    {/* Badge de éxito */}
                    <div className="flex items-center gap-3 p-4 bg-green-50 border-2 border-green-300 rounded-lg">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-green-900">¡Reserva encontrada!</p>
                        <p className="text-sm text-green-700">Datos cargados automáticamente</p>
                      </div>
                      <span className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-full shadow-md">
                        {foundReservation.status}
                      </span>
                    </div>

                    {/* Información de la reserva en cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Card Huésped */}
                      <div className="bg-white rounded-lg p-4 border-2 border-gray-200 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                            <Users className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 font-medium uppercase">Huésped</p>
                            <p className="text-lg font-bold text-gray-900 truncate">
                              {foundReservation.guest?.firstName} {foundReservation.guest?.firstLastName}
                            </p>
                            <p className="text-sm text-gray-600">
                              📄 {foundReservation.guest?.documentNumber}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Card Habitación */}
                      <div className="bg-white rounded-lg p-4 border-2 border-gray-200 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                            <Home className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 font-medium uppercase">Habitación Actual</p>
                            <p className="text-2xl font-bold text-blue-600">
                              #{foundReservation.room?.number || 'N/A'}
                            </p>
                            <p className="text-sm text-gray-600">
                              {foundReservation.roomType}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Card Confirmación */}
                      <div className="bg-white rounded-lg p-4 border-2 border-gray-200 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                            <CheckCircle className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 font-medium uppercase">Confirmación</p>
                            <p className="text-lg font-bold text-gray-900 truncate">
                              {foundReservation.confirmationNumber}
                            </p>
                            <p className="text-sm text-gray-600">
                              {foundReservation.numberOfNights} noches
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Card Huéspedes */}
                      <div className="bg-white rounded-lg p-4 border-2 border-gray-200 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                            <Users className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 font-medium uppercase">Total Huéspedes</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {foundReservation.numberOfGuests}
                            </p>
                            <p className="text-sm text-gray-600">
                              {foundReservation.numberOfAdults}A • {foundReservation.numberOfChildren}N • {foundReservation.numberOfInfants}B
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Solicitudes especiales */}
                    {foundReservation.specialRequests && (
                      <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <MessageSquare className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-amber-900">Solicitudes Especiales:</p>
                            <p className="text-sm text-amber-800 mt-1">{foundReservation.specialRequests}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Información de resumen (Reserva y Habitación Actual) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="block text-sm font-medium text-gray-700 mb-1">
                    Reserva
                  </span>
                  <p className="text-gray-900 font-medium">
                    {formData.reservationId || 'No asignada'}
                    {formData.guestName && formData.reservationId && ` (${formData.guestName})`}
                  </p>
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-700 mb-1">
                    Habitación Actual
                  </span>
                  <p className="text-gray-900 font-medium">
                    {formData.currentRoomNumber ? `#${formData.currentRoomNumber}` : 'No asignada'}
                  </p>
                </div>
              </div>
            </div>

            {/* Nueva Habitación con Sistema Inteligente */}
            <div className="border border-blue-200 bg-blue-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Nueva Habitación</h2>
                {roomRecommendations.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <Star className="w-4 h-4" />
                    <span>{roomRecommendations.filter(r => r.suitabilityLevel === 'perfect' || r.suitabilityLevel === 'good').length} recomendadas</span>
                  </div>
                )}
              </div>

              {/* Recomendaciones Inteligentes */}
              {roomRecommendations.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Habitaciones Recomendadas
                  </h3>
                  <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto">
                    {roomRecommendations.slice(0, 6).map((room) => {
                      const handleRoomSelection = () => {
                        if (room.status === 'available') {
                          const roomIdNumber = typeof room.number === 'string' ? Number.parseInt(room.number) : room.number;
                          setFormData(prev => ({ ...prev, newRoomId: roomIdNumber }));
                        }
                      };

                      return (
                      <button
                        key={room.number}
                        type="button"
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all text-left w-full ${getSuitabilityBorderClass(room.suitabilityLevel, formData.newRoomId === room.number)}`}
                        onClick={handleRoomSelection}
                        disabled={room.status !== 'available'}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="flex items-center gap-2">
                                <Home className="w-5 h-5 text-gray-600" />
                                <span className="font-semibold text-lg text-gray-900">
                                  Habitación #{room.number}
                                </span>
                              </div>
                              
                              {/* Indicador de Nivel de Idoneidad */}
                              {room.suitabilityLevel === 'perfect' && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                  <CheckCircle className="w-3 h-3" />
                                  Perfecta
                                </div>
                              )}
                              {room.suitabilityLevel === 'good' && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                  <Star className="w-3 h-3" />
                                  Muy Buena
                                </div>
                              )}
                              {room.suitabilityLevel === 'acceptable' && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                                  <Info className="w-3 h-3" />
                                  Aceptable
                                </div>
                              )}
                              {room.suitabilityLevel === 'problematic' && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                                  <AlertTriangle className="w-3 h-3" />
                                  Problemática
                                </div>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-3">
                              <div>
                                <span className="text-sm text-gray-600">Tipo:</span>
                                <p className="font-medium text-gray-800">{room.type}</p>
                              </div>
                              <div>
                                <span className="text-sm text-gray-600">Capacidad:</span>
                                <p className="font-medium text-gray-800">{room.capacity.total} personas</p>
                              </div>
                              <div>
                                <span className="text-sm text-gray-600">Piso:</span>
                                <p className="font-medium text-gray-800">{room.floor}</p>
                              </div>
                              <div>
                                <span className="text-sm text-gray-600">Estado:</span>
                                <p className={`font-medium ${getStatusTextClass(room.status)}`}>
                                  {getStatusText(room.status)}
                                </p>
                              </div>
                            </div>

                            {/* Razones de Recomendación */}
                            {room.recommendationReasons.length > 0 && (
                              <div className="mb-2">
                                <p className="text-xs text-gray-600 mb-1">Ventajas:</p>
                                <div className="flex flex-wrap gap-1">
                                  {room.recommendationReasons.slice(0, 3).map((reason) => (
                                    <span 
                                      key={`${room.number}-${reason.type}`}
                                      className="px-2 py-1 bg-white bg-opacity-60 text-xs text-gray-700 rounded-md"
                                      title={reason.description}
                                    >
                                      {reason.description}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Problemas Identificados */}
                            {room.issues.length > 0 && (
                              <div className="mb-2">
                                <p className="text-xs text-gray-600 mb-1">Advertencias:</p>
                                <div className="space-y-1">
                                  {room.issues.map((issue) => (
                                    <div 
                                      key={`${room.number}-${issue.type}`}
                                      className={`flex items-center gap-2 text-xs p-2 rounded-md ${getIssueSeverityClass(issue.severity)}`}
                                    >
                                      <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                                      <span>{issue.description}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Ocupante Actual si aplica */}
                            {room.guestName && (
                              <div className="text-xs text-gray-600 italic">
                                Ocupada por: {room.guestName}
                              </div>
                            )}
                          </div>

                          {/* Puntuación de Recomendación */}
                          <div className="ml-4 text-right">
                            <div className="text-lg font-bold text-blue-600">
                              {room.recommendationScore}
                            </div>
                            <div className="text-xs text-gray-500">puntos</div>
                          </div>
                        </div>
                      </button>
                    );
                    })}
                  </div>
                </div>
              )}

              {/* Selección Manual de Habitación */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="newRoomId" className="block text-sm font-medium text-gray-700 mb-2">
                    Seleccionar Habitación Manualmente <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="newRoomId"
                    value={formData.newRoomId}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      newRoomId: e.target.value ? Number.parseInt(e.target.value) : '' 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={isLoadingRooms}
                  >
                    <option value="">
                      {isLoadingRooms ? 'Cargando habitaciones...' : 'Seleccionar habitación'}
                    </option>
                    
                    {/* Habitaciones Recomendadas Primero */}
                    {roomRecommendations.length > 0 && (
                      <>
                        <optgroup label="🌟 Recomendadas">
                          {roomRecommendations
                            .filter(room => room.suitabilityLevel === 'perfect' || room.suitabilityLevel === 'good')
                            .slice(0, 5)
                            .map((room) => (
                            <option 
                              key={`rec-${room.number}`} 
                              value={room.number}
                              disabled={room.status !== 'available'}
                            >
                              #{room.number} - {room.type} (Cap: {room.capacity.total}) - ⭐ {room.recommendationScore} pts
                              {room.status === 'available' ? '' : ' - No disponible'}
                            </option>
                          ))}
                        </optgroup>
                        
                        <optgroup label="📋 Otras Habitaciones">
                          {allRooms
                            .filter(room => !roomRecommendations
                              .slice(0, 5)
                              .some(rec => rec.number === room.number))
                            .map((room) => (
                            <option 
                              key={`other-${room.number}`} 
                              value={room.number}
                              disabled={room.status !== 'available'}
                            >
                              #{room.number} - {room.type} (Capacidad: {room.capacity.total})
                              {room.guestName ? ` - Ocupada por ${room.guestName}` : ''}
                              {room.status === 'available' ? '' : ' - No disponible'}
                            </option>
                          ))}
                        </optgroup>
                      </>
                    )}
                    
                    {/* Si no hay recomendaciones, mostrar todas */}
                    {roomRecommendations.length === 0 && allRooms.map((room) => (
                      <option 
                        key={room.number} 
                        value={room.number}
                        disabled={room.status !== 'available'}
                      >
                        #{room.number} - {room.type} (Capacidad: {room.capacity.total})
                        {room.guestName ? ` - Ocupada por ${room.guestName}` : ''}
                        {room.status === 'available' ? '' : ' - No disponible'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="changeDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Cambio <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="changeDate"
                    type="date"
                    value={formData.changeDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, changeDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>

              
              {/* Estadísticas de Disponibilidad */}
              {roomRecommendations.length > 0 && (
                <div className="mt-4 p-4 bg-white border border-gray-200 rounded-md">
                  <h4 className="text-sm font-medium text-gray-800 mb-3">Resumen de Disponibilidad</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="p-2 bg-green-50 rounded-md">
                      <div className="text-2xl font-bold text-green-600">
                        {roomRecommendations.filter(r => r.suitabilityLevel === 'perfect').length}
                      </div>
                      <div className="text-xs text-green-700">Perfectas</div>
                    </div>
                    <div className="p-2 bg-blue-50 rounded-md">
                      <div className="text-2xl font-bold text-blue-600">
                        {roomRecommendations.filter(r => r.suitabilityLevel === 'good').length}
                      </div>
                      <div className="text-xs text-blue-700">Muy Buenas</div>
                    </div>
                    <div className="p-2 bg-yellow-50 rounded-md">
                      <div className="text-2xl font-bold text-yellow-600">
                        {roomRecommendations.filter(r => r.suitabilityLevel === 'acceptable').length}
                      </div>
                      <div className="text-xs text-yellow-700">Aceptables</div>
                    </div>
                    <div className="p-2 bg-red-50 rounded-md">
                      <div className="text-2xl font-bold text-red-600">
                        {roomRecommendations.filter(r => r.suitabilityLevel === 'problematic').length}
                      </div>
                      <div className="text-xs text-red-700">Problemáticas</div>
                    </div>
                  </div>
                </div>
              )}

              {selectedRoom && (
                <div className="mt-4 p-4 bg-white border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Home className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-900 text-lg">
                      Habitación Seleccionada: #{selectedRoom.number}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <span className="text-sm text-gray-600">Tipo:</span>
                      <p className="font-medium text-gray-800">{selectedRoom.type}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Capacidad:</span>
                      <p className="font-medium text-gray-800">{selectedRoom.capacity.total} personas</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Estado:</span>
                      <p className={`font-medium ${getStatusTextClass(selectedRoom.status)}`}>
                        {getStatusText(selectedRoom.status)}
                      </p>
                    </div>
                  </div>

                  {/* Información de la recomendación para la habitación seleccionada */}
                  {(() => {
                    const selectedRecommendation = roomRecommendations.find(r => r.number === selectedRoom.number);
                    if (selectedRecommendation) {
                      return (
                        <div className="border-t border-gray-200 pt-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Evaluación de la selección:</span>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getSuitabilityClass(selectedRecommendation.suitabilityLevel)}`}>
                              {getSuitabilityText(selectedRecommendation.suitabilityLevel)} ({selectedRecommendation.recommendationScore} pts)
                            </div>
                          </div>
                          
                          {selectedRecommendation.recommendationReasons.length > 0 && (
                            <div className="mb-2">
                              <p className="text-xs text-gray-600 mb-1">Ventajas:</p>
                              <div className="space-y-1">
                                {selectedRecommendation.recommendationReasons.map((reason) => (
                                  <div key={`sel-${reason.type}`} className="flex items-center gap-2 text-xs text-green-700 bg-green-50 p-2 rounded-md">
                                    <CheckCircle className="w-3 h-3 flex-shrink-0" />
                                    <span>{reason.description}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {selectedRecommendation.issues.length > 0 && (
                            <div>
                              <p className="text-xs text-gray-600 mb-1">Advertencias:</p>
                              <div className="space-y-1">
                                {selectedRecommendation.issues.map((issue) => (
                                  <div key={`sel-${issue.type}`} className={`flex items-center gap-2 text-xs p-2 rounded-md ${getIssueSeverityClass(issue.severity)}`}>
                                    <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                                    <span>{issue.description}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {selectedRoom.guestName && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
                      <div className="flex items-center gap-2 text-red-700 text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        <span>⚠️ Esta habitación está ocupada por: <strong>{selectedRoom.guestName}</strong></span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Composición de Huéspedes */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-6 h-6" />
                Composición de Huéspedes
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="adultos" className="block text-sm font-medium text-gray-700 mb-2">
                    Adultos <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="adultos"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.adultos}
                    onChange={(e) => setFormData(prev => ({ ...prev, adultos: Number.parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="ninos" className="block text-sm font-medium text-gray-700 mb-2">
                    Niños <span className="text-xs text-gray-500">(2-12 años)</span>
                  </label>
                  <input
                    id="ninos"
                    type="number"
                    min="0"
                    max="10"
                    value={formData.ninos}
                    onChange={(e) => setFormData(prev => ({ ...prev, ninos: Number.parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="bebes" className="block text-sm font-medium text-gray-700 mb-2">
                    Bebés <span className="text-xs text-gray-500">(0-2 años)</span>
                  </label>
                  <input
                    id="bebes"
                    type="number"
                    min="0"
                    max="5"
                    value={formData.bebes}
                    onChange={(e) => setFormData(prev => ({ ...prev, bebes: Number.parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
                <p className="text-sm text-gray-700">
                  <strong>Total de huéspedes:</strong> {totalGuests} 
                  {totalGuests > 1 ? ' personas' : ' persona'}
                  {selectedRoom && totalGuests > selectedRoom.capacity.total && (
                    <span className="text-red-600 ml-2 font-medium">
                      ⚠️ Excede la capacidad de la habitación ({selectedRoom.capacity.total})
                    </span>
                  )}
                  {selectedRoom && selectedRoom.status !== 'available' && (
                    <span className="text-red-600 ml-2 font-medium">
                      ⚠️ Habitación no disponible
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Motivo y Observaciones */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-6 h-6" />
                Motivo del Cambio
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                    Motivo <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      reason: e.target.value as RoomChangeReason,
                      motivo: e.target.value === 'other' ? prev.motivo : changeReasons.find(r => r.value === e.target.value)?.label || ''
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Seleccionar motivo</option>
                    {changeReasons.map((reason) => (
                      <option key={reason.value} value={reason.value}>
                        {reason.label}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.reason === 'other' && (
                  <div>
                    <label htmlFor="customReason" className="block text-sm font-medium text-gray-700 mb-2">
                      Especificar Motivo <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="customReason"
                      type="text"
                      value={formData.motivo}
                      onChange={(e) => setFormData(prev => ({ ...prev, motivo: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe el motivo del cambio..."
                      required
                    />
                  </div>
                )}
              </div>

              <div className="mt-4">
                <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones Adicionales
                </label>
                <textarea
                  id="observaciones"
                  value={formData.observaciones}
                  onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Información adicional sobre el cambio de habitación..."
                />
              </div>
            </div>

            {/* Panel de Validación y Resumen */}
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen del Cambio</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Lista de Validaciones */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Estado de Validación:</h4>
                  <div className="space-y-2">
                    <div className={`flex items-center gap-2 text-sm ${formData.reservationId ? 'text-green-600' : 'text-red-600'}`}>
                      {formData.reservationId ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      <span>{formData.reservationId ? '✅ Reserva seleccionada' : '❌ Debe buscar una reserva'}</span>
                    </div>
                    
                    <div className={`flex items-center gap-2 text-sm ${formData.newRoomId ? 'text-green-600' : 'text-red-600'}`}>
                      {formData.newRoomId ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      <span>{formData.newRoomId ? '✅ Habitación seleccionada' : '❌ Debe seleccionar una habitación'}</span>
                    </div>

                    <div className={`flex items-center gap-2 text-sm ${formData.reason ? 'text-green-600' : 'text-red-600'}`}>
                      {formData.reason ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      <span>{formData.reason ? '✅ Motivo especificado' : '❌ Debe especificar el motivo'}</span>
                    </div>

                    {formData.reason === 'other' && (
                      <div className={`flex items-center gap-2 text-sm ml-6 ${formData.motivo.trim() ? 'text-green-600' : 'text-red-600'}`}>
                        {formData.motivo.trim() ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                        <span>{formData.motivo.trim() ? '✅ Motivo personalizado definido' : '❌ Debe especificar el motivo personalizado'}</span>
                      </div>
                    )}

                    {selectedRoom && (
                      <div className={`flex items-center gap-2 text-sm ${totalGuests <= selectedRoom.capacity.total ? 'text-green-600' : 'text-red-600'}`}>
                        {totalGuests <= selectedRoom.capacity.total ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                        <span>
                          {totalGuests <= selectedRoom.capacity.total 
                            ? '✅ Capacidad adecuada' 
                            : `❌ Excede capacidad (${totalGuests}>${selectedRoom.capacity.total})`
                          }
                        </span>
                      </div>
                    )}

                    {selectedRoom && selectedRoom.status !== 'available' && (
                      <div className="flex items-center gap-2 text-sm text-red-600">
                        <AlertTriangle className="w-4 h-4" />
                        <span>⚠️ Habitación no disponible ({selectedRoom.status})</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Información de la Selección */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Información del Cambio:</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>
                      <strong>De:</strong> {formData.currentRoomNumber ? `Habitación #${formData.currentRoomNumber}` : 'No especificada'}
                    </div>
                    <div>
                      <strong>A:</strong> {selectedRoom ? `Habitación #${selectedRoom.number} (${selectedRoom.type})` : 'No seleccionada'}
                    </div>
                    <div>
                      <strong>Huéspedes:</strong> {totalGuests} ({formData.adultos}A, {formData.ninos}N, {formData.bebes}B)
                    </div>
                    <div>
                      <strong>Fecha:</strong> {formData.changeDate}
                    </div>
                    {formData.reason && (
                      <div>
                        <strong>Motivo:</strong> {formData.reason === 'other' ? formData.motivo : changeReasons.find(r => r.value === formData.reason)?.label}
                      </div>
                    )}

                    {/* Evaluación de la Recomendación */}
                    {(() => {
                      const selectedRecommendation = roomRecommendations.find(r => r.number === formData.newRoomId?.toString());
                      if (selectedRecommendation) {
                        return (
                          <div className="mt-3 p-3 bg-white rounded-md border">
                            <div className="flex items-center justify-between mb-2">
                              <strong className="text-sm">Evaluación:</strong>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSuitabilityClass(selectedRecommendation.suitabilityLevel)}`}>
                                {getSuitabilityShortText(selectedRecommendation.suitabilityLevel)}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600">
                              Puntuación: {selectedRecommendation.recommendationScore} puntos
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>
              </div>

              {/* Alertas Especiales */}
              {selectedRoom && selectedRoom.status !== 'available' && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="w-5 h-5" />
                    <div>
                      <div className="font-medium">¡Atención! Habitación no disponible</div>
                      <div className="text-sm">
                        {selectedRoom.status === 'occupied' && selectedRoom.guestName 
                          ? `Esta habitación está ocupada por ${selectedRoom.guestName}`
                          : `Estado actual: ${selectedRoom.status}`
                        }
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sugerencias Alternativas */}
              {selectedRoom && selectedRoom.status !== 'available' && roomRecommendations.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center gap-2 text-blue-700 mb-2">
                    <Info className="w-5 h-5" />
                    <div className="font-medium">Sugerencias alternativas:</div>
                  </div>
                  <div className="text-sm text-blue-600">
                    {roomRecommendations
                      .filter(room => room.status === 'available' && room.suitabilityLevel !== 'problematic')
                      .slice(0, 3)
                      .map(room => `#${room.number} (${room.type})`)
                      .join(', ')}
                  </div>
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate(ROUTES.FRONTDESK.BASE)}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={
                  isCambiandoHabitacion || 
                  !formData.newRoomId || 
                  !formData.reservationId ||
                  !formData.reason ||
                  (formData.reason === 'other' && !formData.motivo.trim()) ||
                  (selectedRoom && totalGuests > selectedRoom.capacity.total)
                }
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCambiandoHabitacion ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Procesando cambio...
                  </div>
                ) : (
                  'Confirmar Cambio de Habitación'
                )}
              </button>
              

            </div>
          </form>

          {/* Modal de Resultado */}
          {showResultModal && changeResult && (
            <RoomChangeResultModal
              isOpen={showResultModal}
              onClose={handleCloseResultModal}
              result={changeResult}
            />
          )}
            </>
          )}
      
          {activeTab === 'date-modification' && <DateModification />}
      
          {activeTab === 'reduce-stay' && <ReduceStay />}
        </div>
      </div>
    </div>
  );
};

export default RoomChange;