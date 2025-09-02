import { useEffect, useState, type JSX } from "react";
import { ArrowUpDown, MoreHorizontal, UserCheck, KeyRound } from "lucide-react";
import type { Room } from "../types/typesRoom";

type RoomsTableProps = Readonly<{
  sortedAndFilteredRooms: Room[];
  selectedRooms?: string[];
  toggleRoomSelection?: (id: string) => void;
  toggleAllRooms?: () => void;
  handleSort?: (field: keyof Room) => void;
  getStatusBadge?: (status: string) => JSX.Element;
  onRowEdit?: (room: Room, action: "status" | "reassign") => void;
}>;

// ✅ Mapa para los títulos de columnas (evita ternario anidado)
const COLUMN_LABEL: Record<"number" | "type" | "floor", string> = {
  number: "Número",
  type: "Tipo",
  floor: "Piso",
};

export default function RoomsTable({
  sortedAndFilteredRooms,
  selectedRooms,
  toggleRoomSelection,
  toggleAllRooms,
  handleSort,
  getStatusBadge,
  onRowEdit,
}: RoomsTableProps) {
  const [internalSelected, setInternalSelected] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const selected = selectedRooms ?? internalSelected;

  const handleToggleOne =
    toggleRoomSelection ??
    ((id: string) =>
      setInternalSelected((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      ));

  const onSortLocal =
    handleSort ??
    (() => {
      /* noop */
    });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRooms = sortedAndFilteredRooms.slice(startIndex, endIndex);
  const totalPages = Math.ceil(sortedAndFilteredRooms.length / itemsPerPage);

  const handleToggleAllLocal =
    toggleAllRooms ??
    (() => {
      const pageIds = paginatedRooms.map((r) => r.id);
      const allSelected = pageIds.every((id) => selected.includes(id));
      return setInternalSelected((prev) =>
        allSelected
          ? prev.filter((id) => !pageIds.includes(id))
          : Array.from(new Set([...prev, ...pageIds]))
      );
    });

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const totalPagesCalc = Math.ceil(sortedAndFilteredRooms.length / itemsPerPage);
    if (currentPage > totalPagesCalc) setCurrentPage(1);
  }, [sortedAndFilteredRooms]);

  if (sortedAndFilteredRooms.length === 0) {
    return (
      <div className="text-center text-slate-500 py-10 text-sm">
        No hay habitaciones para mostrar.
      </div>
    );
  }

  const closeDetails = (el: HTMLElement) => {
    const detailsEl = el.closest("details");
    if (detailsEl instanceof HTMLDetailsElement) detailsEl.open = false;
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50/80 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3">
                <input
                  type="checkbox"
                  checked={
                    paginatedRooms.length > 0 &&
                    paginatedRooms.every((r) => selected.includes(r.id))
                  }
                  onChange={handleToggleAllLocal}
                  className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
              </th>

              {(["number", "type", "floor"] as (keyof Room)[]).map((field) => (
                <th
                  key={field}
                  className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                >
                  <button
                    type="button"
                    onClick={() => onSortLocal(field)}
                    className="flex items-center gap-1 hover:text-slate-900 transition-colors"
                  >
                    {/* ✅ sin ternarios anidados */}
                    {COLUMN_LABEL[field as "number" | "type" | "floor"]}
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
              ))}

              <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Clave</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Responsable</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Última limpieza</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-slate-100">
            {paginatedRooms.map((room) => {
              const isSelected = selected.includes(room.id);
              return (
                <tr
                  key={room.id}
                  className={`hover:bg-slate-50/50 transition-colors ${isSelected ? "bg-teal-50/30" : ""}`}
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleOne(room.id)}
                      className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-900 font-medium">{room.number}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{room.type}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{room.floor}</td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {room.keyCode ? (
                      <div className="flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-teal-600" />
                        {room.keyCode}
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    {getStatusBadge ? (
                      getStatusBadge(room.status)
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-50 border border-slate-200 text-slate-700">
                        {room.status}
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {room.assignedTo ? (
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-teal-600" />
                        {room.assignedTo}
                      </div>
                    ) : (
                      <span className="text-slate-400">Sin asignar</span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {room.lastCleaned || <span className="text-slate-400">—</span>}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <details className="relative">
                      <summary className="list-none cursor-pointer inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 px-2 py-1 rounded-lg hover:bg-slate-100">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="text-xs">Opciones</span>
                      </summary>

                      {/* ✅ rol interactivo en contenedor, no en <ul> */}
                      <div
                        className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-10"
                        role="menu"
                        aria-label="Opciones de habitación"
                      >
                        <ul className="text-sm text-slate-700">
                          <li className="px-3 py-2">
                            <button
                              type="button"
                              role="menuitem"
                              className="w-full text-left hover:bg-slate-50 rounded-md px-1 py-1"
                              onClick={(e) => {
                                onRowEdit?.(room, "status");
                                closeDetails(e.currentTarget as HTMLElement);
                              }}
                            >
                              Cambiar estado
                            </button>
                          </li>

                          <li className="px-3 py-2">
                            <button
                              type="button"
                              role="menuitem"
                              className="w-full text-left hover:bg-slate-50 rounded-md px-1 py-1"
                              onClick={(e) => {
                                onRowEdit?.(room, "reassign");
                                closeDetails(e.currentTarget as HTMLElement);
                              }}
                            >
                              Reasignar personal
                            </button>
                          </li>

                          <li className="px-3 py-2 text-slate-400">Ver historial</li>
                        </ul>
                      </div>
                    </details>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN EXTERNA */}
      <div className="flex justify-center items-center gap-1 py-5 bg-white border-t border-slate-100">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-teal-600 disabled:opacity-30"
          aria-label="Página anterior"
        >
          ←
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`w-8 h-8 rounded-md text-sm transition-colors ${
              currentPage === page
                ? "text-teal-700 font-semibold bg-slate-100"
                : "text-slate-500 hover:text-teal-600"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-teal-600 disabled:opacity-30"
          aria-label="Página siguiente"
        >
          →
        </button>
      </div>
    </div>
  );
}
