import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Reservation } from '../types';
import { useReservationsList } from '../hooks/useReservationQueries';
import { 
  ReservationsFilters, 
  ReservationsTable, 
  TablePagination,
  type ReservationListFilters,
  type PaginationInfo,
} from '../components/list';

const STRINGS = {
  title: 'Gestión de reservaciones',
  subtitle: 'Controla tus reservas, ajusta fechas y gestiona cancelaciones con validaciones visibles.',
  total: 'Total',
  confirmed: 'Confirmadas',
  pending: 'Pendientes',
  cancelled: 'Canceladas',
};

const DEFAULT_FILTERS: ReservationListFilters = {
  query: '',
  status: 'all',
  startDate: undefined,
  endDate: undefined,
};

function applyFilters(reservations: Reservation[], filters: ReservationListFilters): Reservation[] {
  const normalizedQuery = filters.query.trim().toLowerCase();
  const start = filters.startDate ? new Date(filters.startDate) : null;
  const end = filters.endDate ? new Date(filters.endDate) : null;

  return reservations
    .filter((reservation) => {
      const matchesStatus = filters.status === 'all' || reservation.status === filters.status;

      const checkIn = reservation.checkInDate ? new Date(reservation.checkInDate) : null;
      const checkOut = reservation.checkOutDate ? new Date(reservation.checkOutDate) : null;

      const matchesStart = !start
        || (checkIn && checkIn >= start)
        || (checkOut && checkOut >= start);

      const matchesEnd = !end
        || (checkOut && checkOut <= end)
        || (checkIn && checkIn <= end);

      const haystack = [
        reservation.confirmationNumber,
        reservation.guest?.firstName,
        reservation.guest?.firstLastName,
        reservation.guest?.secondLastName,
        reservation.guest?.email,
        reservation.guest?.phone,
        reservation.specialRequests,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesQuery = normalizedQuery.length === 0
        || haystack.includes(normalizedQuery)
        || reservation.id.toLowerCase().includes(normalizedQuery);

      return matchesStatus && matchesStart && matchesEnd && matchesQuery;
    })
    .sort((a, b) => {
      const aDate = a.checkInDate ? new Date(a.checkInDate).getTime() : 0;
      const bDate = b.checkInDate ? new Date(b.checkInDate).getTime() : 0;
      return bDate - aDate;
    });
}

export const ReservationsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { data = [], isLoading, isError, refetch } = useReservationsList();
  const [filters, setFilters] = React.useState<ReservationListFilters>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);

  const filteredReservations = React.useMemo(
    () => applyFilters(data, filters),
    [data, filters]
  );

  // Paginación local
  const paginatedReservations = React.useMemo(() => {
    const startIndex = (currentPage - 1) * perPage;
    const endIndex = startIndex + perPage;
    return filteredReservations.slice(startIndex, endIndex);
  }, [filteredReservations, currentPage, perPage]);

  const pagination: PaginationInfo = React.useMemo(() => {
    const total = filteredReservations.length;
    const lastPage = Math.ceil(total / perPage);
    const from = total === 0 ? 0 : (currentPage - 1) * perPage + 1;
    const to = Math.min(currentPage * perPage, total);

    return {
      currentPage,
      perPage,
      total,
      from,
      to,
      lastPage,
    };
  }, [filteredReservations.length, currentPage, perPage]);

  // Reset a página 1 cuando cambian los filtros
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
  };

  const stats = React.useMemo(() => {
    if (!data || data.length === 0) {
      return {
        total: 0,
        confirmed: 0,
        pending: 0,
        cancelled: 0,
      };
    }

    const counters = {
      total: data.length,
      confirmed: 0,
      pending: 0,
      cancelled: 0,
    };

    data.forEach((reservation) => {
      if (reservation.status === 'confirmed' || reservation.status === 'checked_in') {
        counters.confirmed += 1;
      }
      if (reservation.status === 'pending') {
        counters.pending += 1;
      }
      if (reservation.status === 'cancelled' || reservation.status === 'no_show') {
        counters.cancelled += 1;
      }
    });

    return counters;
  }, [data]);

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const summaryCards = [
    { label: STRINGS.total, value: stats.total, badgeClass: 'bg-slate-100 text-slate-700' },
    { label: STRINGS.confirmed, value: stats.confirmed, badgeClass: 'bg-emerald-100 text-emerald-700' },
    { label: STRINGS.pending, value: stats.pending, badgeClass: 'bg-amber-100 text-amber-700' },
    { label: STRINGS.cancelled, value: stats.cancelled, badgeClass: 'bg-rose-100 text-rose-700' },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-8 bg-slate-50">
      <header className="space-y-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">{STRINGS.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{STRINGS.subtitle}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {summaryCards.map((card) => (
            <article
              key={card.label}
              className="rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{card.label}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{card.value}</p>
              <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${card.badgeClass}`}>
                {card.value === 1 ? '1 registro' : `${card.value} registros`}
              </span>
            </article>
          ))}
        </div>
      </header>

      <section className="rounded-3xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <ReservationsFilters
            filters={filters}
            onChange={setFilters}
            onReset={handleResetFilters}
          />
          {filteredReservations.length > 0 && (
            <div className="mt-4 text-sm text-slate-600">
              Se encontraron <strong>{filteredReservations.length}</strong> reservacion{filteredReservations.length === 1 ? '' : 'es'}
            </div>
          )}
        </div>
        <div className="px-2 pb-2 pt-4 md:px-6">
          <ReservationsTable
            reservations={paginatedReservations}
            isLoading={isLoading}
            isError={isError}
            onRetry={refetch}
            onEdit={(reservation) => navigate(`/reservations/${reservation.id}/edit`)}
            onCancel={(reservation) => navigate(`/reservations/${reservation.id}/cancel`)}
            onViewDetail={(reservation) => navigate(`/reservations/${reservation.id}/detail`)}
          />
        </div>
        {filteredReservations.length > 0 && (
          <TablePagination
            pagination={pagination}
            onPageChange={handlePageChange}
            onPerPageChange={handlePerPageChange}
          />
        )}
      </section>
    </div>
  );
};

export default ReservationsListPage;