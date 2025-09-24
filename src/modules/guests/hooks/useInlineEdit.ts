import { useState, useCallback } from 'react';
import type { UpdateGuestData } from '../types';

export interface UseInlineEditOptions {
  onSave: (data: Partial<UpdateGuestData>) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<UpdateGuestData>;
  isUpdating?: boolean;
}

export const useInlineEdit = ({
  onSave,
  onCancel,
  initialData = {},
  isUpdating = false
}: UseInlineEditOptions) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<UpdateGuestData>>(initialData);

  const handleEdit = useCallback((fieldName: string) => {
    setEditingField(fieldName);
  }, []);

  const handleCancel = useCallback(() => {
    setEditingField(null);
    setEditValues(initialData);
    onCancel?.();
  }, [initialData, onCancel]);

  const handleSave = useCallback(async () => {
    try {
      await onSave(editValues);
      setEditingField(null);
    } catch (error) {
      console.error('Error saving:', error);
    }
  }, [editValues, onSave]);

  const handleInputChange = useCallback((field: string, value: any) => {
    setEditValues(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleNestedInputChange = useCallback((parentField: string, field: string, value: any) => {
    setEditValues(prev => ({
      ...prev,
      [parentField]: {
        ...(prev[parentField as keyof UpdateGuestData] as object || {}),
        [field]: value
      }
    }));
  }, []);

  const handleArrayInputChange = useCallback((field: string, value: string) => {
    const arrayValue = value.split(',').map(item => item.trim()).filter(item => item.length > 0);
    setEditValues(prev => ({
      ...prev,
      [field]: arrayValue
    }));
  }, []);

  const updateEditValues = useCallback((newData: Partial<UpdateGuestData>) => {
    setEditValues(newData);
  }, []);

  return {
    editingField,
    editValues,
    isEditing: (field: string) => editingField === field,
    handleEdit,
    handleCancel,
    handleSave,
    handleInputChange,
    handleNestedInputChange,
    handleArrayInputChange,
    updateEditValues,
    isUpdating
  };
};