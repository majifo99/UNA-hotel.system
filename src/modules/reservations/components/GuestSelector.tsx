import React, { useState, useEffect } from 'react';
import { Search, Plus, User, X, Loader2 } from 'lucide-react';
import { useGuests } from '../../guests/hooks';
import type { Guest } from '../../../types/core';

interface GuestSelectorProps {
  selectedGuestId?: string;
  onGuestSelect: (guestId: string) => void;
  onCreateNewGuest: () => void;
  error?: string;
}

export const GuestSelector: React.FC<GuestSelectorProps> = ({
  selectedGuestId,
  onGuestSelect,
  onCreateNewGuest,
  error
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  const { guests, isSearching: isLoadingGuests, searchGuests } = useGuests();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      searchGuests({ query: debouncedQuery });
    }
  }, [debouncedQuery, searchGuests]);

  // Find selected guest
  const selectedGuest = guests.find((guest: Guest) => guest.id === selectedGuestId);

  const handleClearSelection = () => {
    onGuestSelect('');
    setSearchQuery('');
    setIsSearching(false);
  };

  const handleGuestSelect = (guestId: string) => {
    onGuestSelect(guestId);
    setIsSearching(false);
    setSearchQuery('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Huésped *
        </label>
        {selectedGuest && (
          <button
            type="button"
            onClick={handleClearSelection}
            className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            <X size={16} />
            Limpiar selección
          </button>
        )}
      </div>

      {selectedGuest ? (
        // Show selected guest
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-md">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-lg">
                  {selectedGuest.firstName} {selectedGuest.firstLastName} {selectedGuest.secondLastName || ''}
                </h4>
                <p className="text-sm text-gray-600 mt-0.5">📧 {selectedGuest.email}</p>
                <p className="text-sm text-gray-600">📱 {selectedGuest.phone}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedGuest.documentType.toUpperCase()}: {selectedGuest.documentNumber}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsSearching(true)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Cambiar huésped
            </button>
          </div>
        </div>
      ) : (
        // Show search interface
        <div className="space-y-3">
          {!isSearching ? (
            // Initial buttons
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsSearching(true)}
                className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
              >
                <Search size={20} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                <span className="text-gray-600 group-hover:text-gray-800 font-medium">Buscar huésped existente</span>
              </button>
              
              <button
                type="button"
                onClick={onCreateNewGuest}
                className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Plus size={20} />
                <span className="font-medium">Crear nuevo huésped</span>
              </button>
            </div>
          ) : (
            // Search interface
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, email o documento..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    autoFocus
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsSearching(false);
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={onCreateNewGuest}
                  className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Plus size={18} />
                  Nuevo
                </button>
              </div>

              {/* Loading state */}
              {isLoadingGuests && searchQuery.length >= 2 && (
                <div className="flex items-center justify-center py-8 text-gray-500">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  <span>Buscando huéspedes...</span>
                </div>
              )}

              {/* Search results */}
              {!isLoadingGuests && searchQuery.length >= 2 && (
                <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-xl shadow-sm">
                  {guests.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {guests.map((guest: Guest) => (
                        <button
                          key={guest.id}
                          type="button"
                          onClick={() => handleGuestSelect(guest.id)}
                          className="w-full p-4 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors group"
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center flex-shrink-0 group-hover:from-blue-600 group-hover:to-blue-700 transition-all">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {guest.firstName} {guest.firstLastName} {guest.secondLastName || ''}
                            </div>
                            <div className="text-sm text-gray-600 mt-0.5">{guest.email}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {guest.documentType.toUpperCase()}: {guest.documentNumber} • {guest.phone}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <div className="text-gray-400 mb-2">
                        <Search className="w-12 h-12 mx-auto opacity-50" />
                      </div>
                      <p className="text-gray-600 mb-4">
                        No se encontraron huéspedes con "{searchQuery}"
                      </p>
                      <button
                        type="button"
                        onClick={onCreateNewGuest}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
                      >
                        <Plus size={18} />
                        Crear nuevo huésped
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Hint message */}
              {searchQuery.length > 0 && searchQuery.length < 2 && (
                <p className="text-sm text-gray-500 text-center py-2">
                  Escribe al menos 2 caracteres para buscar
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3">
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
      )}
    </div>
  );
};
