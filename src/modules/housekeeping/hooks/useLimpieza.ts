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

/* ------------------------- helpers “free” para Sonar ------------------------ */
const trim = (s?: string) => (s ?? "").trim();
const isYMD = (s?: string) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);
const isHM  = (s?: string) => !!s && /^\d{2}:\d{2}$/.test(s);

const invalidRoom = (id: number | null) =>
  id == null || Number.isNaN(Number(id));

const hasFechaOnly = (f?: string, h?: string) => !!f && !h;
const hasHoraOnly  = (f?: string, h?: string) => !!h && !f;
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
/* --------------------------------------------------------------------------- */

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

  // ----- Helper fecha → ISO -----
  const buildISO = useCallback((d?: string, t?: string) => {
    if (!d || !t) return undefined;
    const [Y, M, D] = d.split("-").map(Number);
    const [h, m] = t.split(":").map(Number);
    const js = new Date(Y, (M ?? 1) - 1, D ?? 1, h ?? 0, m ?? 0, 0, 0);
    return js.toISOString();
  }, []);

  /* ------------------------ canSave con predicado simple ------------------------ */
  const canSave = useMemo(() => {
    if (invalidRoom(idHabitacion)) return false;
    return anyFieldChanged({
      prioridad,
      nombre: trim(nombre),
      descripcion: trim(descripcion),
      notas: trim(notas),
      fecha,
      hora,
      asignadoA,
    });
  }, [idHabitacion, prioridad, nombre, descripcion, notas, fecha, hora, asignadoA]);

  /* --------------------- VALIDATE sin anidaciones ni mixes --------------------- */
  const validate = useCallback(() => {
  const e: Record<string, string> = {};

  const tNombre = trim(nombre);
  const tDesc   = trim(descripcion);
  const tNotas  = trim(notas);
  const faltaPar = missingDatePair(fecha, hora);

  const checks = [
    { cond: invalidRoom(idHabitacion),           key: "id_habitacion", msg: "Selecciona una habitación válida." },
    { cond: faltaPar,                            key: "fecha",         msg: "Si cambias la programación, llena fecha y hora." },
    { cond: invalidFechaFmt(fecha, faltaPar),    key: "fecha",         msg: "Formato inválido (yyyy-MM-dd)." },
    { cond: invalidHoraFmt(hora, faltaPar),      key: "hora",          msg: "Formato inválido (HH:mm)." },
    { cond: invalidNombre(tNombre),              key: "nombre",        msg: "El nombre debe tener entre 3 y 100 caracteres." },
    { cond: invalidDescripcion(tDesc),           key: "descripcion",   msg: "Máximo 500 caracteres." },
    { cond: invalidNotas(tNotas),                key: "notas",         msg: "Máximo 500 caracteres." },
    { cond: invalidPrioridad(prioridad),         key: "prioridad",     msg: "Prioridad inválida." },
    { cond: invalidAsignado(asignadoA),          key: "asignadoA",     msg: "Selecciona un usuario válido." },
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
      const tNombre = trim(nombre);
      const tDesc   = trim(descripcion);
      const tNotas  = trim(notas);

      if (prioridad) payload.prioridad = prioridad;
      if (tNombre)   payload.nombre = tNombre;
      if (tDesc)     payload.descripcion = tDesc;
      if (tNotas)    payload.notas = tNotas;

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
