import { useEffect, useMemo, useState } from "react";
import { fetchStaff } from "../services/staffService";
import type { Staff } from "../types/typesRoom";

export function useStaff(options?: { onlyAvailable?: boolean }) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetchStaff()
      .then((data) => {
        if (!cancelled) setStaff(data);
      })
      .catch(() => !cancelled && setError("Error al cargar staff"))
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const list = useMemo(() => {
    if (options?.onlyAvailable) return staff.filter((p) => p.availability);
    return staff;
  }, [staff, options?.onlyAvailable]);

  return { staff: list, rawStaff: staff, isLoading, error };
}
