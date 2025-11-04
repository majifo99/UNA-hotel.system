/**
 * API Client - Legacy exports
 * 
 * @deprecated Import from '@core/http/httpClient' for new code
 * This file provides backwards compatibility with existing code.
 */

import { httpClient, httpClientExtended } from '../core/http/httpClient';

/**
 * Default API client
 * @deprecated Use `http` helper from '@core/http/httpClient'
 */
export default httpClient;

/**
 * Extended API client for heavy operations (reports, exports)
 * @deprecated Use `httpExtended` helper from '@core/http/httpClient'
 */
export const apiClientExtended = httpClientExtended;

