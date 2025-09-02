import { useEffect, useState } from "react";
import { fetchRoomById } from "../services/roomService";
import type { Room } from "../types/typesRoom";

export function useRoomById(roomId: string | null, enabled = true) {
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    if (!roomId || !enabled) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchRoomById(roomId);
      setRoom(data);
    } catch {
      setError("No se pudo cargar la habitación");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, [roomId, enabled]);

  return { room, setRoom, isLoading, error, refetch };
}
