/**
 * Reservation Template Manager
 * 
 * Permite guardar y cargar configuraciones comunes de reservas
 * Útil para grupos recurrentes, eventos corporativos, etc.
 */

import React, { useState, useEffect } from 'react';
import { Save, FolderOpen, Trash2, Star, Users, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export interface ReservationTemplate {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  usageCount: number;
  isFavorite: boolean;
  config: {
    numberOfAdults: number;
    numberOfChildren: number;
    numberOfInfants: number;
    roomTypes: string[];
    additionalServices: string[];
    specialRequests?: string;
    estimatedNights?: number;
  };
}

interface ReservationTemplateSelectorProps {
  onLoadTemplate: (template: ReservationTemplate) => void;
  currentFormData?: Partial<ReservationTemplate['config']>;
  className?: string;
}

export const ReservationTemplateSelector: React.FC<ReservationTemplateSelectorProps> = ({
  onLoadTemplate,
  currentFormData,
  className = '',
}) => {
  const [templates, setTemplates] = useState<ReservationTemplate[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');

  // Load templates from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('reservation_templates');
    if (stored) {
      try {
        setTemplates(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading templates:', error);
      }
    }
  }, []);

  // Save templates to localStorage
  const saveTemplates = (newTemplates: ReservationTemplate[]) => {
    localStorage.setItem('reservation_templates', JSON.stringify(newTemplates));
    setTemplates(newTemplates);
  };

  // Save current form as template
  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      toast.error('Ingrese un nombre para la plantilla');
      return;
    }

    if (!currentFormData) {
      toast.error('No hay datos para guardar');
      return;
    }

    const newTemplate: ReservationTemplate = {
      id: `template_${Date.now()}`,
      name: templateName.trim(),
      description: templateDescription.trim() || undefined,
      createdAt: new Date().toISOString(),
      usageCount: 0,
      isFavorite: false,
      config: {
        numberOfAdults: currentFormData.numberOfAdults || 1,
        numberOfChildren: currentFormData.numberOfChildren || 0,
        numberOfInfants: currentFormData.numberOfInfants || 0,
        roomTypes: currentFormData.roomTypes || [],
        additionalServices: currentFormData.additionalServices || [],
        specialRequests: currentFormData.specialRequests,
        estimatedNights: currentFormData.estimatedNights,
      },
    };

    const updated = [...templates, newTemplate];
    saveTemplates(updated);
    
    setTemplateName('');
    setTemplateDescription('');
    setIsSaveDialogOpen(false);
    
    toast.success(`Plantilla "${newTemplate.name}" guardada correctamente`);
  };

  // Load template
  const handleLoadTemplate = (template: ReservationTemplate) => {
    const updated = templates.map(t => 
      t.id === template.id 
        ? { ...t, usageCount: t.usageCount + 1 }
        : t
    );
    saveTemplates(updated);
    
    onLoadTemplate(template);
    setIsOpen(false);
    
    toast.success(`Plantilla "${template.name}" cargada`);
  };

  // Delete template
  const handleDeleteTemplate = (templateId: string, templateName: string) => {
    if (!confirm(`¿Eliminar plantilla "${templateName}"?`)) return;
    
    const updated = templates.filter(t => t.id !== templateId);
    saveTemplates(updated);
    
    toast.success(`Plantilla "${templateName}" eliminada`);
  };

  // Toggle favorite
  const handleToggleFavorite = (templateId: string) => {
    const updated = templates.map(t => 
      t.id === templateId 
        ? { ...t, isFavorite: !t.isFavorite }
        : t
    );
    saveTemplates(updated);
  };

  // Sort templates: favorites first, then by usage count
  const sortedTemplates = [...templates].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    return b.usageCount - a.usageCount;
  });

  return (
    <div className={className}>
      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsSaveDialogOpen(true)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          title="Guardar como plantilla"
        >
          <Save size={16} />
          <span className="hidden sm:inline">Guardar Plantilla</span>
        </button>
        
        <button
          onClick={() => setIsOpen(true)}
          disabled={templates.length === 0}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Cargar plantilla"
        >
          <FolderOpen size={16} />
          <span className="hidden sm:inline">Cargar Plantilla</span>
          {templates.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
              {templates.length}
            </span>
          )}
        </button>
      </div>

      {/* Save Dialog */}
      {isSaveDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Guardar Plantilla</h2>
            </div>
            
            <div className="px-6 py-4 space-y-4">
              <div>
                <label htmlFor="template-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la plantilla *
                </label>
                <input
                  id="template-name"
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Ej: Grupo corporativo estándar"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  maxLength={50}
                />
              </div>
              
              <div>
                <label htmlFor="template-description" className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción (opcional)
                </label>
                <textarea
                  id="template-description"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Ej: 2 adultos, 1 niño, suite con servicios premium"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  maxLength={200}
                />
              </div>
              
              {currentFormData && (
                <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                  <p className="text-xs font-medium text-gray-700 mb-2">Se guardará:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• {currentFormData.numberOfAdults || 0} adultos, {currentFormData.numberOfChildren || 0} niños, {currentFormData.numberOfInfants || 0} infantes</li>
                    {currentFormData.roomTypes && currentFormData.roomTypes.length > 0 && (
                      <li>• {currentFormData.roomTypes.length} tipo(s) de habitación</li>
                    )}
                    {currentFormData.additionalServices && currentFormData.additionalServices.length > 0 && (
                      <li>• {currentFormData.additionalServices.length} servicio(s) adicional(es)</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setIsSaveDialogOpen(false);
                  setTemplateName('');
                  setTemplateDescription('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveTemplate}
                disabled={!templateName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save size={16} />
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Dialog */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Cargar Plantilla</h2>
              <p className="text-sm text-gray-600 mt-1">Seleccione una plantilla guardada</p>
            </div>
            
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-3">
                {sortedTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900">{template.name}</h3>
                          {template.isFavorite && (
                            <Star size={14} className="text-yellow-500 fill-yellow-500" />
                          )}
                        </div>
                        {template.description && (
                          <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(template.id);
                          }}
                          className="p-1 text-gray-400 hover:text-yellow-500 transition-colors"
                          title={template.isFavorite ? 'Quitar de favoritos' : 'Marcar como favorito'}
                        >
                          <Star size={16} className={template.isFavorite ? 'fill-yellow-500' : ''} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTemplate(template.id, template.name);
                          }}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          title="Eliminar plantilla"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <Users size={12} />
                        {template.config.numberOfAdults + template.config.numberOfChildren + template.config.numberOfInfants} huéspedes
                      </span>
                      {template.config.estimatedNights && (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          ~{template.config.estimatedNights} noches
                        </span>
                      )}
                      <span>Usado {template.usageCount} veces</span>
                    </div>
                    
                    <button
                      onClick={() => handleLoadTemplate(template)}
                      className="w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Cargar Plantilla
                    </button>
                  </div>
                ))}
                
                {sortedTemplates.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <FolderOpen size={48} className="mx-auto mb-3 text-gray-300" />
                    <p>No hay plantillas guardadas</p>
                    <p className="text-sm mt-1">Guarde configuraciones frecuentes para reutilizarlas</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationTemplateSelector;
