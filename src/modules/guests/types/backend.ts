/**
 * Guest Backend Types - UNA Hotel System
 * 
 * Types specific to guest/client operations with Laravel backend
 */

// =================== BACKEND CLIENT TYPES ===================

export interface BackendClient {
  id_cliente: number;
  nombre: string;
  apellido1: string;
  apellido2?: string;
  email: string;
  telefono: string;
  id_tipo_doc?: number;
  numero_doc?: string;
  nacionalidad: string;
  direccion?: string;
  fecha_nacimiento?: string;
  genero?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateClientRequest {
  nombre: string;
  apellido1: string;
  apellido2?: string;
  email: string;
  telefono: string;
  id_tipo_doc?: number;
  numero_doc?: string;
  nacionalidad: string;
  direccion?: string;
  fecha_nacimiento?: string;
  genero?: string;
}

export interface UpdateClientRequest extends Partial<CreateClientRequest> {}

// =================== CATALOG TYPES ===================

export interface BackendDocumentType {
  id_tipo_doc: number;
  nombre: string;
  descripcion: string;
}

// =================== PAGINATION ===================

export interface BackendPaginatedResponse<T> {
  data: T[];
  links: {
    first: string;
    last: string;
    prev?: string;
    next?: string;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}

// =================== SEARCH TYPES ===================

export interface ClientSearchParams {
  search?: string;
  email?: string;
  telefono?: string;
  page?: number;
  per_page?: number;
}