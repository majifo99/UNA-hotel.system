import type { UserItem } from "../types/user";

import apiClient from "../lib/apiClient";

import { getApiBaseUrl } from "../../../config/api";

const API_URL = getApiBaseUrl();
>
export async function getUsers(): Promise<UserItem[]> {
  const response = await apiClient.get<{ data: any[] }>('/usuarios');
  return (
    response.data.data?.map((u: any) => ({
      id: u.id_usuario,
      nombreCompleto: `${u.nombre} ${u.apellido1 ?? ""} ${u.apellido2 ?? ""}`.trim(),
    })) ?? []
  );
}
