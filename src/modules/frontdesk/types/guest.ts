export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;               // con código internacional (+52...)
  nationality: string;         // código ISO como 'MX', 'US', 'ES'
  identificationNumber: string;
}
