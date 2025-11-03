// src/modules/housekeeping/components/Modals/SuccessModalBase.tsx
/**
 * Componente base reutilizable para modales de éxito
 * Evita duplicidad de código entre módulos
 */
import { useEffect, useRef } from "react";
import { X, CheckCircle2 } from "lucide-react";
import { SUCCESS_MODAL_PALETTE as PALETTE, SUCCESS_MODAL_STYLES } from "./successModalHelpers";

export interface SuccessModalBaseProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  autoCloseMs?: number;
}

/**
 * Modal base de éxito con animaciones y auto-cierre
 * Totalmente configurable mediante props
 */
export function SuccessModalBase({
  isOpen,
  onClose,
  title = "¡Operación Exitosa!",
  message = "La operación se completó correctamente.",
  actionLabel = "Continuar",
  onAction,
  autoCloseMs,
}: Readonly<SuccessModalBaseProps>) {
  const actionButtonRef = useRef<HTMLButtonElement>(null);

  // Auto-focus y auto-close
  useEffect(() => {
    if (!isOpen) return;

    const focusTimeout = setTimeout(() => actionButtonRef.current?.focus(), 80);
    let autoCloseTimeout: ReturnType<typeof setTimeout> | undefined;

    if (autoCloseMs && autoCloseMs > 0) {
      autoCloseTimeout = setTimeout(() => (onAction ?? onClose)(), autoCloseMs);
    }

    return () => {
      clearTimeout(focusTimeout);
      if (autoCloseTimeout) clearTimeout(autoCloseTimeout);
    };
  }, [isOpen, autoCloseMs, onAction, onClose]);

  if (!isOpen) return null;

  const executeAction = () => (onAction ? onAction() : onClose());

  const overlayStyles = {
    background: "linear-gradient(0deg, rgba(216,195,168,0.20), rgba(216,195,168,0.20))",
    backdropFilter: "blur(6px)",
  };

  const cardStyles = {
    background: `linear-gradient(180deg, ${PALETTE.card} 0%, ${PALETTE.surface} 100%)`,
    border: `1px solid ${PALETTE.ring}`,
    boxShadow: "0 10px 25px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.05), 0 0 0 6px rgba(216,195,168,0.15)",
  };

  const iconContainerStyles = {
    height: 72,
    width: 72,
    background: `radial-gradient(closest-side, ${PALETTE.glow}, transparent)`,
    border: `1px solid ${PALETTE.ring}`,
  };

  return (
    <div
      className="fixed inset-0 z-[200] grid place-items-center px-4 animate-fadeIn"
      style={overlayStyles}
    >
      <div
        aria-modal="true"
        aria-labelledby="success-modal-title"
        aria-describedby="success-modal-description"
        className="relative w-full max-w-md rounded-3xl shadow-xl animate-zoomIn"
        style={cardStyles}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Cerrar modal"
          className="absolute right-3.5 top-3.5 rounded-full p-2 transition"
          style={{ color: PALETTE.subtext }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(216,195,168,0.25)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header section */}
        <div className="px-8 pt-8 pb-3 text-center">
          <div
            className="mx-auto mb-4 flex h-18 w-18 items-center justify-center rounded-full animate-pop"
            style={iconContainerStyles}
          >
            <CheckCircle2 className="h-11 w-11" style={{ color: PALETTE.primary }} />
          </div>

          <h2 id="success-modal-title" className="text-2xl font-semibold" style={{ color: PALETTE.text }}>
            {title}
          </h2>
          <p id="success-modal-description" className="mt-2 text-sm" style={{ color: PALETTE.subtext }}>
            {message}
          </p>
        </div>

        {/* Action section */}
        <div className="px-8 pb-8 pt-4">
          <button
            ref={actionButtonRef}
            onClick={executeAction}
            className="w-full rounded-xl px-4 py-2.5 font-semibold transition shadow-sm"
            style={{ backgroundColor: PALETTE.primary, color: "white" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = PALETTE.primary600)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = PALETTE.primary)}
          >
            {actionLabel}
          </button>

          {/* Decorative line */}
          <div
            className="mt-6 h-1 w-24 rounded-full mx-auto"
            style={{ backgroundColor: PALETTE.accent, opacity: 0.8 }}
          />
        </div>
      </div>

      <style>{SUCCESS_MODAL_STYLES}</style>
    </div>
  );
}
