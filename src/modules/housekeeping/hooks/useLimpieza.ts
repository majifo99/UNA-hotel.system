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

  // ✅ Reglas: solo PATCH; obligatorio: habitación válida + al menos un campo a editar
  const canSave = useMemo(() => {
    if (idHabitacion == null || Number.isNaN(Number(idHabitacion))) return false;
    const anyField =
      (prioridad && PRIORIDADES.includes(prioridad)) ||
      nombre.trim() ||
      descripcion.trim() ||
      notas.trim() ||
      (fecha && hora) ||
      typeof asignadoA === "number";
    return Boolean(anyField);
  }, [idHabitacion, prioridad, nombre, descripcion, notas, fecha, hora, asignadoA]);

  // ---- VALIDATE (refactor: menor complejidad cognitiva) ----
  const validate = useCallback(() => {
    const tNombre = nombre.trim();
    const tDescripcion = descripcion.trim();
    const tNotas = notas.trim();

    const hasFecha = !!fecha;
    const hasHora = !!hora;

    const fechaInvalida = hasFecha && !/^\d{4}-\d{2}-\d{2}$/.test(fecha);
    const horaInvalida = hasHora && !/^\d{2}:\d{2}$/.test(hora);
    const faltaParFechaHora = (hasFecha || hasHora) && !(hasFecha && hasHora);

    const prioridadInvalida = !!prioridad && !PRIORIDADES.includes(prioridad);
    const asignadoInvalido = asignadoA != null && Number.isNaN(Number(asignadoA));

    const nombreInvalido = !!tNombre && (tNombre.length < 3 || tNombre.length > 100);
    const descripcionInvalida = !!tDescripcion && tDescripcion.length > 500;
    const notasInvalidas = !!tNotas && tNotas.length > 500;

    const anyField =
      (!!prioridad && !prioridadInvalida) ||
      !!tNombre ||
      !!tDescripcion ||
      !!tNotas ||
      (hasFecha && hasHora) ||
      typeof asignadoA === "number";

    const e: Record<string, string> = {
      ...(idHabitacion == null || Number.isNaN(Number(idHabitacion)) ? { id_habitacion: "Selecciona una habitación válida." } : {}),
      ...(faltaParFechaHora ? { fecha: "Si cambias la programación, llena fecha y hora." } : {}),
      ...(!faltaParFechaHora && fechaInvalida ? { fecha: "Formato inválido (yyyy-MM-dd)." } : {}),
      ...(!faltaParFechaHora && horaInvalida ? { hora: "Formato inválido (HH:mm)." } : {}),
      ...(nombreInvalido ? { nombre: "El nombre debe tener entre 3 y 100 caracteres." } : {}),
      ...(descripcionInvalida ? { descripcion: "Máximo 500 caracteres." } : {}),
      ...(notasInvalidas ? { notas: "Máximo 500 caracteres." } : {}),
      ...(prioridadInvalida ? { prioridad: "Prioridad inválida." } : {}),
      ...(asignadoInvalido ? { asignadoA: "Selecciona un usuario válido." } : {}),
      ...(!anyField ? { form: "No hay cambios para guardar." } : {}),
    };

    setErrors(e);
    return Object.keys(e).length === 0;
  }, [
    idHabitacion,
    nombre,
    descripcion,
    notas,
    prioridad,
    fecha,
    hora,
    asignadoA,
  ]);

  const reset = useCallback(() => {
    setPrioridad(null);
    setNombre("");
    setDescripcion("");
    setFecha("");
    setHora("");
    setNotas("");
    setAsignadoA(null);
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
