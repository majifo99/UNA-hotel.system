/**
 * CheckOut Page - V2.0
 * 
 * Página principal de Check-Out con integración completa de folios.
 * Actualizado para usar el componente CheckOutNew completamente rediseñado.
 * 
 * Cambios en V2:
 * - Componente completamente nuevo (CheckOutNew)
 * - Proceso guiado paso a paso
 * - Validación robusta en cada etapa
 * - Integración completa con sistema de folios
 * - UI moderna y responsiva
 * - Manejo profesional de errores
 * 
 * @module CheckOutPage
 * @version 2.0
 */

import CheckOutNew from '../components/CheckOutNew';

const CheckOutPage = () => {
  return (
    <div className="min-h-screen">
      <CheckOutNew />
    </div>
  );
};

export default CheckOutPage;
