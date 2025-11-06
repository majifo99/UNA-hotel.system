"use client";

import { X } from "lucide-react";
import { createPortal } from "react-dom";
import React from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  onSave?: () => void;
  saving?: boolean;
  saveLabel?: string;
  icon?: React.ReactNode;
}

export function MantenimientoModalBase({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  onSave,
  saving = false,
  saveLabel = "Guardar",
  icon,
}: Props) {
  if (!isOpen) return null;

  return createPortal(
    <>
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar modal"
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
      />

      <dialog
        open
        aria-modal="true"
        className="fixed inset-0 z-[51] grid place-items-center bg-transparent m-0 w-full h-full"
      >
        <div className="w-full max-w-xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col">
          {/* HEADER */}
          <div className="flex items-center justify-between px-6 py-4 bg-[var(--color-darkGreen2)]">
            <div className="flex items-center gap-3">
              {icon}
              <div>
                <h2 className="text-lg font-semibold text-white">{title}</h2>
                <p className="text-xs text-white/80">{subtitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-white/90 hover:bg-white/10 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* BODY */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-white">
            {children}
          </div>

          {/* FOOTER */}
          <div className="sticky bottom-0 bg-white px-6 py-4 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Cancelar
            </button>
            {onSave && (
              <button
                type="button"
                onClick={onSave}
                disabled={saving}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-white bg-[var(--color-darkGreen2)] hover:bg-green-800 disabled:opacity-70"
              >
                {saving ? "Guardando…" : saveLabel}
              </button>
            )}
          </div>
        </div>
      </dialog>
    </>,
    document.body
  );
}
