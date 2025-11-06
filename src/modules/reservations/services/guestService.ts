/**
 * GuestService
 * 
 * Servicio básico para operaciones relacionadas con huéspedes/clientes.
 * Proporciona funciones para validar y obtener información de clientes.
 */

import type { Guest } from '../../../types/core/domain';
import apiClient from '../lib/apiClient';

/**
 * Respuesta del API para cliente
 */
interface ApiCliente {
  id_cliente: number;
  nombre: string;
  email: string;
  telefono?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Servicio de gestión de huéspedes
 */
export class GuestService {
  
  /**
   * Obtiene un cliente por ID
   * GET /clientes/{id}
   */
  async getById(id: number): Promise<Guest | null> {
    try {
      const res = await apiClient.get<ApiCliente>(`/clientes/${id}`);
      
      if (!res.data) {
        return null;
      }

      return this.mapApiClienteToGuest(res.data);
    } catch (error) {
      console.error(`[GuestService] Error fetching client ${id}:`, error);
      return null;
    }
  }

  /**
   * Valida que un ID de cliente sea válido y exista
   */
  async validateGuestId(guestId: string | number): Promise<{ isValid: boolean; id: number; guest?: Guest }> {
    const parsedId = typeof guestId === 'string' ? parseInt(guestId, 10) : guestId;
    
    if (Number.isNaN(parsedId) || parsedId <= 0) {
      return { isValid: false, id: parsedId };
    }

    const guest = await this.getById(parsedId);
    
    return {
      isValid: guest !== null,
      id: parsedId,
      guest: guest || undefined
    };
  }

  /**
   * Map ApiCliente to Guest
   */
  private mapApiClienteToGuest(api: ApiCliente): Guest {
    // Parse full name if provided in single field
    const nameParts = api.nombre.split(' ');
    const firstName = nameParts[0] || 'Nombre';
    const firstLastName = nameParts[1] || 'Apellido';
    const secondLastName = nameParts[2] || undefined;

    return {
      id: api.id_cliente.toString(),
      firstName,
      firstLastName,
      secondLastName,
      email: api.email,
      phone: api.telefono || '',
      documentType: 'id_card', // Default value - would need more backend data
      documentNumber: '', // Would need more backend data
      nationality: 'CR', // Default to Costa Rica
      createdAt: api.created_at,
      updatedAt: api.updated_at,
      isActive: true, // Default to active
    };
  }
}

export const guestService = new GuestService();