"use client";

type Props = Readonly<{
  areaId?: string;
  pageSize?: "A4" | "Letter" | "Legal";
  margin?: string;
  tableFontSize?: number;
  brandColor?: string;
}>;

export default function PrintStyles({
  areaId = "print-area",
  pageSize = "A4",
  margin = "8mm",
  tableFontSize = 11,
  brandColor = "#1F392A",
}: Props) {
  const css = `
  @media print {
    @page {
      size: ${pageSize} portrait;
      margin: ${margin} !important;
    }

    html, body {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      background: #fff !important;
      color: #0f172a !important;
      margin: 0 !important;
      padding: 0 !important;
      zoom: 0.94 !important; /* Corrige corte y centrado */
    }

    /* Eliminar sidebar y elementos no imprimibles */
    aside, nav, header.sticky, .no-print, [data-print-hide] {
      display: none !important;
    }

    /* Asegurar 100% de ancho sin desplazamientos */
    #${areaId}, html, body, main, section, article, #root, #__next {
      width: 100% !important;
      max-width: 100% !important;
      margin: 0 auto !important;
      padding: 0 !important;
      background: #fff !important;
      box-shadow: none !important;
    }
    [class*="max-w-"] { max-width: 100% !important; }

    /* Header visible solo en impresión */
    .print-only { display: block !important; }
    .print-header {
      display: flex !important;
      align-items: center !important;
      gap: 12px !important;
      margin: 0 0 10px 0 !important;
      padding: 8px 12px !important;
      background: ${brandColor} !important;
      color: #fff !important;
    }
    .print-logo {
      width: 90px !important;
      height: auto !important;
      object-fit: contain !important;
      background: #fff !important;
      border-radius: 6px !important;
      padding: 6px !important;
    }
    .print-title { font-size: 18px !important; font-weight: 800 !important; color: #fff !important; }
    .print-sub { font-size: 12px !important; color: #f1f5f9 !important; }

    /* --- TABLA --- */
    .hist-table {
      width: 100% !important;
      max-width: 100% !important;
      border-collapse: collapse !important;
      table-layout: auto !important;
      font-size: ${tableFontSize}px !important;
      margin: 0 auto !important;
    }

    .hist-table thead { display: table-header-group !important; }
    .hist-table th, .hist-table td {
      border-bottom: 1px solid #e5e7eb !important;
      padding: 6px 8px !important;
      vertical-align: top !important;
      text-align: left !important;
      line-height: 1.35 !important;
      white-space: normal !important;
      word-break: normal !important;
      overflow-wrap: break-word !important;
    }

    .hist-table th {
      background: ${brandColor} !important;
      color: #fff !important;
      font-weight: 700 !important;
      white-space: nowrap !important;
    }

    /* Ancho cómodo de las columnas de valores */
    .hist-table th:nth-child(5),
    .hist-table td:nth-child(5),
    .hist-table th:nth-child(6),
    .hist-table td:nth-child(6) {
      width: 46% !important;
    }

    tr { page-break-inside: avoid; break-inside: avoid; }
    .kv-label { width: 5rem !important; }

    /* Sin márgenes extra */
    .rounded-2xl, .shadow, .ring-1 { box-shadow: none !important; border: none !important; }
  }

  /* En pantalla: ocultar el encabezado de impresión */
  .print-only { display: none; }
  `;
  return <style>{css}</style>;
}
