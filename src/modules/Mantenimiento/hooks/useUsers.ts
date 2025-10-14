import axios from "axios";

export type UserItem = { id: number; nombreCompleto: string };

// Requiere VITE_API_URL (sin fallback a localhost)
const RAW_URL = import.meta.env.VITE_API_URL;
if (!RAW_URL) {
  throw new Error("VITE_API_URL no está definida. Configúrala en tu .env");
}
const API_URL = RAW_URL.replace(/\/+$/, "");

// Token opcional si tu API lo requiere
function getAuthToken(): string | null {
  try {
    return localStorage.getItem("authToken"); // o "access_token"
  } catch {
    return null;
  }
}

// --- Helpers ---------------------------------------------------------------

function toUserItem(u: any): UserItem {
  const id = u?.id_usuario ?? u?.id ?? 0;

  let nombreCompleto = "";
  const partes = [u?.nombre, u?.apellido1, u?.apellido2].filter(Boolean);
  if (partes.length > 0) {
    nombreCompleto = partes.join(" ").trim();
  } else if (typeof u?.nombreCompleto === "string" && u.nombreCompleto.trim()) {
    nombreCompleto = u.nombreCompleto.trim();
  } else if (typeof u?.full_name === "string" && u.full_name.trim()) {
    nombreCompleto = u.full_name.trim();
  } else {
    nombreCompleto = "Usuario";
  }

  return { id, nombreCompleto };
}

function mapUsers(list: unknown): UserItem[] {
  if (!Array.isArray(list)) return [];
  return list.map((u) => toUserItem(u));
}

// --- API -------------------------------------------------------------------

export async function getUsers(): Promise<UserItem[]> {
  const token = getAuthToken();
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const { data } = await axios.get(`${API_URL}/usuarios`, {
    withCredentials: false,
    headers,
  });

  // Soporta { data: [...] } o directamente [...]
  let list: unknown = [];
  if (
    data !== null &&
    typeof data === "object" &&
    "data" in (data as Record<string, unknown>) &&
    Array.isArray((data as { data: unknown }).data)
  ) {
    list = (data as { data: unknown[] }).data;
  } else if (Array.isArray(data)) {
    list = data;
  } else {
    list = [];
  }

  return mapUsers(list);
}

export default getUsers;
