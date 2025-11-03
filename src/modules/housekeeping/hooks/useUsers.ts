import { useEffect, useState } from "react";
import { getUsers } from "../services/users";
import type { UserItem } from "../types/user";

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
