import { ClipboardCheck, AlertTriangle } from "lucide-react";

type CardProps = {
  title: string;
  value: number | string;
  color: string; // tailwind: text-* (puede ser arbitrario: text-[#304D3C])
  icon: React.ReactNode;
  subtitle?: string;
};

const StatsCard: React.FC<CardProps> = ({ title, value, icon, color, subtitle }) => (
  <div className="relative overflow-hidden p-6 rounded-xl bg-white border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 group">
    {/* decoraciones sutiles */}
    <div className="absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 rounded-full bg-gradient-to-br from-gray-50 to-gray-100/50 opacity-60 group-hover:opacity-80 transition-opacity" />
    <div className="absolute bottom-0 left-0 w-16 h-16 -ml-8 -mb-8 rounded-full bg-gradient-to-tr from-gray-100/30 to-transparent opacity-40 group-hover:opacity-60 transition-opacity" />

    <div className="relative flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-700 mb-2 tracking-wide uppercase">{title}</p>
        <p className={`text-4xl font-bold ${color} mb-2 tracking-tight`}>{value}</p>
        {subtitle && (
          <div className="flex items-center">
            <span className="text-xs text-gray-600 font-medium bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
              {subtitle}
            </span>
          </div>
        )}
      </div>
      <div className={`relative p-5 rounded-2xl ${color} bg-opacity-15 group-hover:scale-110 group-hover:bg-opacity-20 transition-all duration-300 shadow-lg border border-gray-100`}>
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gray-50/30 to-transparent opacity-60" />
        <div className="absolute inset-0 rounded-2xl border border-gray-200/30" />
        <div className="relative">{icon}</div>
      </div>
    </div>

    {/* barra inferior y borde hover heredan color via replace */}
    <div className={`absolute bottom-0 left-0 h-1.5 w-0 ${color.replace("text-", "bg-")} group-hover:w-full transition-all duration-700 ease-out shadow-sm rounded-full`} />
    <div className={`absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-opacity-50 ${color.replace("text-", "border-")} transition-all duration-300`} />
  </div>
);

/** 👇 Componente grupo de contadores (este es el que usarás en el dashboard) */
export type HKCounterCardsProps = Readonly<{
  sucias: number;
  limpias: number;
  total: number;
}>;

export default function HKCounterCards({ sucias, limpias }: HKCounterCardsProps) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <StatsCard
        title="Habitaciones sucias"
        value={sucias}
        color="text-rose-600"
        icon={<AlertTriangle className="h-7 w-7" />}
        subtitle="Pendientes de limpieza"
      />
      <StatsCard
        title="Habitaciones limpias"
        value={limpias}
        color="text-green-600"  // <-- verde exacto
        icon={<ClipboardCheck className="h-7 w-7" />} // <-- corregido el typo
        subtitle="Listas para uso"
      />
    </section>
  );
}
