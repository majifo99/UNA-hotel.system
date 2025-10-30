import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, AlertTriangle, CheckCircle, Loader2, Search, X, Info } from 'lucide-react';
import { useModificacionReserva } from '../hooks/useModificacionReserva';
import { useInputValidation } from '../../../hooks/useInputValidation';
import { useReservationByCode } from '../../reservations/hooks/useReservationQueries';
import { ROUTES } from '../../../router/routes';
import type { ModificarFechasResponse } from '../services/ModificacionReservaService';

interface DateModificationFormData {
  reservationSearchId: string;
  reservationId: string;
  idReservaHabitacion: number | null;
  guestName: string;
  currentCheckIn: string;
  currentCheckOut: string;
  newCheckIn: string;
  newCheckOut: string;
  aplicarPolitica: boolean;
}

const DateModification = () => {
  const navigate = useNavigate();
  const { modificarFechas, isModificandoFechas, error } = useModificacionReserva();
  useInputValidation();

  const [reservationSearchId, setReservationSearchId] = useState<string>('');
  const [hasLoadedReservationData, setHasLoadedReservationData] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [modificationResult, setModificationResult] = useState<ModificarFechasResponse | null>(null);

  const { 
    data: foundReservation, 
    isLoading: isLoadingReservation, 
    isError: isReservationError,
    error: reservationError 
  } = useReservationByCode(reservationSearchId, !!reservationSearchId);

  const [formData, setFormData] = useState<DateModificationFormData>({
    reservationSearchId: '',
    reservationId: '',
    idReservaHabitacion: null,
    guestName: '',
    currentCheckIn: '',
    currentCheckOut: '',
    newCheckIn: '',
    newCheckOut: '',
    aplicarPolitica: true,
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
        currentCheckIn: foundReservation.checkInDate.split('T')[0],
        currentCheckOut: foundReservation.checkOutDate.split('T')[0],
        newCheckIn: foundReservation.checkInDate.split('T')[0],
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
      currentCheckIn: '',
      currentCheckOut: '',
      newCheckIn: '',
      newCheckOut: '',
      aplicarPolitica: true,
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

    // Determinar qué fechas cambiaron
    const checkInChanged = formData.newCheckIn !== formData.currentCheckIn;
    const checkOutChanged = formData.newCheckOut !== formData.currentCheckOut;

    if (!checkInChanged && !checkOutChanged) {
      alert('⚠️ No se detectaron cambios en las fechas');
      return;
    }

    console.log('📅 Modificando fechas:', {
      idReserva: formData.reservationId,
      idReservaHabitacion: formData.idReservaHabitacion,
      nuevaFechaLlegada: checkInChanged ? formData.newCheckIn : undefined,
      nuevaFechaSalida: checkOutChanged ? formData.newCheckOut : undefined,
      aplicarPolitica: formData.aplicarPolitica,
    });

    const result = await modificarFechas(
      formData.reservationId,
      formData.idReservaHabitacion,
      checkInChanged ? formData.newCheckIn : undefined,
      checkOutChanged ? formData.newCheckOut : undefined,
      formData.aplicarPolitica
    );

    if (result) {
      console.log('✅ Fechas modificadas exitosamente:', result);
      setModificationResult(result);
      setShowResultModal(true);
    }
  };

  const handleCloseResultModal = () => {
    setShowResultModal(false);
    navigate(ROUTES.FRONTDESK.BASE);
  };

  const calculateNightsDifference = () => {
    if (!formData.newCheckIn || !formData.newCheckOut) return 0;
    
    const checkIn = new Date(formData.newCheckIn);
    const checkOut = new Date(formData.newCheckOut);
    const diffTime = checkOut.getTime() - checkIn.getTime();
    const newNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const oldCheckIn = new Date(formData.currentCheckIn);
    const oldCheckOut = new Date(formData.currentCheckOut);
    const oldDiffTime = oldCheckOut.getTime() - oldCheckIn.getTime();
    const oldNights = Math.ceil(oldDiffTime / (1000 * 60 * 60 * 24));
    
    return newNights - oldNights;
  };

  const nightsDifference = calculateNightsDifference();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="relative flex items-center justify-center mb-8">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Modificar Fechas de Reserva</h1>
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
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modificación de Fechas */}
            {hasLoadedReservationData && foundReservation && (
              <>
                <div className="border border-blue-200 rounded-lg p-6 bg-blue-50">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Fechas Actuales</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Check-In Actual</p>
                      <p className="text-xl font-bold text-gray-900">
                        {new Date(formData.currentCheckIn).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Check-Out Actual</p>
                      <p className="text-xl font-bold text-gray-900">
                        {new Date(formData.currentCheckOut).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
                    <p className="text-sm text-gray-600">Noches Actuales</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {foundReservation.numberOfNights} noches
                    </p>
                  </div>
                </div>

                <div className="border border-green-200 rounded-lg p-6 bg-green-50">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Nuevas Fechas</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="newCheckIn" className="block text-sm font-medium text-gray-700 mb-2">
                        Nueva Fecha de Check-In
                      </label>
                      <input
                        id="newCheckIn"
                        type="date"
                        value={formData.newCheckIn}
                        onChange={(e) => setFormData(prev => ({ ...prev, newCheckIn: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
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
                        min={formData.newCheckIn}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                  </div>

                  {nightsDifference !== 0 && (
                    <div className={`mt-4 p-4 rounded-lg border-2 ${
                      nightsDifference > 0 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-orange-50 border-orange-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        <Info className={`w-5 h-5 ${
                          nightsDifference > 0 ? 'text-blue-600' : 'text-orange-600'
                        }`} />
                        <p className={`font-semibold ${
                          nightsDifference > 0 ? 'text-blue-900' : 'text-orange-900'
                        }`}>
                          {nightsDifference > 0 
                            ? `Extensión de ${nightsDifference} noche${nightsDifference > 1 ? 's' : ''}` 
                            : `Reducción de ${Math.abs(nightsDifference)} noche${Math.abs(nightsDifference) > 1 ? 's' : ''}`
                          }
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Opciones</h2>
                  
                  <div className="flex items-start gap-3">
                    <input
                      id="aplicarPolitica"
                      type="checkbox"
                      checked={formData.aplicarPolitica}
                      onChange={(e) => setFormData(prev => ({ ...prev, aplicarPolitica: e.target.checked }))}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="aplicarPolitica" className="text-sm text-gray-700">
                      <span className="font-medium">Aplicar Política de Cancelación</span>
                      <p className="text-gray-500 mt-1">
                        Si está marcado, se aplicarán las políticas de cancelación del hotel en caso de reducción de estadía.
                        Esto puede resultar en penalidades o cargos adicionales según los términos de la reserva.
                      </p>
                    </label>
                  </div>
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
                      isModificandoFechas || 
                      !formData.reservationId ||
                      nightsDifference === 0 ||
                      formData.newCheckOut <= formData.newCheckIn
                    }
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isModificandoFechas ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Modificando fechas...
                      </div>
                    ) : (
                      'Confirmar Modificación de Fechas'
                    )}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>

      {/* Modal de Resultado */}
      {showResultModal && modificationResult && (
        <DateModificationResultModal
          isOpen={showResultModal}
          onClose={handleCloseResultModal}
          result={modificationResult}
        />
      )}
    </div>
  );
};

// Modal de Resultado (simplificado por ahora)
const DateModificationResultModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  result: ModificarFechasResponse;
}> = ({ isOpen, onClose, result }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-6 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-12 h-12" />
              <div>
                <h2 className="text-2xl font-bold">Fechas Modificadas Exitosamente</h2>
                <p className="text-blue-100 text-sm">Los cambios se procesaron correctamente</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Fechas Comparación */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold text-gray-900 mb-3">Fechas Anteriores</h3>
              <p className="text-sm text-gray-600">Check-In:</p>
              <p className="font-bold text-gray-800 mb-2">
                {new Date(result.fechas_originales.llegada).toLocaleDateString('es-ES')}
              </p>
              <p className="text-sm text-gray-600">Check-Out:</p>
              <p className="font-bold text-gray-800 mb-2">
                {new Date(result.fechas_originales.salida).toLocaleDateString('es-ES')}
              </p>
              <p className="text-sm text-gray-600">Noches:</p>
              <p className="text-lg font-bold text-gray-700">{result.fechas_originales.noches}</p>
            </div>

            <div className="border-2 border-blue-300 rounded-lg p-4 bg-blue-50">
              <h3 className="font-semibold text-blue-900 mb-3">Fechas Nuevas</h3>
              <p className="text-sm text-blue-600">Check-In:</p>
              <p className="font-bold text-blue-800 mb-2">
                {new Date(result.fechas_nuevas.llegada).toLocaleDateString('es-ES')}
              </p>
              <p className="text-sm text-blue-600">Check-Out:</p>
              <p className="font-bold text-blue-800 mb-2">
                {new Date(result.fechas_nuevas.salida).toLocaleDateString('es-ES')}
              </p>
              <p className="text-sm text-blue-600">Noches:</p>
              <p className="text-lg font-bold text-blue-700">{result.fechas_nuevas.noches}</p>
            </div>
          </div>

          {/* Precios */}
          <div className="border-2 border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Ajustes de Precio</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Precio Anterior:</span>
                <span className="font-semibold">${result.precios.precio_anterior.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Precio Nuevo:</span>
                <span className="font-semibold">${result.precios.precio_nuevo.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-600">Diferencia:</span>
                <span className={`font-bold ${result.precios.diferencia >= 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {result.precios.diferencia >= 0 ? '+' : ''}${result.precios.diferencia.toFixed(2)}
                </span>
              </div>
              {result.precios.penalidad > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Penalidad:</span>
                  <span className="font-bold">${result.precios.penalidad.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Política */}
          {result.politica && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Política Aplicada:</strong> {result.politica}
              </p>
            </div>
          )}

          {/* Resumen Final */}
          <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Resumen de la Reserva</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Nuevo:</span>
                <span className="text-xl font-bold text-gray-900">${result.reserva.total_nuevo.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Monto Pagado:</span>
                <span className="font-semibold text-green-600">${result.reserva.monto_pagado.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Monto Pendiente:</span>
                <span className="font-semibold text-orange-600">${result.reserva.monto_pendiente.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg border-t">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            Cerrar y Continuar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateModification;
