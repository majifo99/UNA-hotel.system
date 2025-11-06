// src/modules/housekeeping/components/FilterBarHistoriales.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Props = Readonly<{
  q: string;
  desde?: string;
  hasta?: string;
  perPage: number;
  total?: number;
  onChange: (next: { q?: string; desde?: string; hasta?: string; perPage?: number }) => void;
}>;

/** Barra de filtros con debounce y controles básicos */
export default function FilterBarHistoriales({
  q, desde, hasta, perPage, total = 0, onChange,
}: Props) {
  const [localQ, setLocalQ] = useState(q);
  // En entorno browser (use client), setTimeout devuelve number
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onChangeQ = useCallback((value: string) => {
    setLocalQ(value);

    if (debounceRef.current !== null) {
      globalThis.clearTimeout(debounceRef.current);
    }

    debounceRef.current = globalThis.setTimeout(() => {
      onChange({ q: value });
    }, 350);
  }, [onChange]);

  // Limpieza del timeout al desmontar
  useEffect(() => {
    return () => {
      if (debounceRef.current !== null) {
        globalThis.clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <section className="rounded-2xl bg-white shadow ring-1 ring-slate-200 p-4">
      <div className="grid gap-3 md:grid-cols-[1fr_160px_160px_140px_1fr]">
        <input
          value={localQ}
          onChange={(e) => onChangeQ(e.target.value)}
          placeholder="Buscar en cualquier campo (evento, actor, notas, prioridad...)"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
        />

        <input
          type="date"
          value={desde ?? ""}
          onChange={(e) => onChange({ desde: e.target.value || undefined })}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          title="Desde (fecha)"
        />

        <input
          type="date"
          value={hasta ?? ""}
          onChange={(e) => onChange({ hasta: e.target.value || undefined })}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          title="Hasta (fecha)"
        />

        <select
          value={perPage}
          onChange={(e) => onChange({ perPage: Number.parseInt(e.target.value, 10) })}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          title="Elementos por página"
        >
          <option value={7}>7 / pág.</option>
          <option value={10}>10 / pág.</option>
          <option value={20}>20 / pág.</option>
          <option value={50}>50 / pág.</option>
          <option value={100}>100 / pág.</option>
        </select>

        <div className="flex items-center justify-end">
          <span className="text-sm text-slate-600">Total: {total}</span>
        </div>
      </div>
    </section>
  );
}
