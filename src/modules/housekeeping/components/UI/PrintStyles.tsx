// src/ui/PrintStyles.tsx
"use client";

type Props = Readonly<{
  areaId?: string;
  pageSize?: "A4" | "Letter" | "Legal";
  margin?: string;
  tableFontSize?: number;
}>;

export default function PrintStyles({
  areaId = "print-area",
  pageSize = "A4",
  margin = "12mm",
  tableFontSize = 11,
}: Props) {
  const css = `
  @media print {
    @page { size: ${pageSize} portrait; margin: ${margin}; }

    /* Oculta todo y deja sólo el área a imprimir */
    body * { visibility: hidden !important; }
    #${areaId}, #${areaId} * { visibility: visible !important; }

    html, body {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      background: #fff !important;
      color: #0f172a !important;
    }

    #${areaId} {
      position: static !important;
      inset: auto !important;
      margin: 0 !important;
      padding: 0 !important;
      box-shadow: none !important;
      background: #fff !important;
      width: 100% !important;
      max-width: none !important;
    }

    /* Oculta todo lo que no sea tabla o header de impresión */
    .no-print, [data-print-hide] { display: none !important; }
    .print-only { display: block !important; }

    /* --- Encabezado bonito --- */
    .print-header {
      display: flex !important;
      align-items: center !important;
      gap: 12px !important;
      margin: 0 0 10px 0 !important;
      padding: 0 0 8px 0 !important;
      border-bottom: 1px solid #e5e7eb !important;
    }
    .print-logo { width: 90px !important; height: auto !important; object-fit: contain !important; }
    .print-title { font-size: 18px !important; font-weight: 800 !important; line-height: 1.2 !important; margin: 0 !important; }
    .print-sub { font-size: 12px !important; color: #475569 !important; margin-top: 2px !important; }

    /* Permitir overflow normal (evitar recortes) */
    .overflow-x-auto, .overflow-x-scroll, .print-allow-overflow { overflow: visible !important; }

    /* --- Tabla --- */
    .hist-table {
      width: 100% !important;
      border-collapse: collapse !important;
      table-layout: fixed !important; /* usamos colgroup para anchos */
      font-size: ${tableFontSize}px !important;
    }
    .hist-table thead { display: table-header-group !important; }
    .hist-table th, .hist-table td {
      border-bottom: 1px solid #e5e7eb !important;
      padding: 6px 8px !important;
      vertical-align: top !important;
      text-align: left !important;
      line-height: 1.35 !important;
    }

    /* Cabeceras SIN romper palabra por letra */
    .hist-table th {
      white-space: nowrap !important;
      word-break: normal !important;
      overflow-wrap: normal !important;
      color: #334155 !important;
      font-weight: 700 !important;
      background: #fff !important;
    }

    /* Celdas de texto: que rompan por palabra/frase, no por letra */
    .hist-table td {
      white-space: normal !important;
      word-break: break-word !important;
      overflow-wrap: anywhere !important;
    }

    /* Evitar cortes de fila entre páginas */
    tr { page-break-inside: avoid; break-inside: avoid; }

    /* Simplificar badges/pastillas a texto simple */
    .badge, .pill {
      background: none !important; border: 0 !important; color: inherit !important; padding: 0 !important;
    }

    /* Quitar anchos utilitarios que ensanchan de más */
    #${areaId} .w-\\[360px\\] { width: auto !important; max-width: none !important; }
  }

  /* En pantalla: oculto el header de impresión */
  .print-only { display: none; }
  `;
  return <style>{css}</style>;
}
