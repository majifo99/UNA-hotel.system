import type { CheckInData, CheckInResponse } from '../types/checkin';

const API_URL = '/api/checkins'; // Puedes cambiar esto por tu ruta real más adelante

const checkinService = {
  getCheckIns: async (): Promise<CheckInData[]> => {
    // Aquí podrías usar fetch, axios, etc.
    return [];
  },

  createCheckIn: async (checkInData: CheckInData): Promise<CheckInResponse> => {
    // Este método simula éxito sin guardar datos
    return {
      success: true,
      data: checkInData,
    };
  },

  getCheckInByReservationId: async (reservationId: string): Promise<CheckInResponse> => {
    // No busca nada porque no hay datos
    return {
      success: false,
      error: 'Check-in not found (mock)',
    };
  },
};

export default checkinService;
