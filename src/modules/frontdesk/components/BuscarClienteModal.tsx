/**
 * Modal de Búsqueda de Cliente
 * 
 * Permite buscar clientes existentes por nombre, documento o email
 * y seleccionarlos para autocompletar el formulario
 */

import React, { useState, useEffect } from 'react';
import { X, Search, User, Mail, Phone, Loader2, AlertCircle } from 'lucide-react';
import apiClient from '../../../services/apiClient';

interface Cliente {
  id_cliente: number;
  nombre: string;
  apellido1: string;
  apellido2?: string;
  email?: string;
  telefono?: string;
  numero_doc?: string;
  nacionalidad?: string;
}

interface BuscarClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCliente: (cliente: Cliente) => void;
}

export const BuscarClienteModal: React.FC<BuscarClienteModalProps> = ({
  isOpen,
  onClose,
  onSelectCliente
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'nombre' | 'documento' | 'email'>('nombre');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Reset al abrir/cerrar
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setClientes([]);
      setError(null);
      setHasSearched(false);
    }
  }, [isOpen]);

  // Búsqueda automática mientras escribe (debounced)
  useEffect(() => {
    if (searchTerm.length < 2) {
      setClientes([]);
      setHasSearched(false);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, searchType]);

  const handleSearch = async () => {
    if (searchTerm.length < 2) {
      setError('Ingrese al menos 2 caracteres para buscar');
      return;
    }

    setIsSearching(true);
    setError(null);
    setHasSearched(true);

    try {
      // Usar el endpoint de lookup de clientes
      const response = await apiClient.get('/frontdesk/clientes/_lookup', {
        params: {
          q: searchTerm,
          tipo: searchType
        }
      });

      setClientes(response.data.clientes || []);
      
      if (response.data.clientes?.length === 0) {
        setError('No se encontraron clientes con ese criterio');
      }
    } catch (err) {
      console.error('Error al buscar clientes:', err);
      setError('Error al buscar clientes. Intente nuevamente.');
      setClientes([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectCliente = (cliente: Cliente) => {
    onSelectCliente(cliente);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Search className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Buscar Cliente Existente</h2>
              <p className="text-sm text-gray-500">Ingrese nombre, documento o email</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Form */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex gap-3">
            {/* Tipo de búsqueda */}
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="nombre">Nombre</option>
              <option value="documento">Documento</option>
              <option value="email">Email</option>
            </select>

            {/* Input de búsqueda */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Buscar por ${searchType}...`}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
            </div>

            <button
              onClick={handleSearch}
              disabled={isSearching || searchTerm.length < 2}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Buscar
                </>
              )}
            </button>
          </div>

          {/* Ayuda */}
          <p className="text-xs text-gray-500 mt-2">
            💡 La búsqueda se realiza automáticamente mientras escribes
          </p>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {isSearching && (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <p className="text-gray-600">Buscando clientes...</p>
              </div>
            </div>
          )}

          {!isSearching && !error && clientes.length === 0 && hasSearched && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <User className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">No se encontraron clientes</p>
              <p className="text-sm mt-1">Intenta con otro criterio de búsqueda</p>
            </div>
          )}

          {!isSearching && !error && clientes.length === 0 && !hasSearched && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Search className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">Busca un cliente existente</p>
              <p className="text-sm mt-1">Ingresa al menos 2 caracteres para comenzar</p>
            </div>
          )}

          {!isSearching && clientes.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                {clientes.length} {clientes.length === 1 ? 'cliente encontrado' : 'clientes encontrados'}
              </p>
              <div className="space-y-2">
                {clientes.map((cliente) => (
                  <button
                    key={cliente.id_cliente}
                    onClick={() => handleSelectCliente(cliente)}
                    className="w-full p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-100 transition-colors">
                          <User className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-900">
                            {cliente.nombre} {cliente.apellido1} {cliente.apellido2 || ''}
                          </h3>
                          <div className="mt-2 space-y-1">
                            {cliente.email && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail className="w-4 h-4" />
                                <span>{cliente.email}</span>
                              </div>
                            )}
                            {cliente.telefono && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="w-4 h-4" />
                                <span>{cliente.telefono}</span>
                              </div>
                            )}
                            {cliente.numero_doc && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span className="font-medium">Doc:</span>
                                <span>{cliente.numero_doc}</span>
                              </div>
                            )}
                            {cliente.nacionalidad && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span className="font-medium">País:</span>
                                <span>{cliente.nacionalidad}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded group-hover:bg-blue-200">
                        ID: {cliente.id_cliente}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
