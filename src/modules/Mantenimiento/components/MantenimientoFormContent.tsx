"use client";
import React from "react";
import { Home, UserRound, AlertCircle } from "lucide-react";
import type { Prioridad } from "../types/mantenimiento";

interface Props {
  habNumero: string | number;
  habPiso: string | number;
  users: Array<{ id: number; nombreCompleto: string }>;
  selectedUserId: number | "" ;
  onUserChange: (value: number | "") => void;
  prioridadLocal: Prioridad | "";
  onPrioridadChange: (value: Prioridad | "") => void;
  notasLocal: string;
  onNotasChange: (value: string) => void;
  loadingUsers: boolean;
}

const PRIORIDADES: Prioridad[] = ["baja", "media", "alta", "urgente"];

export const MantenimientoFormContent: React.FC<Props> = ({
  habNumero,
  habPiso,
  users,
  selectedUserId,
  onUserChange,
  prioridadLocal,
  onPrioridadChange,
  notasLocal,
  onNotasChange,
  loadingUsers,
}) => (
  <>
    {/* Habitación */}
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex items-center gap-2">
        <Home className="h-4 w-4 text-slate-500" />
        <div>
          <p className="text-[11px] text-slate-500">Habitación / Piso</p>
          <p className="text-sm font-semibold text-slate-800">
            Habitación {habNumero}{" "}
            <span className="text-slate-500 font-normal">· Piso {habPiso}</span>
          </p>
        </div>
      </div>
    </div>

    {/* Asignado y Prioridad */}
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className="text-sm font-medium text-slate-800 flex items-center gap-2">
          <UserRound className="h-4 w-4 text-slate-500" /> Asignado a
        </label>
        <select
          value={selectedUserId}
          onChange={(e) => onUserChange(e.target.value ? Number(e.target.value) : "")}
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
          onChange={(e) => onPrioridadChange(e.target.value as Prioridad | "")}
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

    {/* Notas */}
    <div>
      <label htmlFor="notas" className="text-sm font-medium text-slate-800">
        Notas (opcional)
      </label>
      <textarea
        id="notas"
        value={notasLocal}
        onChange={(e) => onNotasChange(e.target.value)}
        placeholder="Notas adicionales (opcional)"
        rows={4}
        maxLength={500}
        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-darkGreen2)] resize-none"
      />
      <p className="mt-1 text-xs text-slate-500">
        Máximo 500 caracteres · {notasLocal.length}/500
      </p>
    </div>
  </>
);
