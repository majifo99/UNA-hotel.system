/**
 * Skeleton component for ReservationDetailFullPage
 * Refactored to use shared Skeleton primitives
 */

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '../../../../shared/ui/Skeleton';

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
                <Skeleton.Text width="48" height="lg" className="mb-2" />
                <Skeleton.Text width="32" height="sm" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton.Button width="24" />
              <Skeleton.Button width="24" />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Estado */}
          <div className="flex items-center justify-between">
            <Skeleton.Text width="32" height="lg" className="rounded-full" />
            <Skeleton.Text width="48" />
          </div>

          {/* Grid de cards */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton.Card header lines={3} />
            <Skeleton.Card header lines={3} />
            <Skeleton.Card header lines={2} />
            <Skeleton.Card header lines={2} />
          </div>

          {/* Habitaciones skeleton */}
          <Skeleton.Card header>
            <div className="space-y-4">
              <Skeleton.Text width="full" height="xl" className="rounded-xl" />
              <Skeleton.Text width="full" height="xl" className="rounded-xl" />
            </div>
          </Skeleton.Card>

          {/* Metadata skeleton */}
          <Skeleton.Card header>
            <div className="space-y-3">
              <Skeleton.Text width="full" height="xl" className="rounded-xl bg-gradient-to-r from-slate-100 to-slate-50" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton.Text width="full" height="lg" className="rounded-lg" />
                <Skeleton.Text width="full" height="lg" className="rounded-lg" />
              </div>
            </div>
          </Skeleton.Card>
        </div>
      </div>
    </div>
  );
};

export default ReservationDetailSkeleton;
