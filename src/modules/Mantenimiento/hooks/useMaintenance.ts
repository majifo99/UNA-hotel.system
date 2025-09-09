import { useEffect, useMemo, useState } from "react";
import { fetchMaintenance } from "../services/maintenanceService";
import type { MaintenanceItem, MaintenanceStatus } from "../types/mantenimiento";

export function useMaintenance() {
  const [items, setItems] = useState<MaintenanceItem[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<MaintenanceStatus | "Todos">("Todos");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaintenance().then((data) => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((i) => {
      const matchesQ =
        !q ||
        i.code.toLowerCase().includes(q) ||
        String(i.roomNumber).includes(q) ||
        i.kind.toLowerCase().includes(q) ||
        i.area.toLowerCase().includes(q) ||
        i.assignee?.name.toLowerCase().includes(q);

      const matchesStatus = status === "Todos" ? true : i.status === status;
      return matchesQ && matchesStatus;
    });
  }, [items, query, status]);

  const metrics = useMemo(() => {
    const pending = items.filter((i) => i.status === "Pendiente").length;
    const inProgress = items.filter((i) => i.status === "En Proceso").length;
    const done = items.filter((i) => i.status === "Completado").length;
    return { pending, inProgress, done, total: items.length };
  }, [items]);

  return { items, filtered, loading, query, setQuery, status, setStatus, metrics };
}
