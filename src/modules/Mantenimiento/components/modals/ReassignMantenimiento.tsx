"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Save, RefreshCw, Home, UserRound, AlertCircle } from "lucide-react";
import type { MantenimientoItem, Prioridad } from "../../types/mantenimiento";
import { getUsers } from "../../services/usersMantenimiento";
import mantenimientoService from "../../services/maintenanceService";

/* -------------------------------- Constants -------------------------------- */
const PRIORIDADES: Prioridad[] = ["baja", "media", "alta", "urgente"];

/* --------------------------------- Props --------------------------------- */

type Props = Readonly<{
  isOpen: boolean;
  onClose: () => void;
  item: MantenimientoItem | null;
  /** Avisar éxito al padre; enviamos el item actualizado para optimismo opcional */
  onSaved?: (updated?: MantenimientoItem) => void;
}>;

/* --------------------------------- Modal --------------------------------- */

export default function ReassignMaintenanceModal({ isOpen, onClose, item, onSaved }: Props) {
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
  const [prioridadLocal, setPrioridadLocal] = useState<Prioridad | "">("");
  const [notasLocal, setNotasLocal] = useState<string>("");

  // Precarga valores del item cuando abre (REASIGNACIÓN)
  useEffect(() => {
    if (item) {
      setSelectedUserId(item?.usuario_asignado?.id ?? item?.usuario_reporta?.id ?? "");

      // Cargar prioridad y notas existentes
      const prioridadActual = (item as any)?.prioridad ?? "";
      setPrioridadLocal(prioridadActual);

      const notasActuales = (item as any)?.notas ?? "";
      setNotasLocal(notasActuales);
    } else {
      setSelectedUserId("");
      setPrioridadLocal("");
      setNotasLocal("");
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

  const ids = {
    asignadoA: "reassign-asignadoA",
    prioridad: "reassign-prioridad",
    notas: "reassign-notas",
  } as const;

  async function handleSave() {
    if (!item?.id) return;
    setSaving(true);
    try {
      const body: any = {};

      // ✅ Si el mantenimiento está finalizado, reabrirlo
      const estaFinalizado = item.fecha_final !== null && item.fecha_final !== undefined;
      if (estaFinalizado) {
        body.fecha_final = null; // ✅ Limpiar fecha_final para reabrir
      }

      // Usuario asignado
      if (selectedUserId !== "") body.id_usuario_asigna = Number(selectedUserId);

      // Prioridad
      if (prioridadLocal !== "") body.prioridad = prioridadLocal;

      // Notas
      if (notasLocal.trim() !== "") body.notas = notasLocal.trim();

      const resp = await mantenimientoService.updateMantenimiento(item.id, body);
      const updated = resp?.data;
      onSaved?.(updated);
      onClose();
    } catch (err: unknown) {
      console.error("[ReassignMantenimiento] updateMantenimiento failed:", err);
      alert(err instanceof Error ? err.message : "No se pudo guardar la reasignación");
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
        aria-labelledby="reassign-modal-title"
        className="fixed z-[51] inset-0 m-0 grid place-items-center w-full h-full bg-transparent"
      >
        <div className="w-full max-w-xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4" style={{ backgroundColor: "#304D3C" }}>
            <div className="flex items-center gap-3">
              <RefreshCw className="h-6 w-6 text-white" />
              <div>
                <h2 id="reassign-modal-title" className="text-lg font-semibold leading-tight text-white">
                  Reasignar mantenimiento
                </h2>
                <p className="text-xs/5 text-white/80">Actualiza responsable, prioridad, notas y programación</p>
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
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-slate-500" />
                <div className="min-w-0">
                  <p className="text-[11px] text-slate-500 leading-tight">Habitación / Piso</p>
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    Habitación {habNumero} <span className="text-slate-500 font-normal">· Piso {habPiso}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Grid: Usuario y Prioridad */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Asignado a */}
              <div>
                <label htmlFor={ids.asignadoA} className="text-sm font-medium text-slate-800 flex items-center gap-2">
                  <UserRound className="h-4 w-4 text-slate-500" />
                  Asignado a
                </label>

                <select
                  id={ids.asignadoA}
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value ? Number(e.target.value) : "")}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  disabled={loadingUsers}
                >
                  <option value="">Seleccionar usuario</option>
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

              {/* Prioridad */}
              <div>
                <label htmlFor={ids.prioridad} className="text-sm font-medium text-slate-800 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-slate-500" />
                  Nivel de prioridad
                </label>
                <select
                  id={ids.prioridad}
                  value={prioridadLocal}
                  onChange={(e) => setPrioridadLocal(e.target.value as Prioridad | "")}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="">Seleccionar prioridad</option>
                  {PRIORIDADES.map((p) => (
                    <option key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notas */}
            <div>
              <label htmlFor={ids.notas} className="text-sm font-medium text-slate-800">
                Notas (opcional)
              </label>
              <textarea
                id={ids.notas}
                placeholder="Notas adicionales (opcional)"
                maxLength={500}
                value={notasLocal}
                onChange={(e) => setNotasLocal(e.target.value)}
                rows={4}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
              <p className="mt-1 text-xs text-slate-500">
                Máximo 500 caracteres · {notasLocal.length}/500
              </p>
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
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70"
              title="Guardar cambios"
            >
              <Save className="h-4 w-4" />
              {saving ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        </div>
      </dialog>
    </>,
    document.body
  );
}
