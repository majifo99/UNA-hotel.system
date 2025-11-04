/**
 * Skeleton component for ReservationDetailFullPage
 */

import React from 'react';
import { ArrowLeft } from 'lucide-react';

export const ReservationDetailSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header fijo */}
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg p-2 bg-slate-100">
                <ArrowLeft className="h-5 w-5 text-slate-300" />
              </div>
              <div>
                <div className="h-7 w-48 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-4 w-32 bg-slate-100 rounded animate-pulse mt-2"></div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-10 w-24 bg-slate-200 rounded-lg animate-pulse"></div>
              <div className="h-10 w-24 bg-slate-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Estado */}
          <div className="flex items-center justify-between">
            <div className="h-8 w-32 bg-slate-200 rounded-full animate-pulse"></div>
            <div className="h-6 w-48 bg-slate-200 rounded animate-pulse"></div>
          </div>

          {/* Grid de cards */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Card skeleton 1 */}
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="h-5 w-40 bg-slate-200 rounded animate-pulse mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 w-full bg-slate-100 rounded animate-pulse"></div>
                <div className="h-4 w-3/4 bg-slate-100 rounded animate-pulse"></div>
                <div className="h-4 w-5/6 bg-slate-100 rounded animate-pulse"></div>
              </div>
            </div>

            {/* Card skeleton 2 */}
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="h-5 w-40 bg-slate-200 rounded animate-pulse mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 w-full bg-slate-100 rounded animate-pulse"></div>
                <div className="h-4 w-3/4 bg-slate-100 rounded animate-pulse"></div>
                <div className="h-4 w-5/6 bg-slate-100 rounded animate-pulse"></div>
              </div>
            </div>

            {/* Card skeleton 3 */}
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="h-5 w-40 bg-slate-200 rounded animate-pulse mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 w-full bg-slate-100 rounded animate-pulse"></div>
                <div className="h-4 w-3/4 bg-slate-100 rounded animate-pulse"></div>
              </div>
            </div>

            {/* Card skeleton 4 */}
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="h-5 w-40 bg-slate-200 rounded animate-pulse mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 w-full bg-slate-100 rounded animate-pulse"></div>
                <div className="h-4 w-3/4 bg-slate-100 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Habitaciones skeleton */}
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="h-5 w-48 bg-slate-200 rounded animate-pulse mb-4"></div>
            <div className="space-y-4">
              <div className="h-24 w-full bg-slate-100 rounded-xl animate-pulse"></div>
              <div className="h-24 w-full bg-slate-100 rounded-xl animate-pulse"></div>
            </div>
          </div>

          {/* Metadata skeleton */}
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="h-5 w-56 bg-slate-200 rounded animate-pulse mb-4"></div>
            <div className="space-y-3">
              <div className="h-20 w-full bg-gradient-to-r from-slate-100 to-slate-50 rounded-xl animate-pulse"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-16 bg-slate-100 rounded-lg animate-pulse"></div>
                <div className="h-16 bg-slate-100 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
