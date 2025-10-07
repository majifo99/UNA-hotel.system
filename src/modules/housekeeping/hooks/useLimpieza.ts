// src/hooks/useLimpieza.ts

import { useCallback, useMemo, useState, useEffect } from "react";
import type { Prioridad, LimpiezaItem } from "../types/limpieza";
import { PRIORIDADES, ESTADO_HAB } from "../types/limpieza";
import { limpiezaService } from "../services/limpiezaService";

type UseAssignFormParams = {
  id_habitacion: number | null;
  editingId?: number | null;
  initialItem?: Partial<LimpiezaItem> | null;
  onSuccess?: () => void;
  onClose?: () => void;
};

export function useAssignForm(params: UseAssignFormParams) {
  const { id_habitacion: initialRoomId, editingId, initialItem, onSuccess, onClose } = params;

  // ----- State del formulario -----
  // Renombrado para que value + setter "matcheen" (idHabitacion / setIdHabitacion)
  const [idHabitacion, setIdHabitacion] = useState<number | null>(initialRoomId);

  const [prioridad, setPrioridad] = useState<Prioridad | null>(
    ((initialItem?.prioridad as unknown) as Prioridad) ?? null
  );
  const [nombre, setNombre] = useState<string>(initialItem?.nombre ?? "");
  const [descripcion, setDescripcion] = useState<string>(initialItem?.descripcion ?? "");

  const [fecha, setFecha] = useState<string>(() => {
    if (initialItem?.fecha_inicio) {
      const d = new Date(initialItem.fecha_inicio);
      if (!Number.isNaN(d.getTime())) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
      }
    }
    return "";
  });

  const [hora, setHora] = useState<string>(() => {
    if (initialItem?.fecha_inicio) {
      const d = new Date(initialItem.fecha_inicio);
      if (!Number.isNaN(d.getTime())) {
        const HH = String(d.getHours()).padStart(2, "0");
        const MM = String(d.getMinutes()).padStart(2, "0");
        return `${HH}:${MM}`;
      }
    }
    return "";
  });

  const [notas, setNotas] = useState<string>(initialItem?.notas ?? "");

  useEffect(() => {
    if (initialRoomId != null) setIdHabitacion(initialRoomId);
  }, [initialRoomId]);

  // ----- UI state -----
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // ----- Helpers -----
  const buildISO = useCallback((d: string, t: string) => {
    const [Y, M, D] = d.split("-").map(Number);
    const [h, m] = t.split(":").map(Number);
    const js = new Date(Y, (M ?? 1) - 1, D ?? 1, h ?? 0, m ?? 0, 0, 0);
    return js.toISOString();
  }, []);

  const canSave = useMemo(() => {
    if (idHabitacion == null || Number.isNaN(Number(idHabitacion))) return false;
    const trimmed = nombre.trim();
    if (!trimmed || trimmed.length < 3 || trimmed.length > 100) return false;
    if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
    if (!hora || !/^\d{2}:\d{2}$/.test(hora)) return false;
    if (descripcion && descripcion.length > 500) return false;
    if (notas && notas.length > 500) return false;
    if (prioridad && !PRIORIDADES.includes(prioridad)) return false;
    return true;
  }, [idHabitacion, nombre, fecha, hora, descripcion, notas, prioridad]);

  const validate = useCallback(() => {
    const e: Record<string, string> = {};
    if (idHabitacion == null || Number.isNaN(Number(idHabitacion))) {
      e.id_habitacion = "Selecciona una habitación válida.";
    }
    const trimmed = nombre.trim();
    if (!trimmed) e.nombre = "El nombre es obligatorio.";
    else if (trimmed.length < 3) e.nombre = "Debe tener al menos 3 caracteres.";
    else if (trimmed.length > 100) e.nombre = "Máximo 100 caracteres.";
    if (!fecha) e.fecha = "La fecha es obligatoria.";
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) e.fecha = "Formato inválido (yyyy-MM-dd).";
    if (!hora) e.hora = "La hora es obligatoria.";
    else if (!/^\d{2}:\d{2}$/.test(hora)) e.hora = "Formato inválido (HH:mm).";
    if (descripcion && descripcion.length > 500) e.descripcion = "Máximo 500 caracteres.";
    if (notas && notas.length > 500) e.notas = "Máximo 500 caracteres.";
    if (prioridad && !PRIORIDADES.includes(prioridad)) e.prioridad = "Prioridad inválida.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [idHabitacion, nombre, fecha, hora, descripcion, notas, prioridad]);

  const reset = useCallback(() => {
    setPrioridad(null);
    setNombre("");
    setDescripcion("");
    setFecha("");
    setHora("");
    setNotas("");
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
      const payload = {
        id_habitacion: idHabitacion, // ← el campo del API sigue en snake_case
        nombre: nombre.trim(),
        prioridad: prioridad ?? null,
        descripcion: descripcion?.trim() || null,
        fecha_inicio: buildISO(fecha, hora),
        notas: notas?.trim() || null,
        id_estado_hab: ESTADO_HAB.SUCIA,
        fecha_final: null as string | null,
      };

      if (editingId != null && !Number.isNaN(Number(editingId))) {
        await limpiezaService.updateLimpieza(editingId, payload, { method: "PATCH" });
      } else {
        const list = await limpiezaService.getLimpiezas({ id_habitacion: idHabitacion, per_page: 1 });
        const first = list?.data?.[0] as any;
        const candidateId: number | null = first?.id_limpieza ?? first?.id ?? first?.Id ?? null;

        if (candidateId != null && !Number.isNaN(Number(candidateId))) {
          await limpiezaService.updateLimpieza(candidateId, payload, { method: "PATCH" });
        } else {
          await limpiezaService.createLimpieza(payload as any);
        }
      }

      setToast({ type: "success", msg: "Habitación asignada exitosamente." });
      onSuccess?.();
      setTimeout(() => {
        onClose?.();
        reset();
      }, 700);
    } catch (err: any) {
      const msg =
        typeof err?.message === "string" ? err.message : "No se pudo guardar la asignación.";
      setToast({ type: "error", msg });
      console.error("[useAssignForm] ✗ Error al guardar:", err);
    } finally {
      setLoading(false);
    }
  }, [
    validate,
    idHabitacion,
    nombre,
    prioridad,
    descripcion,
    fecha,
    hora,
    notas,
    editingId,
    onSuccess,
    onClose,
    reset,
    buildISO,
  ]);

  return {
    // nombres “canónicos”
    idHabitacion,
    setIdHabitacion,
    // alias para no romper consumidores existentes (UI que espera snake_case)
    id_habitacion: idHabitacion,
    // resto
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
    errors,
    canSave,
    loading,
    toast,
    handleSave,
    reset,
  };
}
