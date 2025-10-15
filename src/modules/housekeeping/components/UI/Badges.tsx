
import Pill from "./Pill";
import type { Prioridad } from "../../types/limpieza";

// Estado (usa el verde institucional para “Limpia”)
export function EstadoBadge({ clean }: Readonly<{ clean: boolean }>) {
  return <Pill tone={clean ? "success" : "danger"}>{clean ? "Limpia" : "Sucia"}</Pill>;
}

// Prioridad alineada al verde del header pero escalonada
// baja → neutral, media → success (verde), alta → warning (ámbar), urgente → danger (rojo)
export function PrioridadBadge({ prioridad }: Readonly<{ prioridad?: Prioridad | null }>) {
  if (!prioridad) return <Pill>—</Pill>;
  const tone: Record<Prioridad, "neutral" | "success" | "warning" | "danger"> = {
    baja: "neutral",
    media: "success",
    alta: "warning",
    urgente: "danger",
  };
  return <Pill tone={tone[prioridad]}><span className="capitalize">{prioridad}</span></Pill>;
}
