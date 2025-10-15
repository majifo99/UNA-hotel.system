import { useEffect, useState } from "react";
import { getUsers } from "../services/usersMantenimiento";
import type { UserItem } from "../types/userMantenimientoType";

export function useUsersMantenimiento() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getUsers();
        if (!cancelled) setUsers(data);
      } catch (err) {
        if (!cancelled) setError(err);
        console.error("Error al cargar usuarios", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { users, loading, error };
}
