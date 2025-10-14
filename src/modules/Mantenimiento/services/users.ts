import axios from "axios";

export type UserItem = { id: number; nombreCompleto: string };

const API_URL =
  (import.meta.env.VITE_API_URL?.replace(/\/+$/, "")) ||
  "http://localhost:8000/api";

export async function getUsers(): Promise<UserItem[]> {
  const { data } = await axios.get(`${API_URL}/usuarios`, {
    withCredentials: false,
  });

  // Soporta { data: [...] } o directamente [...]
  let list: any[] = [];
  if (Array.isArray(data?.data)) {
    list = data.data;
  } else if (Array.isArray(data)) {
    list = data;
  }

  return list.map((u: any) => {
    const id = u.id_usuario ?? u.id ?? 0;
    const nombreCompleto = [u.nombre, u.apellido1, u.apellido2]
      .filter(Boolean)
      .join(" ")
      .trim();

    return { id, nombreCompleto };
  });
}

export default getUsers;
