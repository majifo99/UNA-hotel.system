// src/data/notifications.mock.ts
import type { NotificationItem } from "../components/NotificationBell";

export const NOTIFICATIONS_MOCK: NotificationItem[] = [
  {
    id: 1,
    title: "Reporte de daño - Hab. 205",
    description:
      "Fuga de agua en el baño principal, goteo constante en el lavabo…",
    room: "Hab. 205",
    reporter: "Ana López",
    priority: "Urgente",
    createdAt: new Date(Date.now() - 243 * 24 * 3600 * 1000),
    read: false,
  },
  {
    id: 2,
    title: "Reporte de daño - Hab. 307",
    description:
      "Aire acondicionado hace ruido extraño y no enfría correctamente.",
    room: "Hab. 307",
    reporter: "María García",
    priority: "Alta",
    createdAt: new Date(Date.now() - 243 * 24 * 3600 * 1000),
    read: false,
  },
  {
    id: 3,
    title: "Reporte de daño - Hab. 102",
    description: "Puerta del clóset no cierra bien; bisagra suelta.",
    room: "Hab. 102",
    reporter: "Carlos Gómez",
    priority: "Media",
    createdAt: new Date(Date.now() - 244 * 24 * 3600 * 1000),
    read: true,
  },
];
