// src/modules/housekeeping/components/Modals/successModalHelpers.ts
/**
 * Constantes y utilidades compartidas para SuccessModal
 * Reutilizado en housekeeping y Mantenimiento
 */

export const SUCCESS_MODAL_PALETTE = {
  primary: "#304D3C", // verde profundo (sidebar)
  primary600: "#264033",
  accent: "#D8C3A8", // beige arena (item activo)
  surface: "#F7F5F2", // fondo claro cálido
  card: "#FFFFFF", // tarjeta
  ring: "#E7E1D6", // borde sutil
  text: "#1F2A27", // texto titular
  subtext: "#5F6B66",
  glow: "rgba(48, 77, 60, 0.10)", // verde suave para glow
} as const;

export const SUCCESS_MODAL_STYLES = `
  @keyframes zoomIn {
    0% { transform: scale(.97); opacity: 0 }
    100% { transform: scale(1); opacity: 1 }
  }
  @keyframes fadeIn {
    0% { opacity: 0 }
    100% { opacity: 1 }
  }
  @keyframes pop {
    0% { transform: scale(.9); opacity:.7 }
    100% { transform: scale(1); opacity:1 }
  }
  .animate-zoomIn { animation: zoomIn .22s ease-out }
  .animate-fadeIn { animation: fadeIn .18s ease-out }
  .animate-pop { animation: pop .28s ease-out }
` as const;
