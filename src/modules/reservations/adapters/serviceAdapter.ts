/**
 * Service Data Adapter
 * 
 * Handles conversion between legacy AdditionalService interfaces and the new consolidated interface.
 */

import type { AdditionalService } from '../../../types/core';

// Legacy AdditionalService interface
interface LegacyAdditionalService {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'food' | 'spa' | 'transport' | 'entertainment' | 'other';
}

/**
 * Convert legacy service data to new AdditionalService interface
 */
export function adaptLegacyService(legacyService: LegacyAdditionalService): AdditionalService {
  return {
    ...legacyService,
    isActive: true, // Default to active for existing services
  };
}

/**
 * Convert array of legacy services to new AdditionalService interface
 */
export function adaptLegacyServices(legacyServices: LegacyAdditionalService[]): AdditionalService[] {
  return legacyServices.map(adaptLegacyService);
}

/**
 * Convert new AdditionalService interface back to legacy format
 */
export function toLegacyService(service: AdditionalService): LegacyAdditionalService {
  return {
    id: service.id,
    name: service.name,
    description: service.description,
    price: service.price,
    category: service.category as LegacyAdditionalService['category'],
  };
}

export default {
  adaptLegacyService,
  adaptLegacyServices,
  toLegacyService,
};
