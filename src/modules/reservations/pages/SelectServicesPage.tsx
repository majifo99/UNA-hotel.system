import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, X } from 'lucide-react';
import { ServicesSelection } from '../components';
import type { SimpleReservationFormData, AdditionalService } from '../types';
import { reservationService } from '../services';

interface LocationState {
  reservationData?: SimpleReservationFormData;
  selectedServices?: string[];
}

export const SelectServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  
  const [selectedServices, setSelectedServices] = React.useState<string[]>(
    state?.selectedServices || []
  );

  // Scroll to top when component mounts
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [additionalServices, setAdditionalServices] = React.useState<AdditionalService[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    reservationService.getAdditionalServices()
      .then((services) => {
        console.debug('[UI] loaded servicios:', services);
        if (mounted) setAdditionalServices(services);
      })
      .catch((err) => {
        console.error('[UI] Error loading servicios:', err);
        if (mounted) setError(String(err?.message || err));
      })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSave = () => {
    // Regresar a la página de crear reserva con los servicios seleccionados
    navigate('/reservations/create', {
      state: {
        ...state?.reservationData,
        additionalServices: selectedServices
      }
    });
  };

  const handleCancel = () => {
    navigate('/reservations/create');
  };

  const selectedServicesData = additionalServices.filter(service => selectedServices.includes(service.id));

  const totalServicesPrice = selectedServicesData.reduce((total, service) => 
    total + service.price, 0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={handleCancel}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Servicios Adicionales
              </h1>
              <p className="text-gray-600">
                Seleccione los servicios adicionales para la reserva
              </p>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-gray-500">
            <span>Nueva Reserva</span>
            <span className="mx-2">→</span>
            <span className="text-blue-600 font-medium">Servicios Adicionales</span>
          </div>
        </div>

        {/* Services Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Servicios Disponibles
          </h2>
          
          {loading && <div className="py-6">Cargando servicios...</div>}
          {error && <div className="py-6 text-red-600">Error cargando servicios: {error}</div>}
          {!loading && !error && (
            <ServicesSelection
              services={additionalServices}
              selectedServices={selectedServices}
              onServiceToggle={handleServiceToggle}
            />
          )}
        </div>

        {/* Summary and Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Resumen de Servicios
            </h3>
            <div className="text-right">
              <div className="text-sm text-gray-600">Total servicios:</div>
              <div className="text-xl font-bold text-gray-900">
                ${totalServicesPrice.toFixed(2)}
              </div>
            </div>
          </div>

          {selectedServicesData.length > 0 ? (
            <div className="space-y-2 mb-6">
              {selectedServicesData.map((service) => (
                <div key={service.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div>
                    <span className="font-medium text-gray-900">{service.name}</span>
                    <span className="text-gray-600 ml-2">- {service.description}</span>
                  </div>
                  <span className="font-medium text-gray-900">${service.price}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 mb-6">No hay servicios seleccionados</p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <X size={16} />
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Save size={16} />
              Guardar y Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
