// src/modules/housekeeping/hooks/useLimpieza.ts
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

// --- helpers mínimos (no suman complejidad al validate) ---
const isYMD = (s?: string) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);
const isHM  = (s?: string) => !!s && /^\d{2}:\d{2}$/.test(s);
const T     = (s?: string) => (s ?? "").trim();

export function useAssignForm(params: UseAssignFormParams) {
  const { id_habitacion: initialRoomId, editingId, onSuccess, onClose, onPatched } = params;

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

  const canSave = useMemo(() => {
    if (idHabitacion == null || Number.isNaN(Number(idHabitacion))) return false;
    return Boolean(
      (prioridad && PRIORIDADES.includes(prioridad)) ||
      T(nombre) || T(descripcion) || T(notas) ||
      (fecha && hora) ||
      (typeof asignadoA === "number")
    );
  }, [idHabitacion, prioridad, nombre, descripcion, notas, fecha, hora, asignadoA]);

  // ---- VALIDATE: simple, lineal, sin anidar ----
  const validate = useCallback(() => {
    const e: Record<string, string> = {};

    const tNombre = T(nombre);
    const tDesc   = T(descripcion);
    const tNotas  = T(notas);

    const hasFecha = !!fecha;
    const hasHora  = !!hora;
    const faltaPar = (hasFecha || hasHora) && !(hasFecha && hasHora);

    const prioridadBad = !!prioridad && !PRIORIDADES.includes(prioridad);
    const asignadoBad  = asignadoA != null && Number.isNaN(Number(asignadoA));
    const nombreBad    = !!tNombre && (tNombre.length < 3 || tNombre.length > 100);
    const descBad      = !!tDesc && tDesc.length > 500;
    const notasBad     = !!tNotas && tNotas.length > 500;

    const anyField =
      (!!prioridad && !prioridadBad) ||
      !!tNombre || !!tDesc || !!tNotas ||
      (hasFecha && hasHora) ||
      typeof asignadoA === "number";

    if (idHabitacion == null || Number.isNaN(Number(idHabitacion))) e.id_habitacion = "Selecciona una habitación válida.";
    if (faltaPar) e.fecha = "Si cambias la programación, llena fecha y hora.";
    if (!faltaPar && hasFecha && !isYMD(fecha)) e.fecha = "Formato inválido (yyyy-MM-dd).";
    if (!faltaPar && hasHora  && !isHM(hora))  e.hora  = "Formato inválido (HH:mm).";
    if (nombreBad) e.nombre = "El nombre debe tener entre 3 y 100 caracteres.";
    if (descBad)   e.descripcion = "Máximo 500 caracteres.";
    if (notasBad)  e.notas = "Máximo 500 caracteres.";
    if (prioridadBad) e.prioridad = "Prioridad inválida.";
    if (asignadoBad)  e.asignadoA = "Selecciona un usuario válido.";
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
      // solo PATCH: si no llega editingId, buscamos por habitación
      let targetId: number | null =
        editingId != null && !Number.isNaN(Number(editingId)) ? editingId : null;

      if (targetId == null) {
        const list = await limpiezaService.getLimpiezas({ id_habitacion: idHabitacion, per_page: 1 });
        const first = (list?.data ?? [])[0] as any;
        targetId = first?.id_limpieza ?? first?.id ?? null;
      }

      if (targetId == null) throw new Error("No se encontró una limpieza existente para esta habitación.");

      // payload SOLO con lo que cambiaste
      const payload: Record<string, any> = {};
      if (prioridad) payload.prioridad = prioridad;
      if (T(nombre)) payload.nombre = T(nombre);
      if (T(descripcion)) payload.descripcion = T(descripcion);
      if (T(notas)) payload.notas = T(notas);
      const iso = buildISO(fecha, hora);
      if (iso) payload.fecha_inicio = iso;
      if (typeof asignadoA === "number") payload.id_usuario_asigna = asignadoA;

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
      console.error("[useAssignForm] PATCH error:", err);
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
    prioridad, setPrioridad,
    nombre, setNombre,
    descripcion, setDescripcion,
    fecha, setFecha,
    hora, setHora,
    notas, setNotas,

    // asignación
    asignadoA, setAsignadoA,

    errors,
    canSave,
    loading,
    toast,
    handleSave,
    reset,
  };
}
