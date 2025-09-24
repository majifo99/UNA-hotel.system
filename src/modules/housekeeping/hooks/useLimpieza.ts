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

  const [habitacionId, setHabitacionId] = useState<number | null>(initialHabitacion);
  const [nombre, setNombre] = useState<string>(defaultNombre);
  const [descripcion, setDescripcion] = useState<string>(defaultDescripcion);
  const [prioridad, setPrioridad] = useState<Prioridad | null>(defaultPrioridad);
  const [fecha, setFecha] = useState<string>("");
  const [hora, setHora] = useState<string>("");
  const [notas, setNotas] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

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

  const canSave = useMemo(() => {
    const hasNombre = nombre.trim().length > 0;
    const hasFecha = fecha !== "";
    const hasHora = hora !== "";
    return hasNombre && hasFecha && hasHora;
  }, [nombre, fecha, hora]);

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
    id_habitacion: habitacionId,
    setIdHabitacion: setHabitacionId,
    nombre,
    setNombre,
    descripcion,
    setDescripcion,
    prioridad,
    setPrioridad,
    fecha,
    setFecha,
    hora,
    setHora,
    notas,
    setNotas,
    canSave,
    loading,
    handleSave,
    reset,
  };
}