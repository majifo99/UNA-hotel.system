import axios from "axios";
import type { Room } from "../types/typesRoom";

// ✅ URL de tu MockAPI real
const ROOMS_ENDPOINT = "https://68af252bb91dfcdd62bb84e5.mockapi.io/rooms";

export async function fetchRooms(): Promise<Room[]> {
  const { data } = await axios.get<Room[]>(ROOMS_ENDPOINT);
  return data;
}

export async function fetchRoomById(id: string): Promise<Room> {
  const { data } = await axios.get<Room>(`${ROOMS_ENDPOINT}/${id}`);
  return data;
}

export async function createRoom(room: Omit<Room, "id">): Promise<Room> {
  const { data } = await axios.post<Room>(ROOMS_ENDPOINT, room);
  return data;
}

export async function updateRoom(id: string, payload: Partial<Room>): Promise<Room> {
  const { data } = await axios.put<Room>(`${ROOMS_ENDPOINT}/${id}`, payload);
  return data;
}

export async function deleteRoom(id: string): Promise<void> {
  await axios.delete(`${ROOMS_ENDPOINT}/${id}`);
}
