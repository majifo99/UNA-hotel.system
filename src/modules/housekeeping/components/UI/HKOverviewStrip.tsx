// src/modules/housekeeping/components/UI/HKOverviewStrip.tsx
import React, { useMemo } from "react";
import type { LimpiezasTableController } from "../../hooks/useLimpiezasTable";
import HKCounterCards from "./HKMetricCard"; // default export: acepta { sucias, limpias, total }

type Props = {
  controller: LimpiezasTableController;
  className?: string;
};

const HKOverviewStrip: React.FC<Props> = ({ controller, className }) => {
  const { rawItems, pagination } = controller;

  const { sucias, limpias, total } = useMemo(() => {
    const su = rawItems.filter((x) => !x.fecha_final).length;
    const li = rawItems.filter((x) => !!x.fecha_final).length;

    // ✅ sin assertion: convierte a número seguro
    const pagTotal = Number(pagination?.total ?? 0);
    const tt = pagTotal > 0 ? pagTotal : rawItems.length;

    return { sucias: su, limpias: li, total: tt };
  }, [rawItems, pagination?.total]);

  return (
    <section className={className ?? ""} aria-label="Resumen de habitaciones">
      <HKCounterCards sucias={sucias} limpias={limpias} total={total} />
    </section>
  );
};

export default HKOverviewStrip;
