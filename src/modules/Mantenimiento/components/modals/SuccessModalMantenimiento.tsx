// src/modules/Mantenimiento/components/modals/SuccessModalMantenimiento.tsx
/**
 * Modal de éxito para operaciones de mantenimiento
 * Usa el componente base de housekeeping para evitar duplicidad
 */
import { SuccessModalBase } from "../../../housekeeping/components/Modals/SuccessModalBase";
import type { SuccessModalBaseProps } from "../../../housekeeping/components/Modals/SuccessModalBase";

export default function SuccessModal(props: Readonly<SuccessModalBaseProps>) {
  return (
    <SuccessModalBase
      {...props}
      title={props.title ?? "¡Operación Exitosa!"}
      message={props.message ?? "El mantenimiento fue asignado correctamente."}
    />
  );
}
