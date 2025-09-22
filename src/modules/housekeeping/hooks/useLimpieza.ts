// src/modules/housekeeping/hooks/useLimpieza.ts
import { useState, useEffect, useCallback, useMemo } from "react";
import { limpiezaService } from "../services/limpiezaService";
import type { Prioridad, LimpiezaCreateDTO } from "../types/limpieza";

type UseAssignFormOptions = {
  id_habitacion?: number | null;
  id_usuario_asigna?: number | null;
  defaultNombre?: string;
  defaultDescripcion?: string;
  defaultPrioridad?: Prioridad | null;
  onSuccess?: () => void;
  onClose?: () => void;
};

export function useAssignForm(opts: Readonly<UseAssignFormOptions> = {}) {
  const {
    id_habitacion: initialHabitacion = null,
    id_usuario_asigna = null,
    defaultNombre = "",
    defaultDescripcion = "",
    defaultPrioridad = null,
    onSuccess,
    onClose,
  } = opts;

  // 👇 Renombrado a camelCase para contentar Sonar (value + setter pair)
  const [habitacionId, setHabitacionId] = useState<number | null>(initialHabitacion);

  const [nombre, setNombre] = useState<string>(defaultNombre);
  const [descripcion, setDescripcion] = useState<string>(defaultDescripcion);
  const [prioridad, setPrioridad] = useState<Prioridad | null>(defaultPrioridad);
  const [fecha, setFecha] = useState<string>(""); // YYYY-MM-DD
  const [hora, setHora] = useState<string>("");   // HH:mm
  const [notas, setNotas] = useState<string>(""); // opcional
  const [loading, setLoading] = useState<boolean>(false);

  // Sincroniza si cambia el valor inicial externo
  useEffect(() => {
    setHabitacionId(initialHabitacion ?? null);
  }, [initialHabitacion]);

  const reset = useCallback(() => {
    setNombre(defaultNombre);
    setDescripcion(defaultDescripcion);
    setPrioridad(defaultPrioridad);
    setFecha("");
    setHora("");
    setNotas("");
    setHabitacionId(initialHabitacion ?? null);
  }, [defaultNombre, defaultDescripcion, defaultPrioridad, initialHabitacion]);

  // Validación mínima (sin boolean literal redundante)
  const canSave = useMemo(() => {
    const hasNombre = nombre.trim().length > 0;
    const hasFecha = fecha !== "";
    const hasHora = hora !== "";
    // Si quieres obligar habitación, añade: && habitacionId !== null
    return hasNombre && hasFecha && hasHora;
  }, [nombre, fecha, hora /*, habitacionId*/]);

  const handleSave = useCallback(async () => {
    if (!canSave) return;

    setLoading(true);
    try {
      const fecha_inicio = `${fecha}T${hora}:00`;

      const payload: LimpiezaCreateDTO = {
        nombre,
        descripcion: descripcion || null,
        notas: notas || null,
        prioridad: prioridad ?? null,
        fecha_inicio,
        fecha_final: null,
        id_habitacion: habitacionId ?? null,
        id_usuario_asigna: id_usuario_asigna ?? null,
        id_estado_hab: null,
      };

      await limpiezaService.createLimpieza(payload);
      onSuccess?.();
      onClose?.();
      reset();
    } catch (err) {
      console.error("Error creating limpieza:", err);
    } finally {
      setLoading(false);
    }
  }, [
    canSave,
    nombre,
    descripcion,
    notas,
    prioridad,
    fecha,
    hora,
    habitacionId,
    id_usuario_asigna,
    onSuccess,
    onClose,
    reset,
  ]);

  return {
    // state
    id_habitacion: habitacionId,
    setIdHabitacion: setHabitacionId,
    nombre, setNombre,
    descripcion, setDescripcion,
    prioridad, setPrioridad,
    fecha, setFecha,
    hora, setHora,
    notas, setNotas,

    // flags
    canSave,
    loading,

    // actions
    handleSave,
    reset,
  };
}
