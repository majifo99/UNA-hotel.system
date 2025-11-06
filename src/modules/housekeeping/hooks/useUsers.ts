import { useQuery } from "@tanstack/react-query";
import { getUsers } from "../services/users";

// Query keys para users
export const usersKeys = {
  all: ['users'] as const,
  list: () => [...usersKeys.all, 'list'] as const,
};

export function useUsers() {
  const { data: users = [], isLoading: loading } = useQuery({
    queryKey: usersKeys.list(),
    queryFn: getUsers,
    staleTime: 1000 * 60 * 5, // 5 minutos - los usuarios no cambian frecuentemente
    gcTime: 1000 * 60 * 10, // 10 minutos en cache
    refetchOnMount: false, // No refetch si ya está en cache
    refetchOnWindowFocus: false,
  });

  return { users, loading };
}
