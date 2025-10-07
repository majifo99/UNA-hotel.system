// UI base para chips/pastillas con buena legibilidad
import React from "react";

type Tone = "neutral" | "success" | "warning" | "danger";
type Variant = "soft" | "outline";

const STYLES: Record<Tone, { soft: string; outline: string }> = {
  neutral: {
    soft:    "bg-slate-50 text-slate-700 ring-1 ring-slate-200",
    outline: "text-slate-700 ring-1 ring-slate-300 bg-white",
  },
  success: {
    // alineado al header verde (#304D3C) pero suave
    soft:    "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    outline: "text-emerald-700 ring-1 ring-emerald-300 bg-white",
  },
  warning: {
    soft:    "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
    outline: "text-amber-700 ring-1 ring-amber-300 bg-white",
  },
  danger: {
    soft:    "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
    outline: "text-rose-700 ring-1 ring-rose-300 bg-white",
  },
};

export default function Pill({
  children,
  tone = "neutral",
  variant = "soft",
  className = "",
}: React.PropsWithChildren<{ tone?: Tone; variant?: Variant; className?: string }>) {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STYLES[tone][variant]} ${className}`}>
      {children}
    </span>
  );
}
