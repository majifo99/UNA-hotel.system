/**
 * Exportaciones centralizadas del módulo de Folio
 * 
 * Facilita las importaciones en otros archivos del proyecto.
 */

// Tipos
export type {
  CargoPayload,
  CargoResponse,
  FolioLinea,
  ClienteFolio,
  MetodoPago,
  ResultadoPago,
  PagoPayload,
  Pago,
  DistributionStrategy,
  ResponsableDistribucion,
  DistribucionRequest,
  TipoEvento,
  HistorialItem,
  HistorialResponse,
  FolioApiResponse,
  FolioApiError,
  SelectOption,
  TabState,
  EstadoFolio,
  Folio,
  TipoCargo
} from './types/folio.types';

// Servicios
export { folioService } from './services/folioService';

// Hooks
export { useAgregarCargo } from './hooks/useAgregarCargo';

// Componentes
export { AgregarCargoForm } from './components/AgregarCargoForm';
export { FolioCargosTab } from './components/FolioCargosTab';
export { FolioPagosTab } from './components/FolioPagosTab';
export { FolioDistribucionTab } from './components/FolioDistribucionTab';
export { FolioResumen } from './components/FolioResumen';
export { FolioHistorial } from './components/FolioHistorial';

// Páginas
export { FolioPage } from './pages/FolioPage';
