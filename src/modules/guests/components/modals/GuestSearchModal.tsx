import React, { useState } from 'react';
import { Search, Plus, User, Mail, Phone, MapPin } from 'lucide-react';
import { Modal } from '../../../../components/ui/Modal';
import { useGuests } from '../../hooks';
import type { Guest } from '../../../../types/core';

interface GuestSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGuest: (guest: Guest) => void;
  onCreateNew: () => void;
}

export const GuestSearchModal: React.FC<GuestSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectGuest,
  onCreateNew
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { guests, isSearching, searchGuests } = useGuests();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      searchGuests({ query });
    }
  };

  const handleGuestSelect = (guest: Guest) => {
    onSelectGuest(guest);
    onClose();
  };

  const handleCreateNew = () => {
    onCreateNew();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Buscar Huésped"
      size="lg"
    >
      <div className="space-y-6">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre, email o documento..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Create New Guest Button */}
        <button
          onClick={handleCreateNew}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus size={20} />
          Crear Nuevo Huésped
        </button>

        {/* Loading State */}
        {isSearching && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Buscando huéspedes...</p>
          </div>
        )}

        {/* Guest Results */}
        {!isSearching && guests.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">
              Resultados ({guests.length})
            </h3>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {guests.map((guest) => (
                <button
                  key={guest.id}
                  onClick={() => handleGuestSelect(guest)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleGuestSelect(guest);
                    }
                  }}
                  className="w-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-left"
                  aria-label={`Seleccionar huésped ${guest.firstName} ${guest.lastName}, correo ${guest.email}`}
                  type="button"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <User size={16} className="text-gray-500" />
                        <h4 className="font-semibold text-gray-900">
                          {guest.firstName} {guest.lastName}
                        </h4>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail size={14} />
                          {guest.email}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={14} />
                          {guest.phone}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={14} />
                          {guest.nationality}
                        </div>
                        <div className="text-xs text-gray-500">
                          {guest.documentType.toUpperCase()}: {guest.documentNumber}
                        </div>
                      </div>
                    </div>
                    
                    <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                      Seleccionar
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {!isSearching && searchQuery.length >= 2 && guests.length === 0 && (
          <div className="text-center py-8">
            <User size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 mb-4">
              No se encontraron huéspedes con "{searchQuery}"
            </p>
            <button
              onClick={handleCreateNew}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Crear Nuevo Huésped
            </button>
          </div>
        )}

        {/* Initial State */}
        {!isSearching && searchQuery.length < 2 && (
          <div className="text-center py-8">
            <Search size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600">
              Ingrese al menos 2 caracteres para buscar huéspedes
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};
