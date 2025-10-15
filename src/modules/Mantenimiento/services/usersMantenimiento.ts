import axios from "axios";
import type { UserItem } from "../types/userMantenimientoType";

// Normaliza la base URL (sin "/" final)
const RAW_URL = import.meta.env.VITE_API_URL as string | undefined;
const API_URL =
  RAW_URL?.replace(/\/+$/, "") ||
  (import.meta.env.DEV ? "http://127.0.0.1:8000/api" : "");

// En producción exige variable
if (!API_URL && import.meta.env.PROD) {
  throw new Error("VITE_API_URL no está definida en Vercel (Preview/Prod).");
}

const http = axios.create({ baseURL: API_URL });

export async function getUsers(): Promise<UserItem[]> {
  const res = await http.get("/usuarios");
  return (
    res.data?.data?.map((u: any) => ({
      id: u.id_usuario,
      nombreCompleto: `${u.nombre ?? ""} ${u.apellido1 ?? ""} ${u.apellido2 ?? ""}`.trim(),
    })) ?? []
  );
}
