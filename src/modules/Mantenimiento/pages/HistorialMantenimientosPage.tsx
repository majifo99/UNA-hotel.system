// src/modules/Mantenimiento/pages/HistorialMantenimientosPage.tsx
"use client";

import { useHistorialMantenimientos } from "../hooks/useHistorialMantenimientos";
import { ValueBlock } from "../../housekeeping/components/Historial/HistorialComponents";
import { formatDatetime } from "../../housekeeping/utils/formatters";
import { HistorialPageBase } from "../../housekeeping/components/Historial/HistorialPageBase";

function extractMaintenanceCode(record: any): string {
  return (record.id_mantenimiento ?? record.mantenimiento?.id_mantenimiento ?? "—").toString();
}

export default function HistorialMantenimientosPage() {
  const historialData = useHistorialMantenimientos(
    { page: 1, per_page: 20, q: "" },
    { keepPreviousData: true }
  );

  const pageConfig = {
    pageTitle: "Historiales de mantenimiento",
    pageSubtitle: "Hoja consolidada • lista para imprimir",
    printTitle: "Historiales de mantenimiento",
    printSubtitle: "Listado consolidado",
    tableHeaders: ["Mantenimiento", "Fecha", "Evento", "Actor", "Valor anterior", "Valor nuevo"],
  };

  const renderRow = (record: any, index: number) => (
    <tr
      key={record.id_historial_mant ?? `${extractMaintenanceCode(record)}-${index}`}
      className="align-top odd:bg-slate-50/50 hover:bg-slate-100/60 transition-colors break-inside-avoid"
    >
      <td className="px-4 py-2">
        <span className="inline-flex min-w-[40px] justify-center rounded-md bg-slate-100 px-2 py-1 text-sm font-semibold ring-1 ring-slate-200">
          {extractMaintenanceCode(record)}
        </span>
      </td>
      <td className="px-4 py-2 whitespace-nowrap text-slate-700">
        {formatDatetime(record.fecha)}
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
