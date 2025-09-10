/**
 * Shortcut Guide Component
 * 
 * Provides contextual help for the new hierarchical shortcut system.
 * Shows users how to use the ALT+N → N pattern for navigation.
 */

import { useState } from 'react';
import { 
  Keyboard, 
  X,
  Building2,
  Calendar,
  Bed,
} from 'lucide-react';

interface ShortcutGuideProps {
  className?: string;
}

/**
 * Shortcut examples for user education
 */
const SHORTCUT_EXAMPLES = [
  {
    module: 'Front Desk',
    icon: Building2,
    key: '2',
    description: 'ALT+2 → Operaciones Front Desk',
    children: [
      { key: '1', action: 'Check-in', description: 'ALT+2, luego 1' },
      { key: '2', action: 'Check-out', description: 'ALT+2, luego 2' },
      { key: '3', action: 'Calendario', description: 'ALT+2, luego 3' },
      { key: '4', action: 'Reportes', description: 'ALT+2, luego 4' },
    ]
  },
  {
    module: 'Reservaciones',
    icon: Calendar,
    key: '3',
    description: 'ALT+3 → Gestión de Reservas',
    children: [
      { key: '1', action: 'Nueva Reserva', description: 'ALT+3, luego 1' },
      { key: '2', action: 'Buscar', description: 'ALT+3, luego 2' },
      { key: '3', action: 'Reportes', description: 'ALT+3, luego 3' },
    ]
  },
  {
    module: 'Huéspedes',
    icon: Bed,
    key: '5',
    description: 'ALT+5 → Gestión Centralizada',
    children: [
      { key: '1', action: 'Gestión Completa', description: 'ALT+5, luego 1' },
      { key: '2', action: 'Crear Directo', description: 'ALT+5, luego 2' },
      { key: '3', action: 'Reportes', description: 'ALT+5, luego 3' },
    ]
  },
];

export function ShortcutGuide({ className = '' }: ShortcutGuideProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 px-3 py-2 text-white/60 hover:text-white/80 transition-colors ${className}`}
        title="Guía de atajos de teclado"
      >
        <Keyboard className="w-4 h-4" />
        <span className="text-sm">Atajos</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Keyboard className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Guía de Atajos de Teclado
            </h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Quick Access */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Acceso Rápido
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="bg-gray-200 px-2 py-1 rounded font-mono text-sm">ALT+1</div>
                <span className="text-gray-700">Dashboard Principal</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="bg-gray-200 px-2 py-1 rounded font-mono text-sm">ALT+K</div>
                <span className="text-gray-700">Paleta de Comandos</span>
              </div>
            </div>
          </div>

          {/* Hierarchical Navigation */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Navegación Jerárquica
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Usa <strong>ALT + número</strong> para acceder a un módulo, luego presiona otro número para la sub-opción.
            </p>
            
            <div className="space-y-4">
              {SHORTCUT_EXAMPLES.map((example) => (
                <div key={example.key} className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                      <example.icon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{example.module}</div>
                      <div className="text-sm text-gray-500">{example.description}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-11">
                    {example.children.map((child) => (
                      <div key={child.key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-700">{child.action}</span>
                        <span className="text-xs text-gray-500 font-mono">{child.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">💡 Consejos:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Los atajos funcionan desde cualquier página</li>
              <li>• Usa <kbd className="bg-blue-200 px-1 rounded">ALT+K</kbd> para buscar cuando no recuerdes un atajo</li>
              <li>• Los módulos principales (ALT+2-9) muestran sus sub-opciones automáticamente</li>
              <li>• Los números 1-4 dentro de cada módulo siguen un patrón consistente</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Presiona <kbd className="bg-gray-200 px-1 rounded">ESC</kbd> para cerrar esta guía
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook for managing shortcut guide state
 */
export function useShortcutGuide() {
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const openGuide = () => setIsGuideOpen(true);
  const closeGuide = () => setIsGuideOpen(false);

  return {
    isGuideOpen,
    openGuide,
    closeGuide,
  };
}
