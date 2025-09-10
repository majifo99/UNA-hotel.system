

import { MAINTENANCE_ITEMS } from "../data/maintenance.mock";
import type { MaintenanceItem } from "../types/mantenimiento";

export async function fetchMaintenance(): Promise<MaintenanceItem[]> {
  // aquí puedes cambiar por tu API real (fetch/axios)
  return Promise.resolve(MAINTENANCE_ITEMS);
}
