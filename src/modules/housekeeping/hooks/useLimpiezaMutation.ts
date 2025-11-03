import { useCallback, useMemo, useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Prioridad, LimpiezaItem } from "../types/limpieza";
import { PRIORIDADES } from "../types/limpieza";
import { limpiezaService } from "../services/limpiezaService";
import { limpiezasKeys } from "./useLimpiezasQuery";
import type { UserItem } from "../types/user";

type UseLimpiezaMutationParams = {
  id_habitacion: number | null;
  editingId?: number | null;
  initialItem?: Partial<LimpiezaItem> | null;
  onSuccess?: () => void;
  onClose?: () => void;
  onPatched?: (updated: any) => void;
  users?: UserItem[];
};

/* ------------------------- helpers ------------------------ */
const trim = (s?: string) => (s ?? "").trim();
const isYMD = (s?: string) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);
const isHM = (s?: string) => !!s && /^\d{2}:\d{2}$/.test(s);

const invalidRoom = (id: number | null) =>
  id == null || Number.isNaN(Number(id));

const hasFechaOnly = (f?: string, h?: string) => !!f && !h;
const hasHoraOnly = (f?: string, h?: string) => !!h && !f;
const missingDatePair = (f?: string, h?: string) =>
  hasFechaOnly(f, h) || hasHoraOnly(f, h);

const invalidFechaFmt = (f?: string, faltaPar?: boolean) =>
  !!f && !faltaPar && !isYMD(f);

const invalidHoraFmt = (h?: string, faltaPar?: boolean) =>
  !!h && !faltaPar && !isHM(h);

const invalidPrioridad = (p?: Prioridad | null) =>
  !!p && !PRIORIDADES.includes(p);

const invalidAsignado = (a: number | null) =>
  a != null && Number.isNaN(Number(a));

const invalidNombre = (n: string) =>
  !!n && (n.length < 3 || n.length > 100);

const invalidDescripcion = (d: string) =>
  !!d && d.length > 500;

const invalidNotas = (n: string) =>
  !!n && n.length > 500;

const anyFieldChanged = (ctx: {
  prioridad: Prioridad | null;
  nombre: string;
  descripcion: string;
  notas: string;
  fecha?: string;
  hora?: string;
  asignadoA: number | null;
}) => {
  if (ctx.prioridad && !invalidPrioridad(ctx.prioridad)) return true;
  if (ctx.nombre) return true;
  if (ctx.descripcion) return true;
  if (ctx.notas) return true;
  if (ctx.fecha && ctx.hora) return true;
  if (typeof ctx.asignadoA === "number") return true;
  return false;
};

/* --------------------------------------------------------- */

export function useLimpiezaMutation(params: UseLimpiezaMutationParams) {
  const { id_habitacion: initialRoomId, editingId, initialItem, onSuccess, onClose, onPatched, users = [] } = params;
  const queryClient = useQueryClient();

  // ----- State del formulario -----
  const [idHabitacion, setIdHabitacion] = useState<number | null>(initialRoomId);
  const [asignadoA, setAsignadoA] = useState<number | null>(null);
  const [prioridad, setPrioridad] = useState<Prioridad | null>(null);
  const [nombre, setNombre] = useState<string>("");
  const [descripcion, setDescripcion] = useState<string>("");
  const [fecha, setFecha] = useState<string>("");
  const [hora, setHora] = useState<string>("");
  const [notas, setNotas] = useState<string>("");

  // Sincronizar idHabitacion con prop
  useEffect(() => {
    if (initialRoomId != null) {
      setIdHabitacion(initialRoomId);
    }
  }, [initialRoomId]);

  // ✅ Cargar datos iniciales cuando se está editando
  useEffect(() => {
    if (editingId && initialItem) {
      // Cargar usuario asignado
      const usuarioId = (initialItem as any)?.id_usuario_asigna ?? (initialItem as any)?.usuario_asignado?.id ?? null;
      setAsignadoA(usuarioId);

      // Cargar prioridad
      const prioridadValue = (initialItem as any)?.prioridad;
      if (prioridadValue && PRIORIDADES.includes(prioridadValue as Prioridad)) {
        setPrioridad(prioridadValue as Prioridad);
      }

      // Cargar fecha y hora programada
      const fechaInicio = (initialItem as any)?.fecha_inicio;
      if (fechaInicio) {
        try {
          const date = new Date(fechaInicio);
          if (!isNaN(date.getTime())) {
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, "0");
            const dd = String(date.getDate()).padStart(2, "0");
            setFecha(`${yyyy}-${mm}-${dd}`);

            const hh = String(date.getHours()).padStart(2, "0");
            const mi = String(date.getMinutes()).padStart(2, "0");
            setHora(`${hh}:${mi}`);
          }
        } catch (e) {
          // Ignorar errores de parsing
        }
      }

      // Cargar notas
      const notasValue = (initialItem as any)?.notas ?? "";
      setNotas(notasValue);

      // Cargar nombre y descripción (si existen)
      const nombreValue = (initialItem as any)?.nombre ?? "";
      setNombre(nombreValue);

      const descripcionValue = (initialItem as any)?.descripcion ?? "";
      setDescripcion(descripcionValue);
    }
  }, [editingId, initialItem]);

  // ----- UI -----
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // fecha + hora → ISO
  const buildISO = useCallback((d?: string, t?: string) => {
    if (!d || !t) return undefined;
    const [Y, M, D] = d.split("-").map(Number);
    const [h, m] = t.split(":").map(Number);
    const js = new Date(Y, (M ?? 1) - 1, D ?? 1, h ?? 0, m ?? 0, 0, 0);
    return js.toISOString();
  }, []);

  // ✅ Mutation con optimistic update SIMPLE para velocidad máxima
  const updateMutation = useMutation({
    mutationFn: async ({ targetId, payload }: { targetId: number; payload: Record<string, any> }) => {
      return await limpiezaService.updateLimpieza(targetId, payload, "PATCH");
    },
    onMutate: async ({ targetId, payload }) => {
      // ✅ Actualización optimista SIMPLE - UI instantánea
      await queryClient.cancelQueries({ queryKey: limpiezasKeys.lists() });

      const previousData = queryClient.getQueryData(limpiezasKeys.lists());

      // Actualizar todas las queries de lista
      queryClient.setQueriesData({ queryKey: limpiezasKeys.lists() }, (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((item: any) => {
            if (item.id !== targetId && item.id_limpieza !== targetId) return item;

            // ✅ Si estamos asignando un usuario, construir el objeto usuario_asignado
            let updatedPayload = { ...payload };
            if (payload.id_usuario_asigna && users.length > 0) {
              const user = users.find(u => u.id === payload.id_usuario_asigna);
              if (user) {
                // Solo usar el primer nombre
                const primerNombre = user.nombreCompleto.split(/\s+/)[0] || user.nombreCompleto;
                updatedPayload = {
                  ...payload,
                  usuario_asignado: {
                    id: user.id,
                    nombre: primerNombre,
                  }
                };
              }
            }

            return { ...item, ...updatedPayload };
          }),
        };
      });

      // ✅ CERRAR MODAL INMEDIATAMENTE después del optimistic update
      setToast({ type: "success", msg: "Cambios guardados." });
      onSuccess?.();
      onClose?.();

      return { previousData };
    },
    onSuccess: (resp) => {
      const updated = (resp as any)?.data ?? resp;

      // ✅ NO hacer refetch - el optimistic update ya actualizó la UI
      queryClient.invalidateQueries({
        queryKey: limpiezasKeys.lists(),
        refetchType: 'none'
      });

      onPatched?.(updated);
    },
    onError: (err, _vars, context) => {
      // Rollback simple
      if (context?.previousData) {
        queryClient.setQueryData(limpiezasKeys.lists(), context.previousData);
      }
      const msg = typeof err?.message === "string" ? err.message : "No se pudo actualizar.";
      setToast({ type: "error", msg });
    },
  });

  const canSave = useMemo(() => {
    if (invalidRoom(idHabitacion)) {
      return false;
    }

    const hasChanges = anyFieldChanged({
      prioridad,
      nombre: trim(nombre),
      descripcion: trim(descripcion),
      notas: trim(notas),
      fecha,
      hora,
      asignadoA,
    });

    return hasChanges;
  }, [idHabitacion, prioridad, nombre, descripcion, notas, fecha, hora, asignadoA]);

  const validate = useCallback(() => {
    const e: Record<string, string> = {};

    const tNombre = trim(nombre);
    const tDesc = trim(descripcion);
    const tNotas = trim(notas);
    const faltaPar = missingDatePair(fecha, hora);

    const checks = [
      { cond: invalidRoom(idHabitacion), key: "id_habitacion", msg: "Selecciona una habitación válida." },
      { cond: faltaPar, key: "fecha", msg: "Si cambias la programación, llena fecha y hora." },
      { cond: invalidFechaFmt(fecha, faltaPar), key: "fecha", msg: "Formato inválido (yyyy-MM-dd)." },
      { cond: invalidHoraFmt(hora, faltaPar), key: "hora", msg: "Formato inválido (HH:mm)." },
      { cond: invalidNombre(tNombre), key: "nombre", msg: "El nombre debe tener entre 3 y 100 caracteres." },
      { cond: invalidDescripcion(tDesc), key: "descripcion", msg: "Máximo 500 caracteres." },
      { cond: invalidNotas(tNotas), key: "notas", msg: "Máximo 500 caracteres." },
      { cond: invalidPrioridad(prioridad), key: "prioridad", msg: "Prioridad inválida." },
      { cond: invalidAsignado(asignadoA), key: "asignadoA", msg: "Selecciona un usuario válido." },
      {
        cond: !anyFieldChanged({
          prioridad,
          nombre: tNombre,
          descripcion: tDesc,
          notas: tNotas,
          fecha,
          hora,
          asignadoA,
        }),
        key: "form",
        msg: "No hay cambios para guardar.",
      },
    ] as const;

    for (const c of checks) if (c.cond) e[c.key] = c.msg;

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
    // ✅ Prevenir múltiples submissions
    if (isSaving || updateMutation.isPending) {
      console.log("⏸️ Ya hay una mutation en progreso, ignorando...");
      return;
    }

    if (!validate()) return;
    if (idHabitacion == null) {
      setErrors((p) => ({ ...p, id_habitacion: "Falta el ID de la habitación." }));
      return;
    }

    // Preparar payload ANTES de setIsSaving para máxima velocidad
    const payload: Record<string, any> = {};
    const tNombre = trim(nombre);
    const tDesc = trim(descripcion);
    const tNotas = trim(notas);

    if (prioridad) payload.prioridad = prioridad;
    if (tNombre) payload.nombre = tNombre;
    if (tDesc) payload.descripcion = tDesc;
    if (tNotas) payload.notas = tNotas;

    const iso = buildISO(fecha, hora);
    if (iso) payload.fecha_inicio = iso;

    if (typeof asignadoA === "number") {
      payload.id_usuario_asigna = asignadoA;
    }

    setToast(null);
    setIsSaving(true); // ✅ Feedback inmediato

    try {
      // Buscar targetId
      let targetId: number | null =
        editingId != null && !Number.isNaN(Number(editingId)) ? editingId : null;

      if (targetId == null) {
        const list = await limpiezaService.getLimpiezas({ id_habitacion: idHabitacion, per_page: 1 });
        const first = (list?.data ?? [])[0] as any;
        targetId = first?.id_limpieza ?? first?.id ?? null;
      }

      if (targetId == null) throw new Error("No se encontró una limpieza existente para esta habitación.");

      // ✅ Ejecutar mutation con optimistic update
      await updateMutation.mutateAsync({ targetId, payload });
    } catch (err: any) {
      // Error ya manejado en onError de la mutation
    } finally {
      setIsSaving(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    buildISO,
    // NO incluir updateMutation aquí para evitar re-creación infinita
  ]);

  return {
    idHabitacion,
    setIdHabitacion,
    id_habitacion: idHabitacion,

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
    asignadoA,
    setAsignadoA,

    errors,
    canSave,
    loading: isSaving || updateMutation.isPending,
    toast,
    handleSave,
    reset,
  };
}
