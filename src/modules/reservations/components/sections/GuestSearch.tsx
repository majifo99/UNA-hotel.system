import React, { useState, useEffect } from 'react';
import type { Guest } from '../../types';
import { guestService } from '../../services/guestService';

interface GuestSearchProps {
  onGuestSelected: (guest: Guest | null) => void;
  onCreateNewGuest: () => void;
  selectedGuest: Guest | null;
}

export const GuestSearch: React.FC<GuestSearchProps> = ({
  onGuestSelected,
  onCreateNewGuest,
  selectedGuest
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Guest[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const performSearch = async () => {
      if (searchTerm.length < 2) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      setIsSearching(true);
      try {
        const results = await guestService.searchGuests(searchTerm);
        setSearchResults(results);
        setShowResults(true);
      } catch (error) {
        console.error('Error searching guests:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(performSearch, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleGuestSelect = (guest: Guest) => {
    setSearchTerm(`${guest.firstName} ${guest.lastName} - ${guest.documentNumber}`);
    setShowResults(false);
    onGuestSelected(guest);
  };

  const handleClearSelection = () => {
    setSearchTerm('');
    setShowResults(false);
    onGuestSelected(null);
  };

  if (selectedGuest) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-green-800">
              Huésped Seleccionado
            </h3>
            <div className="mt-2 space-y-1">
              <p className="text-green-700">
                <span className="font-medium">Nombre:</span> {selectedGuest.firstName} {selectedGuest.lastName}
              </p>
              <p className="text-green-700">
                <span className="font-medium">Email:</span> {selectedGuest.email}
              </p>
              <p className="text-green-700">
                <span className="font-medium">Teléfono:</span> {selectedGuest.phone}
              </p>
              <p className="text-green-700">
                <span className="font-medium">Documento:</span> {selectedGuest.documentNumber}
              </p>
            </div>
          </div>
          <button
            onClick={handleClearSelection}
            className="text-green-600 hover:text-green-800 font-medium"
          >
            Cambiar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          🔍 Buscar Huésped Existente
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, email, teléfono o documento..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          {isSearching && (
            <div className="absolute right-3 top-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
      </div>

      {/* Search Results */}
      {showResults && (
        <div className="border border-gray-200 rounded-md bg-white shadow-lg max-h-60 overflow-y-auto">
          {searchResults.length > 0 ? (
            <div className="py-2">
              {searchResults.map((guest) => (
                <button
                  key={guest.id}
                  onClick={() => handleGuestSelect(guest)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-gray-900">
                    {guest.firstName} {guest.lastName}
                  </div>
                  <div className="text-sm text-gray-600">
                    {guest.email} • {guest.phone}
                  </div>
                  <div className="text-sm text-gray-500">
                    {guest.documentNumber}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-3 text-gray-500 text-center">
              No se encontraron huéspedes
            </div>
          )}
        </div>
      )}

      {/* Create New Guest Button */}
      <div className="text-center">
        <button
          onClick={onCreateNewGuest}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Crear Nuevo Huésped
        </button>
      </div>

      {searchTerm.length > 0 && searchTerm.length < 2 && (
        <p className="text-sm text-gray-500 text-center">
          Escriba al menos 2 caracteres para buscar
        </p>
      )}
    </div>
  );
};
