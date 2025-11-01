import React from "react";
import { X, BadgeCheck } from "lucide-react";

type ShellProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  finishedAt?: string | null;
  maxWidthClass?: string;      // ej: "max-w-4xl"
  brand?: string;              // color de marca
  children: React.ReactNode;
  footer?: React.ReactNode;
};

const BRAND_DEF = "#304D3C";
const cx = (...xs: Array<string | false | null | undefined>) => xs.filter(Boolean).join(" ");
export const fmtDateTime = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString("es-CR", { dateStyle: "medium", timeStyle: "short" }) : "—";

function Pill({ children, tone = "slate" }: Readonly<{ children: React.ReactNode; tone?: "slate" | "green" | "rose" }>) {
  const map = {
    slate: "bg-slate-50 border-slate-200 text-slate-700",
    green: "bg-[rgba(48,77,60,0.08)] border-[rgba(48,77,60,0.25)] text-[var(--brand)]",
    rose: "bg-rose-50 border-rose-200 text-rose-700",
  } as const;
  return (
    <span className={cx("px-2 py-0.5 rounded-full text-xs font-medium border", map[tone])}
          style={{ ["--brand" as any]: BRAND_DEF }}>
      {children}
    </span>
  );
}

function Card({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <section className={cx("rounded-xl border border-slate-200 bg-white p-4", className)}>{children}</section>;
}

function Label({ children, brand = BRAND_DEF }: Readonly<{ children: React.ReactNode; brand?: string }>) {
  return <div className="text-[11px] font-semibold tracking-wide" style={{ color: brand }}>{children}</div>;
}

export default function DetailModal({
  open, onClose, title, icon, finishedAt, maxWidthClass = "max-w-4xl", brand = BRAND_DEF, children, footer,
}: Readonly<ShellProps>) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4">
      <button aria-label="Cerrar" className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <dialog open aria-modal="true"
        className={cx("relative w-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden", maxWidthClass)}>
        {/* Header */}
        <div className="px-6 py-5" style={{ background: `linear-gradient(90deg, ${brand} 0%, ${brand}E6 100%)` }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center ring-1 ring-white/20">
                {icon ?? null}
              </div>
              <h2 className="text-white text-lg font-semibold leading-tight">{title}</h2>
            </div>
            <div className="flex items-center gap-2">
              {finishedAt && (
                <span className="inline-flex items-center gap-1 rounded-full border border-white/30 bg-white/10 px-2 py-0.5 text-xs font-medium text-white/90">
                  <BadgeCheck className="w-3 h-3 text-white/80" />
                  <span>Finalizado: {fmtDateTime(finishedAt)}</span>
                </span>
              )}
              <button aria-label="Cerrar" onClick={onClose}
                className="p-2 rounded-lg text-white/90 hover:bg-white/10 focus:outline-none">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="max-h-[75vh] overflow-y-auto">{children}</div>

        {/* Footer */}
        <div className="sticky bottom-0 z-10 flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-200 bg-white">
          {footer ?? (
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50">
              Cerrar
            </button>
          )}
        </div>
      </dialog>
    </div>
  );
}

// subcomponentes exportados para reutilizar sin duplicar
DetailModal.Pill = Pill;
DetailModal.Card = Card;
DetailModal.Label = Label;
