export interface Guest {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  documentType: 'passport' | 'id' | 'license';
  documentNumber: string;
}
