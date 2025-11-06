// src/modules/housekeeping/pages/HistorialLimpiezasPage.tsx
"use client";

import { useHistorialLimpiezas } from "../hooks/useHistorialLimpiezas";
import { ValueBlock } from "../components/Historial/HistorialComponents";
import { formatDatetime, asPrimitiveString } from "../utils/formatters";
import { HistorialPageBase } from "../components/Historial/HistorialPageBase";

function extractRoomNumber(record: any): string {
  return (
    record.numero_habitacion ??
    record.habitacion_num ??
    record.habitacion?.numero ??
    record.room_number ??
    record.num_habitacion ??
    record.id_habitacion ??
    "—"
  ).toString();
}

export default function HistorialLimpiezasPage() {
  const historialData = useHistorialLimpiezas(
    { page: 1, per_page: 20, q: "" },
    { keepPreviousData: true }
  );

  const pageConfig = {
    pageTitle: "Historiales de limpieza",
    pageSubtitle: "Hoja consolidada • lista para imprimir",
    printTitle: "Historiales de limpieza",
    printSubtitle: "Listado consolidado",
    tableHeaders: ["Habitación", "Fecha", "Evento", "Actor", "Valor anterior", "Valor nuevo"],
  };

  const renderRow = (record: any, index: number) => (
      <tr
        key={record.id_historial_limp ?? `${extractRoomNumber(record)}-${index}`}
        className="align-top odd:bg-slate-50/50 hover:bg-slate-100/60 transition-colors break-inside-avoid"
      >
        <td className="px-4 py-2">
          <span className="inline-flex min-w-[40px] justify-center rounded-md bg-slate-100 px-2 py-1 text-sm font-semibold ring-1 ring-slate-200">
            {extractRoomNumber(record)}
          </span>
        </td>
        <td className="px-4 py-2 whitespace-nowrap text-slate-700">
          {formatDatetime(asPrimitiveString(record.fecha))}
        </td>
        <td className="px-4 py-2 font-medium text-slate-800">{record.evento ?? "—"}</td>
        <td className="px-4 py-2 text-slate-700">
          {record.actor?.nombre ?? record.actor?.email ?? "—"}
        </td>
        <td className="px-4 py-2">
          <ValueBlock json={record.valor_anterior} />
        </td>
        <td className="px-4 py-2">
          <ValueBlock json={record.valor_nuevo} />
        </td>
      </tr>
  );

  return <HistorialPageBase config={pageConfig} hookData={historialData} renderTableRow={renderRow} />;
}
