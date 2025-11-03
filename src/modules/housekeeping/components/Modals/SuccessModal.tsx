// src/modules/housekeeping/components/Modals/SuccessModal.tsx
/**
 * Modal de éxito para operaciones de limpieza
 * Usa el componente base para evitar duplicidad
 */
import { SuccessModalBase } from "./SuccessModalBase";
import type { SuccessModalBaseProps } from "./SuccessModalBase";

export default function SuccessModal(props: Readonly<SuccessModalBaseProps>) {
  return (
    <SuccessModalBase
      {...props}
      title={props.title ?? "¡Operación Exitosa!"}
      message={props.message ?? "La limpieza fue actualizada correctamente."}
    />
  );
}
