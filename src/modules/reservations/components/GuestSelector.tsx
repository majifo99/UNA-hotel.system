import React, { useState } from 'react';
import { Search, Plus, User, X } from 'lucide-react';
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
  const { guests } = useGuests();

  // Find selected guest
  const selectedGuest = guests.find((guest: Guest) => guest.id === selectedGuestId);

  // Filter guests based on search
  const filteredGuests = guests.filter((guest: Guest) =>
    guest.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guest.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guest.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guest.documentNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClearSelection = () => {
    onGuestSelect('');
    setSearchQuery('');
    setIsSearching(false);
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
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">
                  {selectedGuest.firstName} {selectedGuest.lastName}
                </h4>
                <p className="text-sm text-gray-600">{selectedGuest.email}</p>
                <p className="text-sm text-gray-600">{selectedGuest.phone}</p>
                <p className="text-xs text-gray-500">
                  {selectedGuest.documentType.toUpperCase()}: {selectedGuest.documentNumber}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsSearching(true)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
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
                className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <Search size={20} className="text-gray-400" />
                <span className="text-gray-600">Buscar huésped existente</span>
              </button>
              
              <button
                type="button"
                onClick={onCreateNewGuest}
                className="flex items-center justify-center gap-2 p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus size={20} />
                <span>Crear nuevo huésped</span>
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
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsSearching(false);
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>

              {searchQuery && (
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                  {filteredGuests.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {filteredGuests.map((guest: Guest) => (
                        <button
                          key={guest.id}
                          type="button"
                          onClick={() => {
                            onGuestSelect(guest.id);
                            setIsSearching(false);
                            setSearchQuery('');
                          }}
                          className="w-full p-3 text-left hover:bg-gray-50 flex items-center gap-3"
                        >
                          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {guest.firstName} {guest.lastName}
                            </div>
                            <div className="text-sm text-gray-600">{guest.email}</div>
                            <div className="text-xs text-gray-500">
                              {guest.documentType.toUpperCase()}: {guest.documentNumber}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No se encontraron huéspedes con "{searchQuery}"
                      <button
                        type="button"
                        onClick={onCreateNewGuest}
                        className="block w-full mt-2 text-green-600 hover:text-green-700 font-medium"
                      >
                        Crear nuevo huésped
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};
