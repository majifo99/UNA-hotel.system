import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, CheckCircle, Clock, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { Reservation } from '../types';
import { useReservationsList, useConfirmReservation } from '../hooks/useReservationQueries';
import SolLogo from '../../../assets/Lanaku.png';
import { 
  ReservationsFilters, 
  ReservationsTable,  
  ConfirmReservationModal,
  TablePagination,
  type ReservationListFilters,
  type PaginationInfo,
} from '../components/list';

const STRINGS = {
  title: 'Gestión de reservaciones',
  subtitle: 'Controla tus reservas, ajusta fechas y gestiona cancelaciones',
  total: 'Total de reservaciones',
  confirmed: 'Confirmadas',
  pending: 'Pendientes',
  cancelled: 'Canceladas',
  newReservation: 'Nueva Reservación',
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
  const confirmReservation = useConfirmReservation();
  const [filters, setFilters] = React.useState<ReservationListFilters>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);
  const [reservationToConfirm, setReservationToConfirm] = React.useState<Reservation | null>(null);
  const [showConfirmModal, setShowConfirmModal] = React.useState(false);
  const [confirmingId, setConfirmingId] = React.useState<string | null>(null);

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

  const handleOpenConfirmModal = (reservation: Reservation) => {
    setReservationToConfirm(reservation);
    setShowConfirmModal(true);
  };

  const handleCloseConfirmModal = () => {
    setShowConfirmModal(false);
    setReservationToConfirm(null);
    setConfirmingId(null);
  };

  const handleConfirmReservation = async (reservation: Reservation) => {
    setConfirmingId(reservation.id);
    
    try {
      await confirmReservation.mutateAsync({ 
        id: reservation.id, 
        notas: 'Confirmada desde la lista de reservas' 
      });
      
      toast.success('Reserva confirmada', {
        description: `La reserva ${reservation.confirmationNumber} ha sido confirmada exitosamente.`
      });
      
      handleCloseConfirmModal();
      refetch();
    } catch (error) {
      toast.error('Error al confirmar', {
        description: 'No se pudo confirmar la reserva. Intenta nuevamente.'
      });
      console.error('Error confirming reservation:', error);
      setConfirmingId(null);
    }
  };

  const summaryCards = [
    { 
      label: STRINGS.total, 
      value: stats.total, 
      icon: <Calendar className="h-7 w-7" />,
      color: 'text-slate-600',
      subtitle: `${stats.total} ${stats.total === 1 ? 'reservación' : 'reservaciones'}`
    },
    { 
      label: STRINGS.confirmed, 
      value: stats.confirmed, 
      icon: <CheckCircle className="h-7 w-7" />,
      color: 'text-green-600',
      subtitle: 'Activas en el sistema'
    },
    { 
      label: STRINGS.pending, 
      value: stats.pending, 
      icon: <Clock className="h-7 w-7" />,
      color: 'text-amber-600',
      subtitle: 'Esperando confirmación'
    },
    { 
      label: STRINGS.cancelled, 
      value: stats.cancelled, 
      icon: <XCircle className="h-7 w-7" />,
      color: 'text-rose-600',
      subtitle: 'Canceladas o No-show'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header estilo Housekeeping */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ring-1 ring-slate-200 bg-slate-50">
              <img src={SolLogo} alt="Lanaku Sol" className="w-12 h-12 object-contain drop-shadow" />
            </div>
            <div>
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
                {STRINGS.title}
              </h1>
              <p className="text-sm font-medium text-slate-600">{STRINGS.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/reservations/create')}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#304D3C] to-[#3d6149] hover:from-[#243a2e] hover:to-[#304D3C] px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200 border border-[#3d6149]/30"
            >
              <Plus className="h-5 w-5" />
              {STRINGS.newReservation}
            </button>
          </div>
        </div>
      </header>

      <main className="p-5 pb-0">
        <div className="max-w-7xl mx-auto space-y-5">
          {/* Stats Cards estilo Housekeeping */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {summaryCards.map((card) => (
              <div
                key={card.label}
                className="relative overflow-hidden p-6 rounded-xl bg-white border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <div className="absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 rounded-full bg-gradient-to-br from-gray-50 to-gray-100/50 opacity-60 group-hover:opacity-80 transition-opacity" />
                <div className="absolute bottom-0 left-0 w-16 h-16 -ml-8 -mb-8 rounded-full bg-gradient-to-tr from-gray-100/30 to-transparent opacity-40 group-hover:opacity-60 transition-opacity" />
                
                <div className="relative flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700 mb-2 tracking-wide uppercase">{card.label}</p>
                    <p className={`text-4xl font-bold ${card.color} mb-2 tracking-tight`}>{card.value}</p>
                    {card.subtitle && (
                      <div className="flex items-center">
                        <span className="text-xs text-gray-600 font-medium bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
                          {card.subtitle}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className={`relative p-5 rounded-2xl ${card.color} bg-opacity-15 group-hover:scale-110 group-hover:bg-opacity-20 transition-all duration-300 shadow-lg border border-gray-100`}>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gray-50/30 to-transparent opacity-60" />
                    <div className="absolute inset-0 rounded-2xl border border-gray-200/30" />
                    <div className="relative">{card.icon}</div>
                  </div>
                </div>
                
                <div className={`absolute bottom-0 left-0 h-1.5 w-0 ${card.color.replace("text-", "bg-")} group-hover:w-full transition-all duration-700 ease-out shadow-sm rounded-full`} />
                <div className={`absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-opacity-50 ${card.color.replace("text-", "border-")} transition-all duration-300`} />
              </div>
            ))}
          </section>

          {/* Filters Section */}
          <div className="bg-white rounded-xl border-2 border-gray-200 shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-[#304D3C]/10">
                <Calendar className="h-5 w-5 text-[#304D3C]" />
              </div>
              <h2 className="text-lg font-semibold text-slate-800">Filtros de búsqueda</h2>
            </div>
            
            <ReservationsFilters
              filters={filters}
              onChange={setFilters}
              onReset={handleResetFilters}
            />
            
            {filteredReservations.length > 0 && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm text-slate-600">
                  Se encontraron <strong className="text-[#304D3C]">{filteredReservations.length}</strong> reservacion{filteredReservations.length === 1 ? '' : 'es'}
                </span>
              </div>
            )}
          </div>

          {/* Table Section */}
          <div className="bg-white rounded-xl border-2 border-gray-200 shadow-lg overflow-hidden">
            <ReservationsTable
              reservations={paginatedReservations}
              isLoading={isLoading}
              isError={isError}
              onRetry={refetch}
              onEdit={(reservation) => navigate(`/reservations/${reservation.id}/edit`)}
              onCancel={(reservation) => navigate(`/reservations/${reservation.id}/cancel`)}
              onConfirm={handleOpenConfirmModal}
              onViewDetail={(reservation) => navigate(`/reservations/${reservation.id}/detail`)}
              confirmingId={confirmingId}
            />
            
            {filteredReservations.length > 0 && (
              <TablePagination
                pagination={pagination}
                onPageChange={handlePageChange}
                onPerPageChange={handlePerPageChange}
              />
            )}
          </div>

          <div className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-3 rounded-full">
            Total de reservaciones: {filteredReservations.length}
          </div>
        </div>
      </main>

      {/* Modal de confirmación */}
      <ConfirmReservationModal
        reservation={reservationToConfirm}
        isOpen={showConfirmModal}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmReservation}
        isLoading={confirmReservation.isPending}
      />
    </div>
  );
};

export default ReservationsListPage;