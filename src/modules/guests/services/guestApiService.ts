import type { 
  Guest, 
  CreateGuestData, 
  UpdateGuestData, 
  GuestSearchFilters,
  GuestListResponse 
} from '../types';

/**
 * Guest API Service - Laravel Backend Integration
 */
class GuestApiService {
  private baseUrl: string;
  private apiBaseUrl: string;

  constructor() {
    this.baseUrl = '/clientes';
    this.apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  }

  /**
   * Generic request method
   */
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.apiBaseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Request failed:', error);
      throw error;
    }
  }

  /**
   * POST request
   */
  private async post(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * GET request
   */
  private async get(endpoint: string) {
    return this.request(endpoint, {
      method: 'GET',
    });
  }

  /**
   * Create a new guest
   */
  async createGuest(guestData: CreateGuestData): Promise<Guest> {
    try {
      // Transform frontend data to backend format
      const backendData: Record<string, any> = {
        nombre: guestData.firstName,
        apellido1: guestData.firstLastName,
        apellido2: guestData.secondLastName || null,
        email: guestData.email,
        telefono: guestData.phone,
        id_tipo_doc: this.mapDocumentTypeToId(guestData.documentType),
        numero_doc: guestData.documentNumber,
        nacionalidad: guestData.nationality,
        
        // Campos opcionales - incluimos si están disponibles
        direccion: guestData.address?.street || null,
        fecha_nacimiento: guestData.dateOfBirth || guestData.birthDate || null,
        genero: this.mapGenderToBackend(guestData.gender),
        es_vip: guestData.vipStatus || false,
        notas_personal: guestData.notes || null,
        
        // Campos adicionales
        ciudad: guestData.city || guestData.address?.city || null,
        pais: guestData.country || guestData.address?.country || null,
        codigo_postal: guestData.address?.postalCode || null,
        estado_provincia: guestData.address?.state || null,
        idioma_preferido: guestData.preferredLanguage || null,
        
        // Información como JSON
        alergias: guestData.allergies?.length ? JSON.stringify(guestData.allergies) : null,
        restricciones_dieteticas: guestData.dietaryRestrictions?.length ? JSON.stringify(guestData.dietaryRestrictions) : null,
        notas_medicas: guestData.medicalNotes || null,
        contacto_emergencia: guestData.emergencyContact?.name ? JSON.stringify(guestData.emergencyContact) : null,
        preferencias_comunicacion: guestData.communicationPreferences ? JSON.stringify(guestData.communicationPreferences) : null,
        programa_lealtad: guestData.loyaltyProgram?.memberId ? JSON.stringify(guestData.loyaltyProgram) : null,
        preferencias_habitacion: guestData.roomPreferences ? JSON.stringify(guestData.roomPreferences) : null
      };
      
      const response = await this.post(this.baseUrl, backendData);
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      return this.transformGuestFromBackend(response.data);
    } catch (error) {
      console.error('Error creating guest:', error);
      throw new Error('Error al crear el huésped');
    }
  }

  /**
   * List all guests with optional filters
   */
  async getGuests(filters?: GuestSearchFilters): Promise<GuestListResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.query) params.append('search', filters.query);
      if (filters?.nationality) params.append('nationality', filters.nationality);
      if (filters?.documentType) params.append('document_type', filters.documentType);

      const url = params.toString() ? `${this.baseUrl}?${params}` : this.baseUrl;
      const response = await this.get(url);
      
      if (!response.data) {
        throw new Error('No data received from server');
      }

      // Handle Laravel pagination response structure
      const result = response.data;
      let rawGuestList: any[] = [];
      let paginationInfo = {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 1
      };
      
      if (result.data && Array.isArray(result.data)) {
        // Laravel paginated response
        rawGuestList = result.data;
        
        // Extract pagination info from Laravel meta
        if (result.meta) {
          paginationInfo = {
            page: result.meta.current_page || 1,
            limit: result.meta.per_page || 20,
            total: result.meta.total || rawGuestList.length,
            totalPages: result.meta.last_page || 1
          };
        }
      } else if (Array.isArray(result)) {
        // Direct array response
        rawGuestList = result;
        paginationInfo.total = rawGuestList.length;
      }

      // Transform backend data to frontend format
      const guestList = rawGuestList.map(this.transformGuestFromBackend.bind(this));
      
      return {
        success: true,
        data: guestList,
        timestamp: new Date().toISOString(),
        pagination: paginationInfo,
        guests: guestList,
        total: paginationInfo.total,
        page: paginationInfo.page,
        limit: paginationInfo.limit
      };
    } catch (error) {
      console.error('Error fetching guests:', error);
      throw new Error('Error al obtener la lista de huéspedes');
    }
  }

  /**
   * Search guests with filters
   */
  async searchGuests(filters: GuestSearchFilters): Promise<GuestListResponse> {
    return this.getGuests(filters);
  }

  /**
   * Get guest by ID
   */
  async getGuestById(id: string): Promise<Guest> {
    try {
      const response = await this.get(`${this.baseUrl}/${id}`);
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      // El backend envía el guest individual envuelto en otro objeto "data"
      const guestData = response.data.data || response.data;
      
      return this.transformGuestFromBackend(guestData);
    } catch (error) {
      console.error('Error fetching guest:', error);
      throw new Error('Error al obtener el huésped');
    }
  }

  /**
   * Update an existing guest using Laravel wizard system
   */
  async updateGuest(id: string, guestData: UpdateGuestData): Promise<Guest> {
    try {
      // El backend usa un sistema de wizard con múltiples endpoints
      let successfulUpdates = 0;
      let errors: string[] = [];
      
      // Variable para guardar el contacto de emergencia y enviarlo al final
      let emergencyContactToUpdate: any = null;
      if (guestData.emergencyContact?.name && guestData.emergencyContact.name.trim() !== '') {
        emergencyContactToUpdate = guestData.emergencyContact;
      }
      
      // 1. Actualizar información básica (perfil-viaje)
      if (guestData.firstName || guestData.firstLastName || guestData.email || guestData.phone) {
        try {
          const profileData: Record<string, any> = {
            nombre: guestData.firstName,
            apellido1: guestData.firstLastName,
            apellido2: guestData.secondLastName || null,
            email: guestData.email,
            telefono: guestData.phone,
            id_tipo_doc: this.mapDocumentTypeToId(guestData.documentType),
            numero_doc: guestData.documentNumber,
            nacionalidad: guestData.nationality || 'Costa Rica',
          };
          
          // Agregar campos opcionales solo si existen
          if (guestData.dateOfBirth || guestData.birthDate) {
            profileData.fecha_nacimiento = guestData.dateOfBirth || guestData.birthDate;
          }
          if (guestData.gender) {
            profileData.genero = this.mapGenderToBackend(guestData.gender);
          }
          if (guestData.address?.street) {
            profileData.direccion = guestData.address.street;
          }
          if (guestData.city || guestData.address?.city) {
            profileData.ciudad = guestData.city || guestData.address?.city;
          }
          if (guestData.country || guestData.address?.country) {
            profileData.pais = guestData.country || guestData.address?.country;
          }
          if (guestData.address?.postalCode) {
            profileData.codigo_postal = guestData.address.postalCode;
          }
          if (guestData.address?.state) {
            profileData.estado_provincia = guestData.address.state;
          }
          if (guestData.preferredLanguage) {
            profileData.idioma_preferido = guestData.preferredLanguage;
          }
          
          await this.request(`/clientes/${id}/wizard/perfil-viaje`, {
            method: 'PATCH',
            body: JSON.stringify(profileData),
          });
          successfulUpdates++;
        } catch (error) {
          console.error('❌ Failed to update profile:', error);
          errors.push('Profile update failed');
        }
      }
      
      // 2. Actualizar información médica y de salud
      if (guestData.allergies || guestData.dietaryRestrictions || guestData.medicalNotes) {
        try {
          const healthData: Record<string, any> = {};
          
          if (guestData.allergies?.length) {
            healthData.alergias = JSON.stringify(guestData.allergies);
          }
          if (guestData.dietaryRestrictions?.length) {
            healthData.restricciones_dieteticas = JSON.stringify(guestData.dietaryRestrictions);
          }
          if (guestData.medicalNotes) {
            healthData.notas_medicas = guestData.medicalNotes;
          }
          
          await this.request(`/clientes/${id}/wizard/salud`, {
            method: 'PATCH',
            body: JSON.stringify(healthData),
          });
          successfulUpdates++;
        } catch (error) {
          console.error('❌ Failed to update health information:', error);
          errors.push('Health information update failed');
        }
      }
      
      // 3. Actualizar preferencias de habitación
      if (guestData.roomPreferences || guestData.vipStatus !== undefined || guestData.notes) {
        try {
          const roomData: Record<string, any> = {};
          
          if (guestData.roomPreferences && Object.keys(guestData.roomPreferences).length > 0) {
            roomData.preferencias_habitacion = JSON.stringify(guestData.roomPreferences);
          }
          if (guestData.vipStatus !== undefined) {
            roomData.es_vip = guestData.vipStatus;
          }
          if (guestData.notes) {
            roomData.notas_personal = guestData.notes;
          }
          if (guestData.communicationPreferences && Object.keys(guestData.communicationPreferences).length > 0) {
            roomData.preferencias_comunicacion = JSON.stringify(guestData.communicationPreferences);
          }
          if (guestData.loyaltyProgram?.memberId) {
            roomData.programa_lealtad = JSON.stringify(guestData.loyaltyProgram);
          }
          
          await this.request(`/clientes/${id}/wizard/habitacion`, {
            method: 'PATCH',
            body: JSON.stringify(roomData),
          });
          successfulUpdates++;
        } catch (error) {
          console.error('❌ Failed to update room preferences:', error);
          errors.push('Room preferences update failed');
        }
      }
      
      if (errors.length > 0) {
        console.warn('⚠️ Some updates failed:', errors);
      }
      
      // 4. FINAL: Actualizar contacto de emergencia (después de guardar toda la info)
      if (emergencyContactToUpdate) {
        try {
          // Enviar los campos directamente, no como JSON serializado
          const emergencyData = {
            name: emergencyContactToUpdate.name || '',
            relationship: emergencyContactToUpdate.relationship || '',
            phone: emergencyContactToUpdate.phone || '',
            email: emergencyContactToUpdate.email || ''
          };
          
          await this.request(`/clientes/${id}/wizard/emergencia`, {
            method: 'PATCH',
            body: JSON.stringify(emergencyData),
          });
          successfulUpdates++;
        } catch (error) {
          console.error('❌ Failed to update emergency contact:', error);
          errors.push('Emergency contact update failed');
        }
      }
      
      // Después de todas las actualizaciones, obtener el guest actualizado
      return await this.getGuestById(id);
      
    } catch (error) {
      console.error('❌ Failed to update guest:', error);
      console.error('❌ Error details:', error);
      throw new Error('Error al actualizar el huésped: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  /**
   * Delete a guest
   */
  async deleteGuest(id: string): Promise<void> {
    try {
      await this.request(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting guest:', error);
      throw new Error('Error al eliminar el huésped');
    }
  }

  /**
   * Map frontend document type to Laravel tipo_doc ID
   */
  private mapDocumentTypeToId(documentType?: string): number {
    const documentTypeMap: Record<string, number> = {
      'id_card': 1,    // Cédula de identidad
      'passport': 2,   // Pasaporte
      'license': 3,    // Licencia de conducir
      'otros': 4       // Otros documentos
    };
    
    return documentTypeMap[documentType || 'id_card'] || 1;
  }

  /**
   * Map frontend gender to backend format
   */
  private mapGenderToBackend(gender?: string): string | null {
    if (!gender) return null;
    
    const genderMap: Record<string, string | null> = {
      'male': 'M',
      'female': 'F',
      'other': 'Otro',
      'prefer_not_to_say': null
    };
    
    return genderMap[gender] || null;
  }

  /**
   * Map backend gender to frontend format
   */
  private mapGenderFromBackend(genero?: string): 'male' | 'female' | 'other' | 'prefer_not_to_say' | undefined {
    if (!genero) return undefined;
    
    const backendGenderMap: Record<string, 'male' | 'female' | 'other' | 'prefer_not_to_say'> = {
      'M': 'male',
      'F': 'female', 
      'Otro': 'other'
    };
    
    return backendGenderMap[genero];
  }

  /**
   * Transform Laravel guest data to frontend format
   */
  private transformGuestFromBackend(backendGuest: any): Guest {
    // Map document type ID to string
    const mapDocumentTypeFromId = (idTipoDoc: number | null): 'passport' | 'license' | 'id_card' => {
      const typeMap: Record<number, 'passport' | 'license' | 'id_card'> = {
        1: 'id_card',    // Cédula de identidad
        2: 'passport',   // Pasaporte
        3: 'license',    // Licencia de conducir
      };
      return typeMap[idTipoDoc || 1] || 'id_card';
    };

    // Handle room preferences from backend
    const roomPreferences = backendGuest.preferencias ? {
      floor: backendGuest.preferencias.floor as 'low' | 'high' | 'middle' | undefined,
      view: backendGuest.preferencias.view as 'ocean' | 'mountain' | 'city' | 'garden' | undefined,
      bedType: backendGuest.preferencias.bed_type as 'single' | 'double' | 'queen' | 'king' | 'twin' | undefined,
      smokingAllowed: backendGuest.preferencias.smoking_allowed || false,
    } : {};

    const transformed: Guest = {
      id: backendGuest.id_cliente?.toString() || backendGuest.id?.toString() || '',
      firstName: backendGuest.nombre || '',
      firstLastName: backendGuest.apellido1 || '',
      secondLastName: backendGuest.apellido2 || undefined,
      email: backendGuest.email || '',
      phone: backendGuest.telefono || '',
      documentType: mapDocumentTypeFromId(backendGuest.id_tipo_doc),
      documentNumber: backendGuest.numero_doc || '',
      nationality: backendGuest.nacionalidad || '',
      address: {
        street: backendGuest.direccion || '',
        city: '',
        country: backendGuest.nacionalidad || '',
        state: '',
        postalCode: ''
      },
      city: '',
      country: backendGuest.nacionalidad || '',
      birthDate: backendGuest.fecha_nacimiento || '',
      dateOfBirth: backendGuest.fecha_nacimiento || '',
      gender: this.mapGenderFromBackend(backendGuest.genero),
      vipStatus: backendGuest.es_vip || false,
      notes: backendGuest.notas_personal || '',
      medicalNotes: '',
      allergies: [],
      dietaryRestrictions: [],
      preferredLanguage: '',
      emergencyContact: {
        name: '',
        relationship: '',
        phone: '',
        email: ''
      },
      communicationPreferences: {},
      roomPreferences: roomPreferences,
      loyaltyProgram: {
        memberId: '',
        tier: undefined,
        points: 0
      },
      isActive: true, // Assuming all returned guests are active
      createdAt: backendGuest.created_at || new Date().toISOString(),
      updatedAt: backendGuest.updated_at || new Date().toISOString(),
    };
    
    return transformed;
  }
}

// Create and export singleton instance
function createGuestApiService(): GuestApiService {
  const instance = new GuestApiService();
  
  // Bind all methods to preserve `this` context
  instance.createGuest = instance.createGuest.bind(instance);
  instance.updateGuest = instance.updateGuest.bind(instance);
  instance.getGuests = instance.getGuests.bind(instance);
  instance.searchGuests = instance.searchGuests.bind(instance);
  instance.getGuestById = instance.getGuestById.bind(instance);
  instance.deleteGuest = instance.deleteGuest.bind(instance);
  
  return instance;
}

export const guestApiService = createGuestApiService();
export { GuestApiService };
export default guestApiService;