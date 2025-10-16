"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Home, Clock3, Calendar as CalendarIcon, UserRound } from "lucide-react";
import type { MantenimientoItem } from "../../types/mantenimiento";
import { getUsers } from "../../services/usersMantenimiento";
import mantenimientoService from "../../services/maintenanceService";
import { combineDateTimeToISO } from "../../utils/datetime";

/* -------------------------------- Helpers -------------------------------- */

function PriorityPill({ value }: Readonly<{ value?: string | null }>) {
  const v = (value ?? "").toLowerCase();
  const map: Record<string, string> = {
    baja: "bg-slate-100 text-slate-700",
    media: "bg-amber-100 text-amber-700",
    alta: "bg-rose-100 text-rose-700",
    urgente: "bg-rose-200 text-rose-800 ring-1 ring-rose-300",
  };
  const label = v ? v[0].toUpperCase() + v.slice(1) : "—";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${map[v] ?? "bg-slate-100 text-slate-700"}`}>
      {label}
    </span>
  );
}

function extractDate(iso?: string | null) {
  if (typeof iso === "string" && iso.length >= 10) return iso.slice(0, 10);
  return "";
}

function extractTime(iso?: string | null, horaCruda?: string | null) {
  if (typeof horaCruda === "string" && /^\d{2}:\d{2}/.test(horaCruda)) return horaCruda.slice(0, 5);
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return ""; // ✅ fix Sonar
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/* --------------------------------- Props --------------------------------- */

type Props = Readonly<{
  isOpen: boolean;
  onClose: () => void;
  item?: MantenimientoItem | null;
  /** Avisar éxito al padre; enviamos el item actualizado para optimismo opcional */
  onSaved?: (updated?: MantenimientoItem) => void;
}>;

/* --------------------------------- Modal --------------------------------- */

export default function AssignMaintenanceModal({ isOpen, onClose, item, onSaved }: Props) {
  // ESC
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const [users, setUsers] = useState<Array<{ id: number; nombreCompleto: string }>>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [errorUsers, setErrorUsers] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | "">("");
  const [fecha, setFecha] = useState<string>("");
  const [hora, setHora] = useState<string>("");

  // precarga valores del item cuando abre
  useEffect(() => {
    if (item) {
      const iso = (item as any)?.scheduledAt ?? (item as any)?.fecha_inicio ?? null;
      const horaCruda = (item as any)?.hora_inicio ?? null;
      setFecha(extractDate(iso));
      setHora(extractTime(iso, horaCruda));
      setSelectedUserId(item?.usuario_asignado?.id ?? item?.usuario_reporta?.id ?? "");
    } else {
      setFecha("");
      setHora("");
      setSelectedUserId("");
    }
  }, [item]);

  // cargar usuarios al abrir
  useEffect(() => {
    if (!isOpen) return;
    let alive = true;

    (async () => {
      try {
        setLoadingUsers(true);
        setErrorUsers(null);
        const data = await getUsers();
        if (!alive) return;
        setUsers(Array.isArray(data) ? data : []);
      } catch (err: unknown) {
        if (!alive) return;
        setErrorUsers(err instanceof Error ? err.message : "No se pudieron cargar los usuarios");
        setUsers([]);
      } finally {
        if (alive) setLoadingUsers(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const habNumero = item?.habitacion?.numero ?? "—";
  const habPiso = item?.habitacion?.piso ?? "—";
  const prioridad = (item as any)?.prioridad ?? null;
  const nota = (item as any)?.summary ?? (item as any)?.descripcion ?? (item as any)?.notas ?? "";

  const ids = {
    asignadoA: "mnt-asignadoA",
    fecha: "mnt-fecha",
    hora: "mnt-hora",
  } as const;

  async function handleSave() {
    if (!item?.id) return;
    setSaving(true);
    try {
      const body: any = {};
      if (selectedUserId !== "") body.id_usuario_asigna = Number(selectedUserId);
      const iso = combineDateTimeToISO(fecha, hora);
      if (iso) body.fecha_inicio = iso;

      const resp = await mantenimientoService.updateMantenimiento(item.id, body);
      const updated = resp?.data;
      onSaved?.(updated); // ✅ devolvemos el item actualizado
      onClose();          // cerrar modal
    } catch (err: unknown) {
      console.error("[AssignMantenimiento] updateMantenimiento failed:", err);
      alert(err instanceof Error ? err.message : "No se pudo guardar la asignación");
    } finally {
      setSaving(false);
    }
  }

  return createPortal(
    <>
      <button type="button" aria-label="Cerrar modal" onClick={onClose} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
      <dialog
        open
        aria-modal="true"
        aria-labelledby="assign-modal-title"
        className="fixed z-[51] inset-0 m-0 grid place-items-center w-full h-full bg-transparent"
      >
        <div className="w-full max-w-xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4" style={{ backgroundColor: "#304D3C" }}>
            <div className="flex items-center gap-3">
              <div className="h-7 w-7 rounded-lg bg-white/15" aria-hidden="true" />
              <div>
                <h2 id="assign-modal-title" className="text-lg font-semibold leading-tight text-white">
                  Asignar mantenimiento
                </h2>
                <p className="text-xs/5 text-white/80">Define responsable y programación</p>
              </div>
            </div>
            <button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-lg p-2 text-white/90 hover:bg-white/10 transition">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-white">
            {/* Resumen */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="flex items-center gap-2 sm:col-span-2">
                  <Home className="h-4 w-4 text-slate-500" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-slate-500 leading-tight">Habitación / Piso</p>
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      Habitación {habNumero} <span className="text-slate-500 font-normal">· Piso {habPiso}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center sm:justify-end">
                  <div className="text-right sm:text-right">
                    <p className="text-[11px] text-slate-500 leading-tight">Prioridad</p>
                    <div className="mt-1">
                      <PriorityPill value={prioridad} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Nota */}
            {nota && (
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-sm font-medium text-slate-800 mb-1">Nota de la tarea</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{String(nota)}</p>
              </div>
            )}

            {/* Programación */}
            <div>
              <p className="text-sm font-medium text-slate-800">Programación</p>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <div className="relative">
                  <label htmlFor={ids.fecha} className="sr-only">Fecha</label>
                  <input
                    id={ids.fecha}
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <CalendarIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
                <div className="relative">
                  <label htmlFor={ids.hora} className="sr-only">Hora</label>
                  <input
                    id={ids.hora}
                    type="time"
                    value={hora}
                    onChange={(e) => setHora(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <Clock3 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
              <p className="mt-1 text-xs text-slate-500">Ajusta fecha y hora si necesitas reprogramar.</p>
            </div>

            {/* Asignado a */}
            <div>
              <label htmlFor="mnt-usuario" className="text-sm font-medium text-slate-800 flex items-center gap-2">
                <UserRound className="h-4 w-4 text-slate-500" />
                Asignado a
              </label>

              <select
                id="mnt-usuario"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value ? Number(e.target.value) : "")}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                disabled={loadingUsers}
              >
                <option value="">— Seleccionar usuario —</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nombreCompleto}
                  </option>
                ))}
              </select>

              {loadingUsers && <p className="mt-1 text-xs text-slate-500">Cargando usuarios…</p>}
              {errorUsers && <p className="mt-1 text-xs text-rose-600">{errorUsers}</p>}
              {!loadingUsers && !errorUsers && users.length === 0 && (
                <p className="mt-1 text-xs text-slate-500">No hay usuarios disponibles.</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white px-6 py-4 flex items-center justify-end gap-2 border-t border-slate-100">
            <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70"
              title="Guardar cambios"
            >
              {saving ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </div>
      </dialog>
    </>,
    document.body
  );
}
