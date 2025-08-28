export interface Room {
  id: string;
  type: 'single' | 'double' | 'triple' | 'suite' | 'family' | 'deluxe';
  name: string;
  capacity: number;
  pricePerNight: number;
  amenities: string[];
  isAvailable: boolean;
}
