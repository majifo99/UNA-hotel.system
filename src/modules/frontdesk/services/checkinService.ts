import type { CheckInData, CheckInResponse } from '../types/checkin';

// const API_URL = '/api/checkins'; // Para uso futuro cuando conectemos con backend real

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

  getCheckInByReservationId: async (_reservationId: string): Promise<CheckInResponse> => {
    // No busca nada porque no hay datos (mock service)
    return {
      success: false,
      error: 'Check-in not found (mock)',
    };
  },
};

export default checkinService;
