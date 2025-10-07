/**
 * 🧾 Componente: FacturacionResumen
 * =================================
 * Muestra el resumen de facturas generadas por responsable.
 * Lista facturas, permite descargas y visualización de estado.
 */

import React from 'react';
import { FileText, Download, CheckCircle, Clock, XCircle, Eye } from 'lucide-react';
import type { Factura } from '../types/folioTypes';

interface FacturacionResumenProps {
  facturas: Factura[];
  loading?: boolean;
  onDescargarPDF?: (idFactura: string) => void;
  onVerDetalle?: (factura: Factura) => void;
  className?: string;
}

/**
 * Configuración de estados de factura
 */
const ESTADO_CONFIG = {
  borrador: {
    label: 'Borrador',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    icon: <Clock className="w-4 h-4" />
  },
  emitida: {
    label: 'Emitida',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: <FileText className="w-4 h-4" />
  },
  pagada: {
    label: 'Pagada',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: <CheckCircle className="w-4 h-4" />
  },
  anulada: {
    label: 'Anulada',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    icon: <XCircle className="w-4 h-4" />
  }
};

export const FacturacionResumen: React.FC<FacturacionResumenProps> = ({
  facturas,
  loading,
  onDescargarPDF,
  onVerDetalle,
  className = ''
}) => {
  if (loading) {
    return (
      <div className={`space-y-3 ${className}`}>
        {[1, 2].map(i => (
          <div key={i} className="animate-pulse bg-gray-100 rounded-lg p-4">
            <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
            <div className="h-6 bg-gray-300 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (facturas.length === 0) {
    return (
      <div className={`text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300 ${className}`}>
        <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
        <h4 className="text-lg font-medium text-gray-900 mb-1">Sin facturas generadas</h4>
        <p className="text-sm text-gray-600">
          Las facturas se generarán al completar el proceso de división de cargos.
        </p>
      </div>
    );
  }

  const totalFacturado = facturas
    .filter(f => f.estado !== 'anulada')
    .reduce((sum, f) => sum + f.total, 0);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Resumen general */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Facturas Generadas</h4>
            <p className="text-sm text-gray-600">
              {facturas.filter(f => f.estado !== 'anulada').length} factura(s) activa(s)
            </p>
          </div>
          <div className="text-right">
            <span className="block text-xs text-gray-600 mb-1">Total Facturado</span>
            <span className="text-2xl font-bold text-blue-700">
              ${totalFacturado.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Lista de facturas */}
      <div className="space-y-2">
        {facturas.map((factura) => {
          const config = ESTADO_CONFIG[factura.estado];
          
          return (
            <div
              key={factura.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <FileText className="w-5 h-5 text-blue-600 mr-2" />
                    <h5 className="font-medium text-gray-900">
                      {factura.numero_factura}
                    </h5>
                    <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${config.color} ${config.bgColor} flex items-center`}>
                      {config.icon}
                      <span className="ml-1">{config.label}</span>
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>
                      <span className="font-medium">Responsable:</span>{' '}
                      {factura.nombre_responsable}
                      {factura.razon_social && ` (${factura.razon_social})`}
                    </div>
                    {factura.nit && (
                      <div>
                        <span className="font-medium">NIT:</span> {factura.nit}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Fecha:</span>{' '}
                      {new Date(factura.fecha_emision).toLocaleDateString()}
                    </div>
                    {factura.metodo_pago && (
                      <div>
                        <span className="font-medium">Método de pago:</span> {factura.metodo_pago}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right ml-4">
                  <div className="mb-2">
                    <span className="block text-xs text-gray-600">Subtotal</span>
                    <span className="text-sm font-medium">${factura.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="mb-2">
                    <span className="block text-xs text-gray-600">Impuestos</span>
                    <span className="text-sm font-medium">${factura.impuestos.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <span className="block text-xs text-gray-600">Total</span>
                    <span className="text-lg font-bold text-blue-700">
                      ${factura.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cargos incluidos */}
              {factura.cargos.length > 0 && (
                <div className="mb-3 pt-3 border-t">
                  <span className="text-xs font-medium text-gray-700 block mb-2">
                    Cargos incluidos ({factura.cargos.length}):
                  </span>
                  <div className="space-y-1">
                    {factura.cargos.slice(0, 3).map((cargo) => (
                      <div key={cargo.id} className="text-xs text-gray-600 flex justify-between">
                        <span>• {cargo.descripcion}</span>
                        <span className="font-medium">${cargo.subtotal.toFixed(2)}</span>
                      </div>
                    ))}
                    {factura.cargos.length > 3 && (
                      <div className="text-xs text-blue-600">
                        +{factura.cargos.length - 3} cargo(s) más...
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Acciones */}
              {factura.estado !== 'anulada' && (
                <div className="flex gap-2 pt-3 border-t">
                  {onVerDetalle && (
                    <button
                      onClick={() => onVerDetalle(factura)}
                      className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors flex items-center justify-center"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver Detalle
                    </button>
                  )}
                  {onDescargarPDF && factura.pdf_url && (
                    <button
                      onClick={() => onDescargarPDF(factura.id)}
                      className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Descargar PDF
                    </button>
                  )}
                </div>
              )}

              {factura.estado === 'anulada' && (
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center text-sm text-red-600">
                    <XCircle className="w-4 h-4 mr-2" />
                    Esta factura ha sido anulada
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
