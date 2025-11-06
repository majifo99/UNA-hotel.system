"use client";

import { useEffect, useState } from "react";
import { Home, UserRound, AlertCircle } from "lucide-react";
import { MantenimientoModalBase } from "./MantenimientoModalBase";
import type { MantenimientoItem, Prioridad } from "../../types/mantenimiento";
import { getUsers } from "../../services/usersMantenimiento";
import mantenimientoService from "../../services/maintenanceService";

const PRIORIDADES: Prioridad[] = ["baja", "media", "alta", "urgente"];

type Props = {
  isOpen: boolean;
  onClose: () => void;
  item: MantenimientoItem | null;
  onSaved?: (updated?: MantenimientoItem) => void;
};

export default function AssignMaintenanceModal({ isOpen, onClose, item, onSaved }: Props) {
  const [users, setUsers] = useState<Array<{ id: number; nombreCompleto: string }>>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | "">("");
  const [prioridadLocal, setPrioridadLocal] = useState<Prioridad | "">("");
  const [notasLocal, setNotasLocal] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Cargar lista de usuarios (sin precargar valores)
  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        setLoadingUsers(true);
        const data = await getUsers();
        setUsers(Array.isArray(data) ? data : []);
      } finally {
        setLoadingUsers(false);
      }
    })();
    setSelectedUserId("");
    setPrioridadLocal("");
    setNotasLocal("");
  }, [isOpen]);

  async function handleSave() {
    if (!item?.id) return;
    setSaving(true);
    try {
      const body: any = {};
      if (selectedUserId) body.id_usuario_asigna = Number(selectedUserId);
      if (prioridadLocal) body.prioridad = prioridadLocal;
      if (notasLocal.trim()) body.notas = notasLocal.trim();

      const { data } = await mantenimientoService.updateMantenimiento(item.id, body);
      onSaved?.(data);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  const habNumero = item?.habitacion?.numero ?? "—";
  const habPiso = item?.habitacion?.piso ?? "—";

  return (
    <MantenimientoModalBase
      isOpen={isOpen}
      onClose={onClose}
      title="Editar mantenimiento"
      subtitle="Modifica los campos que necesites actualizar."
      icon={<div className="h-6 w-6 rounded-full bg-white/20" />}
      onSave={handleSave}
      saving={saving}
    >
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <Home className="h-4 w-4 text-slate-500" />
          <div>
            <p className="text-[11px] text-slate-500">Habitación / Piso</p>
            <p className="text-sm font-semibold text-slate-800">
              Habitación {habNumero} <span className="text-slate-500 font-normal">· Piso {habPiso}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-800 flex items-center gap-2">
            <UserRound className="h-4 w-4 text-slate-500" /> Asignado a
          </label>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value ? Number(e.target.value) : "")}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-darkGreen2)]"
            disabled={loadingUsers}
          >
            <option value="">Sin asignar</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nombreCompleto}
              </option>
            ))}
          </select>
          {loadingUsers && <p className="mt-1 text-xs text-slate-500">Cargando usuarios...</p>}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-800 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-slate-500" /> Nivel de prioridad
          </label>
          <select
            value={prioridadLocal}
            onChange={(e) => setPrioridadLocal(e.target.value as Prioridad | "")}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-darkGreen2)]"
          >
            <option value="">Sin prioridad</option>
            {PRIORIDADES.map((p) => (
              <option key={p} value={p}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="notas" className="text-sm font-medium text-slate-800">Notas (opcional)</label>
        <textarea
          id="notas"
          value={notasLocal}
          onChange={(e) => setNotasLocal(e.target.value)}
          placeholder="Notas adicionales (opcional)"
          rows={4}
          maxLength={500}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-darkGreen2)] resize-none"
        />
        <p className="mt-1 text-xs text-slate-500">
          Máximo 500 caracteres · {notasLocal.length}/500
        </p>
      </div>
    </MantenimientoModalBase>
  );
}
