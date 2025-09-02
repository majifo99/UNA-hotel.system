import { useCallback, useMemo, useState, useEffect } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type { ColumnDef } from '@tanstack/react-table';

/* ===========================
   Tipos y datos mock
=========================== */
type RoomStatus = 'available' | 'reserved' | 'checked-in' | 'checked-out' | 'maintenance';
type RoomType = 'Deluxe' | 'Standard' | 'Suite';

type Room = {
  id: string;
  roomNumber: string;
  type: RoomType;
  guestName: string | null;
  checkIn: string | null;
  checkOut: string | null;
  status: RoomStatus;
};

const seedRooms: Room[] = [
  { id: 'r301', roomNumber: '301', type: 'Deluxe',   guestName: 'Ana Rodriguez',   checkIn: '2025-08-21', checkOut: '2025-08-24', status: 'reserved' },
  { id: 'r302', roomNumber: '302', type: 'Standard', guestName: null,               checkIn: null,         checkOut: null,         status: 'available' },
  { id: 'r303', roomNumber: '303', type: 'Suite',    guestName: 'Luis Fernández',   checkIn: '2025-08-18', checkOut: '2025-08-20', status: 'checked-in' },
  { id: 'r304', roomNumber: '304', type: 'Standard', guestName: null,               checkIn: null,         checkOut: null,         status: 'maintenance' },
  { id: 'r305', roomNumber: '305', type: 'Deluxe',   guestName: 'María López',      checkIn: '2025-08-19', checkOut: '2025-08-22', status: 'checked-in' },
  { id: 'r306', roomNumber: '306', type: 'Suite',    guestName: null,               checkIn: null,         checkOut: null,         status: 'available' },
];

/* ===========================
   Constantes de dominio y UI
=========================== */
const STATUS_LABEL: Record<RoomStatus, string> = {
  available: 'Disponible',
  reserved: 'Reservada',
  'checked-in': 'Check-in',
  'checked-out': 'Check-out',
  maintenance: 'Mantenimiento',
};
const STATUS_CLASS: Record<RoomStatus, string> = {
  available: 'bg-green-100 text-green-800',
  reserved: 'bg-yellow-100 text-yellow-800',
  'checked-in': 'bg-blue-100 text-blue-800',
  'checked-out': 'bg-gray-100 text-gray-800',
  maintenance: 'bg-red-100 text-red-800',
};

/* ===========================
   Filtros (TanStack)
=========================== */
const equalsString = (row: any, columnId: string, filterValue: string) => {
  if (!filterValue) return true;
  const v = row.getValue(columnId);
  return String(v) === String(filterValue);
};
const includesString = (row: any, columnId: string, filterValue: string) => {
  if (!filterValue) return true;
  const v = row.getValue(columnId);
  return String(v ?? '').toLowerCase().includes(String(filterValue).toLowerCase());
};

/* ===========================
   Componente: Frontdesk
=========================== */
export default function Frontdesk() {
  /* ---- Estado general ---- */
  const [rooms, setRooms] = useState<Room[]>(seedRooms);
  const [columnFilters, setColumnFilters] = useState<{ id: string; value: string }[]>([]);

  /* ---- Filtro card ---- */
  type FilterField = keyof Room;
  const [filterField, setFilterField] = useState<FilterField>('roomNumber');
  const [filterValue, setFilterValue] = useState<string>('');

  const applyFilter = useCallback((field: FilterField, value: string) => {
    setFilterField(field);
    setFilterValue(value);
    setColumnFilters((prev) => {
      const others = prev.filter((f) => f.id !== field);
      if (!value) return others;
      return [...others, { id: field as string, value }];
    });
  }, []);
  const onFieldChange = (f: FilterField) => applyFilter(f, '');
  const onValueChange = (v: string) => applyFilter(filterField, v);
  const onClear = () => applyFilter(filterField, '');

  /* ---- Toast simple ---- */
  const [toast, setToast] = useState<{ text: string; type?: 'success' | 'error' | 'info' } | null>(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  /* ---- Modal de reserva ---- */
  const [modalOpen, setModalOpen] = useState(false);
  const [modalForm, setModalForm] = useState<{
    roomNumber: string;
    guestName: string;
    type: RoomType;
    checkIn: string;
    checkOut: string;
  }>({ roomNumber: '', guestName: '', type: 'Standard', checkIn: '', checkOut: '' });

  const openReservationFor = (r?: Room) => {
    setModalForm({
      roomNumber: r?.roomNumber ?? '',
      guestName: r?.guestName ?? '',
      type: r?.type ?? 'Standard',
      checkIn: r?.checkIn ?? '',
      checkOut: r?.checkOut ?? '',
    });
    setModalOpen(true);
  };

  const saveReservation = () => {
    const f = modalForm;
    if (!f.roomNumber || !f.guestName || !f.checkIn || !f.checkOut) {
      setToast({ text: 'Completa todos los campos', type: 'error' });
      return;
    }
    setRooms((rs) => {
      const idx = rs.findIndex((r) => r.roomNumber === f.roomNumber);
      if (idx >= 0) {
        const arr = [...rs];
        arr[idx] = { ...arr[idx], guestName: f.guestName, type: f.type, checkIn: f.checkIn, checkOut: f.checkOut, status: 'reserved' };
        return arr;
      }
      const newR: Room = {
        id: `r${f.roomNumber}`,
        roomNumber: f.roomNumber,
        type: f.type,
        guestName: f.guestName,
        checkIn: f.checkIn,
        checkOut: f.checkOut,
        status: 'reserved',
      };
      return [newR, ...rs];
    });
    setModalOpen(false);
    setToast({ text: 'Reserva creada ✨', type: 'success' });
  };

  /* ---- Acciones tabla ---- */
  const doCheckIn = (roomId: string) => {
    setRooms((rs) =>
      rs.map((r) =>
        r.id === roomId
          ? { ...r, status: 'checked-in', checkIn: r.checkIn ?? new Date().toISOString().slice(0, 10), guestName: r.guestName ?? '—' }
          : r
      )
    );
    setToast({ text: 'Check‑in registrado ✔️', type: 'success' });
  };
  const doCheckOut = (roomId: string) => {
    setRooms((rs) =>
      rs.map((r) => (r.id === roomId ? { ...r, status: 'checked-out', checkOut: new Date().toISOString().slice(0, 10) } : r))
    );
    setToast({ text: 'Check‑out registrado ✔️', type: 'success' });
  };
  const toggleMaint = (roomId: string) => {
    setRooms((rs) =>
      rs.map((r) =>
        r.id === roomId
          ? { ...r, status: r.status === 'maintenance' ? 'available' : 'maintenance', guestName: r.status === 'maintenance' ? r.guestName : null }
          : r
      )
    );
    setToast({ text: 'Mantenimiento actualizado', type: 'info' });
  };

  /* ---- Columnas y tabla ---- */
  const columns = useMemo<ColumnDef<Room>[]>(() => [
    { accessorKey: 'roomNumber', header: 'Hab.',      cell: (i) => i.getValue<string>(),                   filterFn: 'includesString' },
    { accessorKey: 'type',       header: 'Tipo',      cell: (i) => i.getValue<RoomType>(),                 filterFn: 'equalsString'   },
    { accessorKey: 'guestName',  header: 'Huésped',   cell: (i) => i.getValue<string>() ?? '-',            filterFn: 'includesString' },
    { accessorKey: 'checkIn',    header: 'Entrada',   cell: (i) => i.getValue<string>() ?? '-',            filterFn: 'includesString' },
    { accessorKey: 'checkOut',   header: 'Salida',    cell: (i) => i.getValue<string>() ?? '-',            filterFn: 'includesString' },
    {
      accessorKey: 'status',
      header: 'Estado',
      filterFn: 'equalsString',
      cell: (i) => {
        const s = i.getValue<RoomStatus>();
        return <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_CLASS[s]}`}>{STATUS_LABEL[s]}</span>;
      },
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => {
        const r = row.original;
        return (
          <div className="flex flex-wrap gap-2">
            {r.status === 'available' && (
              <>
                <button 
                  className="inline-flex items-center rounded-md bg-indigo-600 text-white px-3 py-2 text-sm hover:bg-indigo-700" 
                  onClick={() => openReservationFor(r)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openReservationFor(r);
                    }
                  }}
                  aria-label={`Reservar habitación ${r.roomNumber}`}
                >
                  Reservar
                </button>
                <button 
                  className="inline-flex items-center rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50" 
                  onClick={() => doCheckIn(r.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      doCheckIn(r.id);
                    }
                  }}
                  aria-label={`Hacer check-in en habitación ${r.roomNumber}`}
                >
                  Check‑in
                </button>
              </>
            )}
            {r.status === 'reserved' && (
              <button 
                className="inline-flex items-center rounded-md bg-indigo-600 text-white px-3 py-2 text-sm hover:bg-indigo-700" 
                onClick={() => doCheckIn(r.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    doCheckIn(r.id);
                  }
                }}
                aria-label={`Confirmar check-in para ${r.guestName} en habitación ${r.roomNumber}`}
              >
                Confirmar Check‑in
              </button>
            )}
            {r.status === 'checked-in' && (
              <button 
                className="inline-flex items-center rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50" 
                onClick={() => doCheckOut(r.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    doCheckOut(r.id);
                  }
                }}
                aria-label={`Hacer check-out de ${r.guestName} en habitación ${r.roomNumber}`}
              >
                Check‑out
              </button>
            )}
            <button 
              className="inline-flex items-center rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50" 
              onClick={() => toggleMaint(r.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleMaint(r.id);
                }
              }}
              aria-label={`${r.status === 'maintenance' ? 'Volver a servicio' : 'Poner en mantenimiento'} habitación ${r.roomNumber}`}
            >
              {r.status === 'maintenance' ? 'Volver a servicio' : 'Mantenimiento'}
            </button>
          </div>
        );
      },
    },
  ], []);

  const table = useReactTable({
    data: rooms,
    columns,
    state: { columnFilters },
    filterFns: { equalsString, includesString },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  /* ---- Stats simples ---- */
  const total = rooms.length;
  const available = rooms.filter(r => r.status === 'available').length;
  const occupied = rooms.filter(r => r.status === 'checked-in').length;
  const reserved = rooms.filter(r => r.status === 'reserved').length;
  const maint = rooms.filter(r => r.status === 'maintenance').length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between"><div className="text-slate-500">Total</div><div className="text-xl font-semibold">{total}</div></div>
        <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between"><div className="text-slate-500">Disponibles</div><div className="text-xl font-semibold text-green-600">{available}</div></div>
        <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between"><div className="text-slate-500">Ocupadas</div><div className="text-xl font-semibold text-blue-600">{occupied}</div></div>
        <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between"><div className="text-slate-500">Reservadas</div><div className="text-xl font-semibold text-yellow-600">{reserved}</div></div>
        <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between"><div className="text-slate-500">Mantenimiento</div><div className="text-xl font-semibold text-red-600">{maint}</div></div>
      </div>

      {/* Cards: Filtro + Leyenda */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Filtro */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-3">Filtros</h3>
          <div className="flex items-end gap-3">
            <div className="w-44 shrink-0">
              <label htmlFor="filter-field" className="block text-sm font-medium text-gray-700 mb-1">Filtrar por</label>
              <select
                id="filter-field"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                value={filterField}
                onChange={(e) => onFieldChange(e.target.value as FilterField)}
              >
                <option value="roomNumber">Habitación</option>
                <option value="type">Tipo</option>
                <option value="guestName">Huésped</option>
                <option value="checkIn">Fecha Entrada</option>
                <option value="checkOut">Fecha Salida</option>
                <option value="status">Estado</option>
              </select>
            </div>

            <div className="flex-1">
              <label htmlFor={`filter-value-${filterField}`} className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
              {filterField === 'status' ? (
                <select
                  id={`filter-value-${filterField}`}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  value={filterValue}
                  onChange={(e) => onValueChange(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="available">Disponible</option>
                  <option value="reserved">Reservada</option>
                  <option value="checked-in">Check-in</option>
                  <option value="checked-out">Check-out</option>
                  <option value="maintenance">Mantenimiento</option>
                </select>
              ) : filterField === 'type' ? (
                <select
                  id={`filter-value-${filterField}`}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  value={filterValue}
                  onChange={(e) => onValueChange(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="Deluxe">Deluxe</option>
                  <option value="Standard">Standard</option>
                  <option value="Suite">Suite</option>
                </select>
              ) : (
                <input
                  id={`filter-value-${filterField}`}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Buscar…"
                  value={filterValue}
                  onChange={(e) => onValueChange(e.target.value)}
                />
              )}
            </div>

            <button
              className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 px-3 text-sm text-slate-700 hover:bg-slate-50"
              onClick={onClear}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClear();
                }
              }}
              aria-label="Limpiar filtros"
            >
              Limpiar
            </button>
          </div>

          {/* Acciones rápidas */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button 
              className="inline-flex items-center rounded-md bg-indigo-600 text-white px-3 py-2 text-sm hover:bg-indigo-700"
              onClick={() => { openReservationFor(); }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openReservationFor();
                }
              }}
              aria-label="Crear nueva reserva"
            >
              Nueva reserva
            </button>
            <button 
              className="inline-flex items-center rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
              onClick={() => { setFilterField('status'); applyFilter('status','available'); }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setFilterField('status');
                  applyFilter('status','available');
                }
              }}
              aria-label="Filtrar por habitaciones disponibles"
            >
              Ver disponibles
            </button>
            <button 
              className="inline-flex items-center rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
              onClick={() => { setFilterField('status'); applyFilter('status','checked-in'); }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setFilterField('status');
                  applyFilter('status','checked-in');
                }
              }}
              aria-label="Filtrar por habitaciones ocupadas"
            >
              Ver ocupadas
            </button>
            <button 
              className="inline-flex items-center rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
              onClick={() => { setFilterField('status'); applyFilter('status','maintenance'); }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setFilterField('status');
                  applyFilter('status','maintenance');
                }
              }}
              aria-label="Filtrar por habitaciones en mantenimiento"
            >
              Ver mantenimiento
            </button>
          </div>
        </div>

        {/* Leyenda */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-3">Estados de Habitación</h3>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {(['available','reserved','checked-in','checked-out','maintenance'] as RoomStatus[]).map((s) => (
              <div key={s} className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_CLASS[s]}`}>{STATUS_LABEL[s]}</span>
                <span className="text-sm text-slate-700">
                  {s === 'available' ? 'Habitación lista' :
                   s === 'reserved' ? 'Confirmada' :
                   s === 'checked-in' ? 'Ocupada' :
                   s === 'checked-out' ? 'Liberada' : 'No disponible'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th key={h.id} className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 align-top">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-sm text-slate-500" colSpan={columns.length}>
                  No hay resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Reserva */}
      <dialog 
        open={modalOpen}
        className="fixed inset-0 z-50 bg-transparent p-0 m-0 w-full h-full max-w-none max-h-none"
        aria-labelledby="modal-title"
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.preventDefault();
            setModalOpen(false);
          }
        }}
      >
        <button 
          className="absolute inset-0 bg-black/40 border-0 p-0 cursor-default" 
          onClick={() => setModalOpen(false)}
          aria-label="Cerrar modal"
        />
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow p-4 w-full max-w-lg">
            <h3 id="modal-title" className="text-lg font-semibold mb-4">Nueva reserva</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="modal-room-number" className="block text-sm font-medium text-gray-700 mb-1">Habitación</label>
                <input
                  id="modal-room-number"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="301"
                  value={modalForm.roomNumber}
                  onChange={(e) => setModalForm((f) => ({ ...f, roomNumber: e.target.value }))}
                />
              </div>
              <div>
                <label htmlFor="modal-room-type" className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  id="modal-room-type"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  value={modalForm.type}
                  onChange={(e) => setModalForm((f) => ({ ...f, type: e.target.value as RoomType }))}
                >
                  <option>Deluxe</option>
                  <option>Standard</option>
                  <option>Suite</option>
                </select>
              </div>
              <div className="col-span-2">
                <label htmlFor="modal-guest-name" className="block text-sm font-medium text-gray-700 mb-1">Huésped</label>
                <input
                  id="modal-guest-name"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Nombre del huésped"
                  value={modalForm.guestName}
                  onChange={(e) => setModalForm((f) => ({ ...f, guestName: e.target.value }))}
                />
              </div>
              <div>
                <label htmlFor="modal-check-in" className="block text-sm font-medium text-gray-700 mb-1">Check‑in</label>
                <input
                  id="modal-check-in"
                  type="date"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  value={modalForm.checkIn}
                  onChange={(e) => setModalForm((f) => ({ ...f, checkIn: e.target.value }))}
                />
              </div>
              <div>
                <label htmlFor="modal-check-out" className="block text-sm font-medium text-gray-700 mb-1">Check‑out</label>
                <input
                  id="modal-check-out"
                  type="date"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  value={modalForm.checkOut}
                  onChange={(e) => setModalForm((f) => ({ ...f, checkOut: e.target.value }))}
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button 
                className="inline-flex items-center rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
                onClick={() => setModalOpen(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setModalOpen(false);
                  }
                }}
                aria-label="Cancelar y cerrar modal"
              >
                Cancelar
              </button>
              <button 
                className="inline-flex items-center rounded-md bg-indigo-600 text-white px-3 py-2 text-sm hover:bg-indigo-700"
                onClick={saveReservation}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    saveReservation();
                  }
                }}
                aria-label="Guardar reserva"
              >
                Guardar reserva
              </button>
            </div>
          </div>
        </div>
      </dialog>

      {/* Toast */}
      {toast && (
        <div className="fixed inset-0 pointer-events-none flex items-start justify-center mt-6">
          <div
            className={`pointer-events-auto rounded-md px-4 py-2 shadow text-white ${
              toast.type === 'error' ? 'bg-rose-600' : toast.type === 'info' ? 'bg-slate-800' : 'bg-emerald-600'
            }`}
          >
            {toast.text}
          </div>
        </div>
      )}
    </div>
  );
}
