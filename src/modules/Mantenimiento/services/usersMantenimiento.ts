import axios from "axios";
import type { UserItem } from "../types/userMantenimientoType";
import { getApiBaseUrl } from "../../../config/api";

const API_URL = getApiBaseUrl();

export async function getUsers(): Promise<UserItem[]> {
  const res = await axios.get(`${API_URL}/usuarios`);
  return (
    res.data.data?.map((u: any) => ({
      id: u.id_usuario,
      nombreCompleto: `${u.nombre} ${u.apellido1 ?? ""} ${u.apellido2 ?? ""}`.trim(),
    })) ?? []
  );
}
