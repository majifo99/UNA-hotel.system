"use client";
import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { MantenimientoModalBase } from "./MantenimientoModalBase";
import { MantenimientoFormContent } from "../MantenimientoFormContent";
import type { MantenimientoItem, Prioridad } from "../../types/mantenimiento";
import { getUsers } from "../../services/usersMantenimiento";
import mantenimientoService from "../../services/maintenanceService";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  item: MantenimientoItem | null;
  onSaved?: (updated?: MantenimientoItem) => void;
};

export default function ReassignMaintenanceModal({ isOpen, onClose, item, onSaved }: Readonly<Props>) {
  const [users, setUsers] = useState<Array<{ id: number; nombreCompleto: string }>>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | "">("");
  const [prioridadLocal, setPrioridadLocal] = useState<Prioridad | "">("");
  const [notasLocal, setNotasLocal] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        setLoadingUsers(true);
        const data = await getUsers();
        setUsers(Array.isArray(data) ? data : []);
      } finally {
        setLoadingUsers(false);
      }
    })();
  }, [isOpen]);

  // Precarga datos
  useEffect(() => {
    if (item) {
      setSelectedUserId(item.usuario_asignado?.id ?? "");
      setPrioridadLocal((item.prioridad as Prioridad) ?? "");
      setNotasLocal(item.notas ?? "");
    }
  }, [item]);

  async function handleSave() {
    if (!item?.id) return;
    setSaving(true);
    try {
      const body: any = {};
      if (item.fecha_final) body.fecha_final = null;
      if (selectedUserId) body.id_usuario_asigna = Number(selectedUserId);
      if (prioridadLocal) body.prioridad = prioridadLocal;
      if (notasLocal.trim()) body.notas = notasLocal.trim();
      const { data } = await mantenimientoService.updateMantenimiento(item.id, body);
      onSaved?.(data);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  const habNumero = item?.habitacion?.numero ?? "—";
  const habPiso = item?.habitacion?.piso ?? "—";

  return (
    <MantenimientoModalBase
      isOpen={isOpen}
      onClose={onClose}
      title="Reasignar mantenimiento"
      subtitle="Actualiza responsable, prioridad, notas y programación"
      icon={<RefreshCw className="h-6 w-6 text-white" />}
      onSave={handleSave}
      saving={saving}
      saveLabel="Guardar cambios"
    >
      <MantenimientoFormContent
        habNumero={habNumero}
        habPiso={habPiso}
        users={users}
        selectedUserId={selectedUserId}
        onUserChange={setSelectedUserId}
        prioridadLocal={prioridadLocal}
        onPrioridadChange={setPrioridadLocal}
        notasLocal={notasLocal}
        onNotasChange={setNotasLocal}
        loadingUsers={loadingUsers}
      />
    </MantenimientoModalBase>
  );
}
