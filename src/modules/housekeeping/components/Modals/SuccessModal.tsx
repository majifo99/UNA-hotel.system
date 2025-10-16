import { useEffect, useRef } from "react";
import { X, CheckCircle2 } from "lucide-react";

/** Paleta por defecto (ajústala si quieres) */
const PALETTE = {
  primary:   "#304D3C", // verde profundo (tu sidebar)
  primary600:"#264033",
  accent:    "#D8C3A8", // beige arena (tu item activo)
  surface:   "#F7F5F2", // fondo claro cálido
  card:      "#FFFFFF", // tarjeta
  ring:      "#E7E1D6", // borde sutil
  text:      "#1F2A27", // texto titular
  subtext:   "#5F6B66",
  glow:      "rgba(48, 77, 60, 0.10)", // verde suave para glow
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;      // si no se pasa, cierra
  autoCloseMs?: number;       // opcional
};

export default function SuccessModal({
  isOpen,
  onClose,
  title = "¡Operación Exitosa!",
  message = "La limpieza fue actualizada correctamente.",
  actionLabel = "Continuar",
  onAction,
  autoCloseMs,
}: Readonly<Props>) {
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const f = setTimeout(() => btnRef.current?.focus(), 80);
    let t: ReturnType<typeof setTimeout> | undefined;
    if (autoCloseMs && autoCloseMs > 0) {
      t = setTimeout(() => (onAction ?? onClose)(), autoCloseMs);
    }
    return () => {
      clearTimeout(f);
      if (t) clearTimeout(t);
    };
  }, [isOpen, autoCloseMs, onAction, onClose]);

  if (!isOpen) return null;

  const handleAction = () => (onAction ? onAction() : onClose());

  return (
    <div
      className="fixed inset-0 z-[200] grid place-items-center px-4 animate-fadeIn"
      style={{
        // overlay claro con tinte beige + blur suave (sin negro)
        background:
          "linear-gradient(0deg, rgba(216,195,168,0.20), rgba(216,195,168,0.20))",
        backdropFilter: "blur(6px)",
      }}
    >
      <div
      
        aria-modal="true"
        aria-labelledby="success-title"
        aria-describedby="success-desc"
        className="relative w-full max-w-md rounded-3xl shadow-xl animate-zoomIn"
        style={{
          background: `linear-gradient(180deg, ${PALETTE.card} 0%, ${PALETTE.surface} 100%)`,
          border: `1px solid ${PALETTE.ring}`,
          boxShadow:
            "0 10px 25px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.05), 0 0 0 6px rgba(216,195,168,0.15)",
        }}
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-3.5 top-3.5 rounded-full p-2 transition"
          style={{
            color: PALETTE.subtext,
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget.style.backgroundColor = "rgba(216,195,168,0.25)"))
          }
          onMouseLeave={(e) =>
            ((e.currentTarget.style.backgroundColor = "transparent"))
          }
        >
          <X className="h-5 w-5" />
        </button>

        {/* Encabezado */}
        <div className="px-8 pt-8 pb-3 text-center">
          {/* Icono */}
          <div className="mx-auto mb-4 flex h-18 w-18 items-center justify-center rounded-full animate-pop"
               style={{
                 height: 72, width: 72,
                 background: `radial-gradient(closest-side, ${PALETTE.glow}, transparent)`,
                 border: `1px solid ${PALETTE.ring}`,
               }}>
            <CheckCircle2 className="h-11 w-11" style={{ color: PALETTE.primary }} />
          </div>

          <h2 id="success-title" className="text-2xl font-semibold"
              style={{ color: PALETTE.text }}>
            {title}
          </h2>
          <p id="success-desc" className="mt-2 text-sm"
             style={{ color: PALETTE.subtext }}>
            {message}
          </p>
        </div>

        {/* Acción */}
        <div className="px-8 pb-8 pt-4">
          <button
            ref={btnRef}
            onClick={handleAction}
            className="w-full rounded-xl px-4 py-2.5 font-semibold transition shadow-sm"
            style={{
              backgroundColor: PALETTE.primary,
              color: "white",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget.style.backgroundColor = PALETTE.primary600))
            }
            onMouseLeave={(e) =>
              ((e.currentTarget.style.backgroundColor = PALETTE.primary))
            }
          >
            {actionLabel}
          </button>

          {/* Línea decorativa inferior con beige */}
          <div
            className="mt-6 h-1 w-24 rounded-full mx-auto"
            style={{ backgroundColor: PALETTE.accent, opacity: 0.8 }}
          />
        </div>
      </div>

      {/* Animaciones */}
      <style>{`
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
      `}</style>
    </div>
  );
}
