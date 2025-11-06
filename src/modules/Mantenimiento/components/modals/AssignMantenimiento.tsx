"use client";
import { useEffect, useState } from "react";
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

export default function AssignMaintenanceModal({ isOpen, onClose, item, onSaved }: Props) {
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
    // Modal vacío
    setSelectedUserId("");
    setPrioridadLocal("");
    setNotasLocal("");
  }, [isOpen]);

  async function handleSave() {
    if (!item?.id) return;
    setSaving(true);
    try {
      const body: any = {};
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
      title="Editar mantenimiento"
      subtitle="Modifica los campos que necesites actualizar."
      icon={<div className="h-6 w-6 rounded-full bg-white/20" />}
      onSave={handleSave}
      saving={saving}
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
