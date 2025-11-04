/**
 * TokenAnalyzer
 * 
 * Analiza y maneja diferentes tipos de tokens para determinar
 * la estrategia correcta de autenticación para reservas.
 */

/**
 * Tipos de token soportados
 */
export type TokenType = 'admin' | 'cliente' | 'none';

/**
 * Resultado del análisis de token
 */
export interface TokenAnalysis {
  type: TokenType;
  token?: string;
  shouldSendToken: boolean;
  shouldIncludeClientId: boolean;
  reason: string;
}

/**
 * Analizador de tokens
 */
export class TokenAnalyzer {
  
  /**
   * Analiza el token actual y determina la estrategia
   * 
   * Según documentación del backend (SISTEMA_RESERVAS_SEPARACION.md):
   * - Admin token (/api/reservas): Requiere token + id_cliente explícito
   * - Cliente token (/api/reservas-web): Requiere token, id_cliente auto-detectado
   */
  static analyzeCurrentToken(): TokenAnalysis {
    const adminToken = localStorage.getItem('adminAuthToken');
    const clienteToken = localStorage.getItem('authToken');
    
    console.log('[TOKEN ANALYSIS] Checking available tokens:', {
      hasAdminToken: !!adminToken,
      hasClienteToken: !!clienteToken,
      adminTokenPreview: adminToken?.substring(0, 20) + '...',
      clienteTokenPreview: clienteToken?.substring(0, 20) + '...'
    });
    
    // Prioridad: Admin token > Cliente token
    // Admin token se usa para endpoint /api/reservas (personal del hotel)
    // Cliente token se usaría para endpoint /api/reservas-web (clientes finales)
    
    if (adminToken) {
      // Admin token: Enviar token + id_cliente explícito (según documentación backend)
      return {
        type: 'admin',
        token: adminToken,
        shouldSendToken: true, // ✅ SÍ enviar token admin
        shouldIncludeClientId: true, // ✅ SÍ incluir id_cliente explícito
        reason: 'Admin token - using /api/reservas endpoint with explicit id_cliente'
      };
    }
    
    if (clienteToken) {
      // Cliente token: Enviar token, id_cliente se detecta automáticamente
      return {
        type: 'cliente',
        token: clienteToken,
        shouldSendToken: true,
        shouldIncludeClientId: false, // El backend lo detecta del token
        reason: 'Cliente token - using /api/reservas-web endpoint, id_cliente auto-detected'
      };
    }
    
    // Sin token: Enviar id_cliente explícito
    return {
      type: 'none',
      shouldSendToken: false,
      shouldIncludeClientId: true,
      reason: 'No token available - using explicit id_cliente in body'
    };
  }
  
  /**
   * Obtiene headers apropiados según el análisis
   */
  static getHeadersForReservation(): Record<string, string> {
    const analysis = this.analyzeCurrentToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (analysis.shouldSendToken && analysis.token) {
      headers.Authorization = `Bearer ${analysis.token}`;
      console.log(`[TOKEN STRATEGY] Using ${analysis.type} token for reservation`);
    } else {
      console.log(`[TOKEN STRATEGY] NOT sending token for reservation: ${analysis.reason}`);
    }
    
    return headers;
  }
  
  /**
   * Verifica si debemos incluir id_cliente en el payload
   */
  static shouldIncludeClientIdInPayload(): boolean {
    const analysis = this.analyzeCurrentToken();
    return analysis.shouldIncludeClientId;
  }
  
  /**
   * Obtiene información detallada del token actual
   */
  static getTokenInfo(): { type: string; preview?: string; full?: string } {
    const adminToken = localStorage.getItem('adminAuthToken');
    const clienteToken = localStorage.getItem('authToken'); // ✅ CORREGIDO: El web auth usa 'authToken'
    
    if (clienteToken) {
      return {
        type: 'cliente',
        preview: clienteToken.substring(0, 30) + '...',
        full: clienteToken
      };
    }
    
    if (adminToken) {
      return {
        type: 'admin', 
        preview: adminToken.substring(0, 30) + '...',
        full: adminToken
      };
    }
    
    return { type: 'none' };
  }
}