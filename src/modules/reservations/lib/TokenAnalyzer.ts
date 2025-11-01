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
   */
  static analyzeCurrentToken(): TokenAnalysis {
    const adminToken = localStorage.getItem('adminAuthToken');
    const clienteToken = localStorage.getItem('authToken'); // ✅ CORREGIDO: El web auth usa 'authToken'
    
    console.log('[TOKEN ANALYSIS] Checking available tokens:', {
      hasAdminToken: !!adminToken,
      hasClienteToken: !!clienteToken,
      adminTokenPreview: adminToken?.substring(0, 20) + '...',
      clienteTokenPreview: clienteToken?.substring(0, 20) + '...'
    });
    
    // Prioridad: Cliente token > No token (con id_cliente) > Admin token (problemático)
    if (clienteToken) {
      return {
        type: 'cliente',
        token: clienteToken,
        shouldSendToken: true,
        shouldIncludeClientId: false, // El backend lo detecta del token
        reason: 'Cliente token available - backend will auto-detect id_cliente'
      };
    }
    
    if (adminToken) {
      // Admin token causa el problema según tu diagnóstico
      return {
        type: 'admin',
        token: adminToken,
        shouldSendToken: false, // NO enviar token admin para reservas
        shouldIncludeClientId: true, // Enviar id_cliente explícito
        reason: 'Admin token detected but causes auth conflict - sending without token'
      };
    }
    
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