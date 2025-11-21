import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, AlertTriangle, CheckCircle, Loader2, Search, X, Info } from 'lucide-react';
import { useModificacionReserva } from '../hooks/useModificacionReserva';
import { useInputValidation } from '../../../hooks/useInputValidation';
import { useReservationByCode } from '../../reservations/hooks/useReservationQueries';
import { ROUTES } from '../../../router/routes';

interface ReduceStayFormData {
  reservationSearchId: string;
  reservationId: string;
  idReservaHabitacion: number | null;
  guestName: string;
  currentCheckOut: string;
  newCheckOut: string;
  aplicarPolitica: boolean;
  motivo: string;
}

const ReduceStay = () => {
  const navigate = useNavigate();
  const { reducirEstadia, isReduciendoEstadia, error } = useModificacionReserva();
  useInputValidation();

  const [reservationSearchId, setReservationSearchId] = useState<string>('');
  const [hasLoadedReservationData, setHasLoadedReservationData] = useState(false);

  const { 
    data: foundReservation, 
    isLoading: isLoadingReservation, 
    isError: isReservationError,
    error: reservationError 
  } = useReservationByCode(reservationSearchId, !!reservationSearchId);

  // Función helper para formatear fechas sin problemas de zona horaria
  const formatDateSafe = (dateString: string) => {
    const dateParts = dateString.split('T')[0];
    const [year, month, day] = dateParts.split('-');
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day));
    
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const [formData, setFormData] = useState<ReduceStayFormData>({
    reservationSearchId: '',
    reservationId: '',
    idReservaHabitacion: null,
    guestName: '',
    currentCheckOut: '',
    newCheckOut: '',
    aplicarPolitica: true,
    motivo: '',
  });

  // Autocargar datos de la reserva
  useEffect(() => {
    if (foundReservation && !hasLoadedReservationData) {
      console.log('📋 Autocargando datos de reserva:', foundReservation);
      
      const guest = foundReservation.guest;
      const fullLastName = guest?.secondLastName 
        ? `${guest.firstLastName} ${guest.secondLastName}`
        : guest?.firstLastName;
      
      const fullName = guest ? `${guest.firstName} ${fullLastName}`.trim() : '';
      const idReservaHab = (foundReservation as any).idReservaHabitacion || null;

      setFormData(prev => ({
        ...prev,
        reservationId: foundReservation.id,
        idReservaHabitacion: idReservaHab,
        guestName: fullName,
        currentCheckOut: foundReservation.checkOutDate.split('T')[0],
        newCheckOut: foundReservation.checkOutDate.split('T')[0],
      }));
      
      setHasLoadedReservationData(true);
    }
  }, [foundReservation, hasLoadedReservationData]);

  // Resetear datos cargados
  useEffect(() => {
    if (!reservationSearchId) {
      setHasLoadedReservationData(false);
    }
  }, [reservationSearchId]);

  const handleSearchReservation = () => {
    if (formData.reservationSearchId.trim()) {
      setReservationSearchId(formData.reservationSearchId.trim());
      setHasLoadedReservationData(false);
    }
  };

  const handleClearReservation = () => {
    setFormData({
      reservationSearchId: '',
      reservationId: '',
      idReservaHabitacion: null,
      guestName: '',
      currentCheckOut: '',
      newCheckOut: '',
      aplicarPolitica: true,
      motivo: '',
    });
    setReservationSearchId('');
    setHasLoadedReservationData(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.reservationId || !formData.idReservaHabitacion) {
      console.error('❌ Datos de reserva incompletos');
      return;
    }

    if (formData.newCheckOut >= formData.currentCheckOut) {
      alert('⚠️ La nueva fecha de salida debe ser anterior a la actual');
      return;
    }

    console.log('⏰ Reduciendo estadía:', {
      idReserva: formData.reservationId,
      idReservaHabitacion: formData.idReservaHabitacion,
      nuevaFechaSalida: formData.newCheckOut,
      aplicarPolitica: formData.aplicarPolitica,
    });

    const result = await reducirEstadia(
      formData.reservationId,
      formData.idReservaHabitacion,
      formData.newCheckOut,
      formData.aplicarPolitica
    );

    if (result) {
      console.log('✅ Estadía reducida exitosamente:', result);
      // El toast ya se muestra automáticamente en el hook
    }
  };

  const calculateNightsCancelled = () => {
    if (!formData.currentCheckOut || !formData.newCheckOut || !foundReservation) return 0;
    
    const oldCheckOut = new Date(formData.currentCheckOut);
    const newCheckOut = new Date(formData.newCheckOut);
    const diffTime = oldCheckOut.getTime() - newCheckOut.getTime();
    const nightsCancelled = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return nightsCancelled;
  };

  const nightsCancelled = calculateNightsCancelled();

  const motivosComunes = [
    { value: 'emergencia_personal', label: 'Emergencia Personal' },
    { value: 'cambio_planes', label: 'Cambio de Planes' },
    { value: 'problemas_trabajo', label: 'Problemas de Trabajo' },
    { value: 'problemas_salud', label: 'Problemas de Salud' },
    { value: 'razones_economicas', label: 'Razones Económicas' },
    { value: 'insatisfaccion_servicio', label: 'Insatisfacción con el Servicio' },
    { value: 'otro', label: 'Otro Motivo' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="relative flex items-center justify-center mb-8">
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-orange-600" />
                <h1 className="text-3xl font-bold text-gray-900">Reducir Estadía</h1>
              </div>
              <p className="text-gray-600 text-sm">Checkout Anticipado</p>
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

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Búsqueda de Reserva */}
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Buscar Reserva</h2>
              
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
                        const value = e.target.value.toUpperCase();
                        if (/^[A-Z0-9-]*$/.test(value)) {
                          setFormData(prev => ({ ...prev, reservationSearchId: value }));
                          if (hasLoadedReservationData) {
                            setHasLoadedReservationData(false);
                          }
                        }
                      }}
                      className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                    className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
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
                  <div className="mt-4 flex items-center gap-3 p-4 bg-orange-100 border border-orange-300 rounded-lg">
                    <Loader2 className="w-6 h-6 animate-spin text-orange-600" />
                    <div>
                      <p className="font-semibold text-orange-900">Buscando reserva...</p>
                      <p className="text-sm text-orange-700">Esto tomará solo un momento</p>
                    </div>
                  </div>
                )}

                {isReservationError && reservationError && (
                  <div className="mt-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-red-900">No se encontró la reserva</p>
                        <p className="text-sm text-red-700 mt-1">{reservationError.message}</p>
                      </div>
                    </div>
                  </div>
                )}

                {foundReservation && hasLoadedReservationData && (
                  <div className="mt-4 p-4 bg-green-50 border-2 border-green-300 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <div className="flex-1">
                        <p className="font-bold text-green-900">¡Reserva encontrada!</p>
                        <p className="text-sm text-green-700">
                          {formData.guestName} - Habitación #{foundReservation.room?.number}
                        </p>
                        <p className="text-sm text-green-600 mt-1">
                          {foundReservation.numberOfNights} noches reservadas
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Reducción de Estadía */}
            {hasLoadedReservationData && foundReservation && (
              <>
                <div className="border border-orange-200 rounded-lg p-6 bg-orange-50">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Checkout Anticipado</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Check-Out Original</p>
                      <p className="text-xl font-bold text-gray-900">
                        {formatDateSafe(formData.currentCheckOut)}
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="newCheckOut" className="block text-sm font-medium text-gray-700 mb-2">
                        Nueva Fecha de Check-Out <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="newCheckOut"
                        type="date"
                        value={formData.newCheckOut}
                        onChange={(e) => setFormData(prev => ({ ...prev, newCheckOut: e.target.value }))}
                        max={formData.currentCheckOut}
                        min={foundReservation.checkInDate.split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        required
                      />
                    </div>
                  </div>

                  {nightsCancelled > 0 && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <p className="font-semibold text-red-900">
                          Se cancelarán {nightsCancelled} noche{nightsCancelled > 1 ? 's' : ''}
                        </p>
                      </div>
                      <p className="text-sm text-red-700">
                        Las noches canceladas pueden estar sujetas a las políticas de cancelación del hotel.
                      </p>
                    </div>
                  )}
                </div>

                {/* Motivo */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Motivo de la Reducción</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="motivo" className="block text-sm font-medium text-gray-700 mb-2">
                        Seleccione un motivo
                      </label>
                      <select
                        id="motivo"
                        value={formData.motivo}
                        onChange={(e) => setFormData(prev => ({ ...prev, motivo: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">Seleccione un motivo...</option>
                        {motivosComunes.map((motivo) => (
                          <option key={motivo.value} value={motivo.label}>
                            {motivo.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        id="aplicarPolitica"
                        type="checkbox"
                        checked={formData.aplicarPolitica}
                        onChange={(e) => setFormData(prev => ({ ...prev, aplicarPolitica: e.target.checked }))}
                        className="mt-1 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <label htmlFor="aplicarPolitica" className="text-sm text-gray-700">
                        <span className="font-medium">Aplicar Política de Cancelación</span>
                        <p className="text-gray-500 mt-1">
                          Si está marcado, se aplicarán las políticas de cancelación del hotel.
                          Esto puede resultar en penalidades o cargos por las noches canceladas.
                        </p>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Advertencia de Políticas */}
                {formData.aplicarPolitica && (
                  <div className="border-2 border-yellow-300 bg-yellow-50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Info className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-yellow-900 mb-2">Políticas de Cancelación</p>
                        <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                          <li><strong>72+ horas antes:</strong> Sin penalidad, reembolso completo</li>
                          <li><strong>Menos de 72 horas:</strong> Se cobra primera noche (30%)</li>
                          <li><strong>Temporada Alta (15+ días):</strong> Sin penalidad</li>
                          <li><strong>Temporada Alta ({'<'}15 días):</strong> Se cobra 100% primera noche</li>
                          <li><strong>Tarifas No Reembolsables:</strong> Sin reembolso</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Botones */}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate(ROUTES.FRONTDESK.BASE)}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={
                      isReduciendoEstadia || 
                      !formData.reservationId ||
                      nightsCancelled <= 0 ||
                      formData.newCheckOut >= formData.currentCheckOut
                    }
                    className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isReduciendoEstadia ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Procesando reducción...
                      </div>
                    ) : (
                      'Confirmar Checkout Anticipado'
                    )}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReduceStay;
