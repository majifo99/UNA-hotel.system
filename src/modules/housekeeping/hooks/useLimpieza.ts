// src/hooks/useLimpieza.ts
import { useCallback, useMemo, useState, useEffect } from "react";
import type { Prioridad, LimpiezaItem } from "../types/limpieza";
import { PRIORIDADES } from "../types/limpieza";
import { limpiezaService } from "../services/limpiezaService";

type UseAssignFormParams = {
  id_habitacion: number | null;
  editingId?: number | null;
  initialItem?: Partial<LimpiezaItem> | null; // compat
  onSuccess?: () => void;
  onClose?: () => void;
  onPatched?: (updated: any) => void;
};

export function useAssignForm(params: UseAssignFormParams) {
  const { id_habitacion: initialRoomId, editingId, /* initialItem */ onSuccess, onClose, onPatched } = params;

  // ----- State del formulario -----
  const [idHabitacion, setIdHabitacion] = useState<number | null>(initialRoomId);
  const [asignadoA, setAsignadoA] = useState<number | null>(null);

  // Todos vacíos por diseño (solo edición por PATCH)
  const [prioridad, setPrioridad] = useState<Prioridad | null>(null);
  const [nombre, setNombre] = useState<string>("");
  const [descripcion, setDescripcion] = useState<string>("");
  const [fecha, setFecha] = useState<string>("");
  const [hora, setHora] = useState<string>("");
  const [notas, setNotas] = useState<string>("");

  useEffect(() => {
    if (initialRoomId != null) setIdHabitacion(initialRoomId);
  }, [initialRoomId]);

  // ----- UI state -----
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // ----- Helpers -----
  const buildISO = useCallback((d?: string, t?: string) => {
    if (!d || !t) return undefined;
    const [Y, M, D] = d.split("-").map(Number);
    const [h, m] = t.split(":").map(Number);
    const js = new Date(Y, (M ?? 1) - 1, D ?? 1, h ?? 0, m ?? 0, 0, 0);
    return js.toISOString();
  }, []);

  // ✅ Reglas nuevas: solo PATCH, nada obligatorio salvo tener habitación y al menos un campo a editar
  const canSave = useMemo(() => {
    if (idHabitacion == null || Number.isNaN(Number(idHabitacion))) return false;
    const anyField =
      (prioridad && PRIORIDADES.includes(prioridad)) ||
      nombre.trim() ||
      descripcion.trim() ||
      notas.trim() ||
      (fecha && hora) ||
      (typeof asignadoA === "number"); // cuenta como cambio
    return Boolean(anyField);
  }, [idHabitacion, prioridad, nombre, descripcion, notas, fecha, hora, asignadoA]);

  const validate = useCallback(() => {
    const e: Record<string, string> = {};

    if (idHabitacion == null || Number.isNaN(Number(idHabitacion))) {
      e.id_habitacion = "Selecciona una habitación válida.";
    }

    // Validar pares fecha/hora solo si se intenta cambiar
    if (fecha && !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) e.fecha = "Formato inválido (yyyy-MM-dd).";
    if (hora && !/^\d{2}:\d{2}$/.test(hora)) e.hora = "Formato inválido (HH:mm).";
    if ((fecha && !hora) || (!fecha && hora)) e.fecha = "Si cambias la programación, llena fecha y hora.";

    if (nombre && (nombre.trim().length < 3 || nombre.trim().length > 100)) {
      e.nombre = "El nombre debe tener entre 3 y 100 caracteres.";
    }
    if (descripcion && descripcion.length > 500) e.descripcion = "Máximo 500 caracteres.";
    if (notas && notas.length > 500) e.notas = "Máximo 500 caracteres.";
    if (prioridad && !PRIORIDADES.includes(prioridad)) e.prioridad = "Prioridad inválida.";
    if (asignadoA != null && Number.isNaN(Number(asignadoA))) e.asignadoA = "Selecciona un usuario válido.";

    // Debe haber al menos un campo a editar
    const anyField =
      (prioridad && PRIORIDADES.includes(prioridad)) ||
      nombre.trim() ||
      descripcion.trim() ||
      notas.trim() ||
      (fecha && hora) ||
      (typeof asignadoA === "number"); // ← antes estaba suelto; ahora unido con ||

    if (!anyField) e.form = "No hay cambios para guardar.";

    setErrors(e);
    return Object.keys(e).length === 0;
  }, [idHabitacion, nombre, descripcion, notas, prioridad, fecha, hora, asignadoA]);

  const reset = useCallback(() => {
    setPrioridad(null);
    setNombre("");
    setDescripcion("");
    setFecha("");
    setHora("");
    setNotas("");
    setAsignadoA(null); // reset también asignación
    setErrors({});
    setToast(null);
  }, []);

  const handleSave = useCallback(async () => {
    if (!validate()) return;
    if (idHabitacion == null) {
      setErrors((p) => ({ ...p, id_habitacion: "Falta el ID de la habitación." }));
      return;
    }

    setLoading(true);
    setToast(null);
    try {
      // 👉 solo PATCH: buscamos el id de la limpieza asociada a la habitación (si no llega editingId)
      let targetId: number | null =
        editingId != null && !Number.isNaN(Number(editingId)) ? editingId : null;

      if (targetId == null) {
        const list = await limpiezaService.getLimpiezas({ id_habitacion: idHabitacion, per_page: 1 });
        const first = (list?.data ?? [])[0] as any;
        targetId = first?.id_limpieza ?? first?.id ?? null;
      }

      if (targetId == null) {
        throw new Error("No se encontró una limpieza existente para esta habitación.");
      }

      // construir payload SOLO con lo que cambiaste
      const payload: Record<string, any> = {};
      if (prioridad) payload.prioridad = prioridad;
      if (nombre.trim()) payload.nombre = nombre.trim();
      if (descripcion.trim()) payload.descripcion = descripcion.trim();
      if (notas.trim()) payload.notas = notas.trim();
      const iso = buildISO(fecha, hora);
      if (iso) payload.fecha_inicio = iso;

      // NUEVO: id del usuario asignado
      if (typeof asignadoA === "number") {
        payload.id_usuario_asigna = asignadoA;
      }

      const resp = await limpiezaService.updateLimpieza(targetId, payload, "PATCH");
      const updated = (resp as any)?.data ?? resp;

      onPatched?.(updated);
      setToast({ type: "success", msg: "Cambios guardados." });
      onSuccess?.();
      setTimeout(() => {
        onClose?.();
        reset();
      }, 500);
    } catch (err: any) {
      const msg = typeof err?.message === "string" ? err.message : "No se pudo actualizar.";
      setToast({ type: "error", msg });
      console.error("[useAssignForm] ✗ PATCH error:", err);
    } finally {
      setLoading(false);
    }
  }, [
    validate,
    idHabitacion,
    prioridad,
    nombre,
    descripcion,
    notas,
    fecha,
    hora,
    asignadoA,
    editingId,
    onSuccess,
    onClose,
    reset,
    buildISO,
    onPatched,
  ]);

  return {
    // nombres “canónicos”
    idHabitacion,
    setIdHabitacion,
    // alias para no romper consumidores existentes
    id_habitacion: idHabitacion,

    // resto (todos opcionales)
    prioridad,
    setPrioridad,
    nombre,
    setNombre,
    descripcion,
    setDescripcion,
    fecha,
    setFecha,
    hora,
    setHora,
    notas,
    setNotas,

    // asignación
    asignadoA,
    setAsignadoA,

    errors,
    canSave,
    loading,
    toast,
    handleSave,
    reset,
  };
}
