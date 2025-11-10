import axios from "axios";
import type { UserItem } from "../types/user";

const API_URL = (() => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (import.meta.env.DEV) {
    // In development, fallback to '/api' for Vite proxy
    return '/api';
  }
  // In production, fail fast if VITE_API_URL is not set
  throw new Error('VITE_API_URL environment variable must be set in production.');
})();

export async function getUsers(): Promise<UserItem[]> {
  const res = await axios.get(`${API_URL}/usuarios`);
  return (
    res.data.data?.map((u: any) => ({
      id: u.id_usuario,
      nombreCompleto: `${u.nombre} ${u.apellido1 ?? ""} ${u.apellido2 ?? ""}`.trim(),
    })) ?? []
  );
}
