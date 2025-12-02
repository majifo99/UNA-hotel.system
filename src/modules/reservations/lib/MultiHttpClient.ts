/**
 * MultiHttpClient
 * 
 * Cliente HTTP robusto que automáticamente usa fallback methods
 * cuando Axios falla. Maneja correctamente los tokens de autenticación.
 */

import type { CreateReservationDto } from '../types';
import { TokenAnalyzer } from './TokenAnalyzer';
import { getApiBaseUrl } from '../../../config/api';

const BASE_URL = getApiBaseUrl();

/**
 * Respuesta HTTP normalizada
 */
export interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
}

/**
 * Cliente HTTP con múltiples estrategias
 */
export class MultiHttpClient {
  
  /**
   * Obtiene headers comunes (genérico)
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    const token = localStorage.getItem('adminAuthToken');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    return headers;
  }

  /**
   * Obtiene headers específicos para reservas (resuelve problema de token)
   */
  private getReservationHeaders(): Record<string, string> {
    return TokenAnalyzer.getHeadersForReservation();
  }

  /**
   * POST usando Fetch (método más confiable)
   */
  private async postWithFetch<T>(endpoint: string, data: unknown, useReservationHeaders = false): Promise<HttpResponse<T>> {
    const url = `${BASE_URL}${endpoint}`;
    
    console.log('[FETCH CLIENT] POST', url);
    console.log('[FETCH CLIENT] Payload:', JSON.stringify(data, null, 2));
    
    const headers = useReservationHeaders ? this.getReservationHeaders() : this.getHeaders();
    console.log('[FETCH CLIENT] Headers:', headers);
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    
    const responseText = await response.text();
    let parsedData: T;
    
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      parsedData = responseText as unknown as T;
    }
    
    console.log('[FETCH CLIENT] Response:', {
      status: response.status,
      statusText: response.statusText,
      data: parsedData
    });
    
    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}: ${response.statusText}`) as Error & {
        response?: {
          status: number;
          statusText: string;
          data: T;
        };
      };
      error.response = {
        status: response.status,
        statusText: response.statusText,
        data: parsedData
      };
      throw error;
    }
    
    return {
      data: parsedData,
      status: response.status,
      statusText: response.statusText
    };
  }

  /**
   * POST usando Axios (método actual)
   */
  private async postWithAxios<T>(endpoint: string, data: unknown, useReservationHeaders = false): Promise<HttpResponse<T>> {
    const { default: axios } = await import('axios');
    
    console.log('[AXIOS CLIENT] POST', `${BASE_URL}${endpoint}`);
    console.log('[AXIOS CLIENT] Payload:', JSON.stringify(data, null, 2));
    
    const headers = useReservationHeaders ? this.getReservationHeaders() : this.getHeaders();
    console.log('[AXIOS CLIENT] Headers:', headers);
    
    const response = await axios.post<T>(`${BASE_URL}${endpoint}`, data, {
      headers,
      timeout: 30000, // Increased from 10000 to 30000 for heavy operations
    });
    
    console.log('[AXIOS CLIENT] Response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });
    
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText
    };
  }

  /**
   * POST con fallback automático
   */
  async post<T>(endpoint: string, data: unknown, useReservationHeaders = false): Promise<HttpResponse<T>> {
    // Intentar primero con Axios (comportamiento actual)
    try {
      return await this.postWithAxios<T>(endpoint, data, useReservationHeaders);
    } catch (axiosError) {
      console.warn('[MULTI-HTTP] Axios failed, falling back to Fetch...');
      console.warn('[AXIOS ERROR]', axiosError);
      
      try {
        // Fallback a Fetch
        const fetchResult = await this.postWithFetch<T>(endpoint, data, useReservationHeaders);
        console.log('✅ [FETCH FALLBACK] Success! Fetch worked where Axios failed.');
        return fetchResult;
      } catch (fetchError) {
        console.error('[MULTI-HTTP] Both Axios and Fetch failed');
        console.error('[FETCH ERROR]', fetchError);
        
        // Re-throw the original Axios error for consistency
        throw axiosError;
      }
    }
  }

  /**
   * POST específico para reservas con manejo inteligente de tokens
   */
  async postReservation(data: CreateReservationDto): Promise<HttpResponse<unknown>> {
    console.log('🚀 [RESERVATION POST] Starting reservation creation...');
    
    // Analizar estrategia de token
    const tokenAnalysis = TokenAnalyzer.analyzeCurrentToken();
    console.log('🔐 [TOKEN STRATEGY]', tokenAnalysis);
    
    // Validar datos según la estrategia
    if (tokenAnalysis.shouldIncludeClientId && (!data.id_cliente || Number.isNaN(data.id_cliente))) {
      throw new Error(`Invalid reservation data: id_cliente is required but got ${data.id_cliente}`);
    }
    
    console.log('📋 [PAYLOAD VALIDATION]', {
      id_cliente: data.id_cliente,
      type: typeof data.id_cliente,
      isValid: typeof data.id_cliente === 'number' && data.id_cliente > 0,
      habitaciones_count: data.habitaciones?.length || 0,
      willSendToken: tokenAnalysis.shouldSendToken,
      tokenType: tokenAnalysis.type
    });
    
    // Log actual token being sent (for debugging)
    const tokenInfo = TokenAnalyzer.getTokenInfo();
    console.log('🔑 [CURRENT TOKEN]', {
      type: tokenInfo.type,
      preview: tokenInfo.preview,
      willBeSent: tokenAnalysis.shouldSendToken
    });
    
    return this.post('/reservas', data, true); // true = use reservation headers
  }
}

export const multiHttpClient = new MultiHttpClient();