import axios from 'axios';

function mapEstadoIdToStatus(id) {
  switch (id) {
    case 1: return 'cancelled';
    case 2: return 'pending';
    case 3: return 'confirmed';
    case 4: return 'checked_in';
    case 5: return 'checked_out';
    case 6: return 'no_show';
    default: return 'pending';
  }
}

function mapApiReservationToReservation(api) {
  const apiCliente = api.cliente;
  const mappedGuest = apiCliente ? {
    id: String(apiCliente.id_cliente),
    firstName: apiCliente.nombre || '',
    firstLastName: apiCliente.apellido1 || '',
    secondLastName: apiCliente.apellido2 || '',
    email: apiCliente.email || '',
    phone: apiCliente.telefono || '',
    documentType: 'id_card',
    documentNumber: apiCliente.numero_doc || '',
    nationality: apiCliente.nacionalidad || '',
    createdAt: apiCliente.created_at || api.created_at || new Date().toISOString(),
    updatedAt: apiCliente.updated_at || api.updated_at || new Date().toISOString(),
    isActive: true,
  } : undefined;

  const numberOfGuests = (api.adultos || 0) + (api.ninos || 0) + (api.bebes || 0);

  return {
    id: String(api.id_reserva),
    confirmationNumber: String(api.id_reserva),
    guestId: String(api.id_cliente),
    guest: mappedGuest,
    roomId: '',
    roomType: undefined,
    room: undefined,
    checkInDate: '',
    checkOutDate: '',
    numberOfGuests,
    numberOfNights: 1,
    additionalServices: [],
    subtotal: api.total_monto_reserva || 0,
    servicesTotal: 0,
    taxes: 0,
    total: api.total_monto_reserva || 0,
    depositRequired: 0,
    status: mapEstadoIdToStatus(api.id_estado_res),
    specialRequests: api.notas || undefined,
    paymentMethod: undefined,
    createdAt: api.created_at || api.fecha_creacion || new Date().toISOString(),
    updatedAt: api.updated_at || api.fecha_creacion || new Date().toISOString(),
  };
}

const url = process.env.API_URL || 'http://127.0.0.1:8000/api/reservas';

try {
  const { data } = await axios.get(url);
  const list = Array.isArray(data) ? data : (data?.data || []);
  const mapped = list.map((reservation) => mapApiReservationToReservation(reservation));
  console.log(JSON.stringify(mapped, null, 2));
} catch (error) {
  console.error('Error fetching reservations:', error);
  process.exit(1);
}
