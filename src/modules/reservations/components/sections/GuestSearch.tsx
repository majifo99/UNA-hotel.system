import React from 'react';
import type { Guest } from '../../../../types/core';

interface GuestSearchProps {
  onGuestSelected: (guest: Guest | null) => void;
  onCreateNewGuest: () => void;
  selectedGuest: Guest | null;
}

// Este componente está siendo reemplazado por el sistema de modales centralizado
// Ubicado en: src/components/modals/GuestSearchModal.tsx
export const GuestSearch: React.FC<GuestSearchProps> = ({ 
  onGuestSelected, 
  onCreateNewGuest
}) => {
  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <p className="text-yellow-800 mb-3">
        ⚠️ Este componente está siendo migrado al sistema de modales centralizado.
        <br />
        Nuevo componente: <code>src/components/modals/GuestSearchModal.tsx</code>
      </p>
      
      <div className="flex gap-3">
        <button
          onClick={() => onCreateNewGuest()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Crear Nuevo Huésped
        </button>
        
        <button
          onClick={() => onGuestSelected(null)}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Buscar Huésped Existente
        </button>
      </div>
    </div>
  );
};
