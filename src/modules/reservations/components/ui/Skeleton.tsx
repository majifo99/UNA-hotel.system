/**
 * Skeleton Components
 * 
 * Componentes de esqueleto para estados de carga
 */

interface SkeletonProps {
  readonly className?: string;
}

export function Skeleton({ className = '' }: Readonly<SkeletonProps>) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      aria-live="polite"
      aria-busy="true"
    />
  );
}

export function ReservationCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-8 w-24" />
      </div>

      {/* Dates */}
      <div className="flex gap-4">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-5 w-full" />
        </div>
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-5 w-full" />
        </div>
      </div>

      {/* Room and Guest */}
      <div className="space-y-3 pt-3 border-t border-gray-100">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-gray-100">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
  );
}

interface ReservationListSkeletonProps {
  readonly count?: number;
}

export function ReservationListSkeleton({ count = 6 }: Readonly<ReservationListSkeletonProps>) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: count }, (_, i) => (
        <ReservationCardSkeleton key={`skeleton-card-${i}`} />
      ))}
    </div>
  );
}

export function ReservationDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Guest Info */}
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-full" />
          </div>
        </div>
      </div>

      {/* Reservation Details */}
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}

interface ReservationTableSkeletonProps {
  readonly rows?: number;
}

export function ReservationTableSkeleton({ rows = 10 }: Readonly<ReservationTableSkeletonProps>) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Table Header */}
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
        <div className="grid grid-cols-6 gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }, (_, i) => (
          <div key={`skeleton-row-${i}`} className="px-6 py-4">
            <div className="grid grid-cols-6 gap-4 items-center">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function KPICardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
      <Skeleton className="h-8 w-28" />
      <Skeleton className="h-3 w-40" />
    </div>
  );
}

export function ChartSkeleton() {
  // Pre-defined heights for chart bars (deterministic, not random)
  const barHeights = [60, 45, 80, 55, 70, 90, 65, 75, 50, 85, 60, 70];
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="space-y-2">
        <div className="flex items-end space-x-2 h-48">
          {barHeights.map((height, i) => (
            <div key={`bar-${i + 1}`} className="flex-1 bg-gray-200 rounded-t animate-pulse" style={{ height: `${height}%` }} />
          ))}
        </div>
        <div className="flex justify-between px-2">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}

export function ReportsTableSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-200">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32 mt-2" />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-6 py-3"><Skeleton className="h-4 w-20" /></th>
              <th className="px-6 py-3"><Skeleton className="h-4 w-24" /></th>
              <th className="px-6 py-3"><Skeleton className="h-4 w-28" /></th>
              <th className="px-6 py-3"><Skeleton className="h-4 w-20" /></th>
              <th className="px-6 py-3"><Skeleton className="h-4 w-20" /></th>
              <th className="px-6 py-3"><Skeleton className="h-4 w-16" /></th>
              <th className="px-6 py-3"><Skeleton className="h-4 w-20" /></th>
              <th className="px-6 py-3"><Skeleton className="h-4 w-16" /></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {Array.from({ length: 8 }, (_, i) => (
              <tr key={`skeleton-row-${i + 1}`}>
                <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                <td className="px-6 py-4"><Skeleton className="h-4 w-full" /></td>
                <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                <td className="px-6 py-4"><Skeleton className="h-4 w-10" /></td>
                <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ReportsDashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Metric selector skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-40" />
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-24 rounded-md" />
          <Skeleton className="h-10 w-24 rounded-md" />
          <Skeleton className="h-10 w-28 rounded-md" />
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICardSkeleton />
        <KPICardSkeleton />
        <KPICardSkeleton />
        <KPICardSkeleton />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      {/* Additional charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      {/* Table */}
      <ReportsTableSkeleton />
    </div>
  );
}
