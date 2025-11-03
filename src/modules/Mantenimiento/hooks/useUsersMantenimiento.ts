import { useEffect, useState } from "react";
import { getUsers } from "../services/usersMantenimiento";
import type { UserItem } from "../types/userMantenimientoType";

export function useUsers() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch((err) => console.error("Error al cargar usuarios", err))
      .finally(() => setLoading(false));
  }, []);

  return { users, loading };
}
