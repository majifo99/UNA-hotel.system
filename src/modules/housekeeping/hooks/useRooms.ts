// src/hooks/useRooms.ts
import { useCallback, useEffect, useState } from "react";
import type { Room, RoomFilters } from "../types/typesRoom";
import { fetchRooms as getRooms } from "../services/roomService";

export function useRooms(filters: RoomFilters) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getRooms(); // 👉 llamada al service
      setRooms(data);
    } catch (err) {
      setError("Error al cargar habitaciones");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const filteredRooms = rooms.filter((room) => {
    const search = filters.search?.trim().toLowerCase() || "";
    const numberMatch = room.number?.toString().toLowerCase().includes(search);

    const statusMatch =
      !filters.status || room.status?.toLowerCase() === filters.status.toLowerCase();

    const typeMatch =
      !filters.type || room.type?.toLowerCase() === filters.type.toLowerCase();

    const floorMatch =
      !filters.floor || room.floor?.toString() === filters.floor;

    return numberMatch && statusMatch && typeMatch && floorMatch;
  });

  return { rooms, filteredRooms, isLoading, error, refetch: fetchRooms }; // 👉 ahora puedes refrescar
}
