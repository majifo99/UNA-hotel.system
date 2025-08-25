export interface AdditionalService {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'food' | 'spa' | 'transport' | 'entertainment' | 'other';
}
