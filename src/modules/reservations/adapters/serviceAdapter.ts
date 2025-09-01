import type { AdditionalService } from '../../../types/core/domain';

// Legacy service interface (from old adapters)
interface LegacyAdditionalService {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'food' | 'spa' | 'transport' | 'entertainment' | 'other';
  isActive: boolean;
}

/**
 * Adapts legacy additional services to the new domain format
 */
export const adaptLegacyServices = (legacyServices: LegacyAdditionalService[]): AdditionalService[] => {
  return legacyServices.map((service): AdditionalService => ({
    id: service.id,
    name: service.name,
    description: service.description,
    price: service.price,
    category: service.category === 'food' ? 'restaurant' : service.category,
    isActive: service.isActive,
  }));
};
