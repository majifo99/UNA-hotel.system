import React, { useState } from 'react';
import { Clock, RefreshCw, DollarSign, Divide, FileX, ChevronDown, ChevronRight } from 'lucide-react';
import { useFolioHistorial } from '../hooks/useFolioHistorial';

interface FolioHistorialProps {
  folioId: number;
}

type TipoEvento = 'pago' | 'distribucion' | 'cierre' | null;

export const FolioHistorial: React.FC<FolioHistorialProps> = ({ folioId }) => {
  const [eventosExpandidos, setEventosExpandidos] = useState<Set<string>>(new Set());

  // Usar el hook de historial
  const {
    eventos,
    loading,
    error,
    filtroTipo,
    hasMore,
    cargarMas,
    filtrarPorTipo,
    refrescar
  } = useFolioHistorial({
    folioId,
    autoLoad: true,
    onError: (err) => {
      console.error('Error en historial:', err);
    }
  });

  const toggleEventoExpandido = (eventoId: string) => {
    setEventosExpandidos(prev => {
      const nuevo = new Set(prev);
      if (nuevo.has(eventoId)) {
        nuevo.delete(eventoId);
      } else {
        nuevo.add(eventoId);
      }
      return nuevo;
    });
  };

  const getIconoTipo = (tipo: TipoEvento) => {
    switch (tipo) {
      case 'pago':
        return <DollarSign className="w-5 h-5 text-green-600" />;
      case 'distribucion':
        return <Divide className="w-5 h-5 text-blue-600" />;
      case 'cierre':
        return <FileX className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getColorTipo = (tipo: TipoEvento) => {
    switch (tipo) {
      case 'pago':
        return 'bg-green-50 border-green-200';
      case 'distribucion':
        return 'bg-blue-50 border-blue-200';
      case 'cierre':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-CR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      {/* Encabezado y filtros */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-gray-600" />
            Historial del Folio #{folioId}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Línea de tiempo de todas las operaciones realizadas
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Filtro por tipo */}
          <select
            value={filtroTipo || ''}
            onChange={(e) => filtrarPorTipo((e.target.value as TipoEvento) || null)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los eventos</option>
            <option value="pago">Solo pagos</option>
            <option value="distribucion">Solo distribuciones</option>
            <option value="cierre">Solo cierres</option>
          </select>
          
          {/* Botón de actualizar */}
          <button
            onClick={refrescar}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            title="Actualizar historial"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Lista de eventos */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          <p className="font-medium">Error al cargar el historial</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {eventos.length === 0 && !loading ? (
        <div className="text-center py-8 text-gray-500">
          <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No hay eventos en el historial</p>
          {filtroTipo && (
            <button
              onClick={() => filtrarPorTipo(null)}
              className="mt-2 text-blue-600 hover:text-blue-800"
            >
              Ver todos los eventos
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {eventos.map((evento) => (
            <div
              key={evento.id}
              className={`border rounded-lg p-4 transition-all ${getColorTipo(evento.tipo)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  {getIconoTipo(evento.tipo)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{evento.summary}</h4>
                      <span className="text-xs text-gray-500">
                        {formatearFecha(evento.fecha)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{evento.descripcion}</p>
                    {evento.usuario && (
                      <p className="text-xs text-gray-500 mt-1">Por: {evento.usuario}</p>
                    )}
                  </div>
                </div>
                
                {/* Botón para expandir detalles */}
                {evento.detalles && Object.keys(evento.detalles).length > 0 && (
                  <button
                    onClick={() => toggleEventoExpandido(evento.id)}
                    className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {eventosExpandidos.has(evento.id) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
              
              {/* Detalles expandidos */}
              {eventosExpandidos.has(evento.id) && evento.detalles && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <h5 className="text-xs font-medium text-gray-700 mb-2">Detalles:</h5>
                  <pre className="text-xs text-gray-600 bg-white p-2 rounded border overflow-x-auto">
                    {JSON.stringify(evento.detalles, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
          
          {/* Botón para cargar más */}
          {hasMore && (
            <div className="text-center pt-4">
              <button
                onClick={cargarMas}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin h-4 w-4 border-2 border-gray-600 border-t-transparent rounded-full mr-2"></div>
                    Cargando...
                  </div>
                ) : (
                  'Cargar más eventos'
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};