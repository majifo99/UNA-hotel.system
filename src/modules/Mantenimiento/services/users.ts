import axios from "axios";
import type { UserItem } from "../types/user";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export async function getUsers(): Promise<UserItem[]> {
  const res = await axios.get(`${API_URL}/usuarios`);
  return (
    res.data.data?.map((u: any) => ({
      id: u.id_usuario,
      nombreCompleto: `${u.nombre} ${u.apellido1 ?? ""} ${u.apellido2 ?? ""}`.trim(),
    })) ?? []
  );
}
