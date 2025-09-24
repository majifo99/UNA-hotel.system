export const COUNTRY_LABELS = {
  CR: 'Costa Rica',
  US: 'Estados Unidos',
  MX: 'México',
  CA: 'Canadá',
  ES: 'España',
  FR: 'Francia',
  DE: 'Alemania',
  IT: 'Italia',
  BR: 'Brasil',
  AR: 'Argentina',
  CL: 'Chile',
  CO: 'Colombia',
  PE: 'Perú',
  VE: 'Venezuela',
  EC: 'Ecuador',
  BO: 'Bolivia',
  PY: 'Paraguay',
  UY: 'Uruguay',
  PA: 'Panamá',
  GT: 'Guatemala',
  HN: 'Honduras',
  SV: 'El Salvador',
  NI: 'Nicaragua',
  BZ: 'Belice',
  DO: 'República Dominicana',
  CU: 'Cuba',
  JM: 'Jamaica'
} as const;

export const DOCUMENT_TYPE_OPTIONS = [
  { value: 'id_card', label: 'Cédula' },
  { value: 'passport', label: 'Pasaporte' },
  { value: 'license', label: 'Licencia' }
] as const;

export const GENDER_OPTIONS = [
  { value: '', label: 'Seleccionar...' },
  { value: 'male', label: 'Masculino' },
  { value: 'female', label: 'Femenino' },
  { value: 'other', label: 'Otro' },
  { value: 'prefer_not_to_say', label: 'Prefiero no decir' }
] as const;

export const PHONE_CONFIG = {
  defaultCountry: 'cr',
  preferredCountries: ['cr', 'us', 'mx', 'ca', 'es', 'fr', 'de', 'it'],
  localization: {
    cr: 'Costa Rica',
    us: 'Estados Unidos',
    mx: 'México',
    ca: 'Canadá',
    es: 'España',
    fr: 'Francia',
    de: 'Alemania',
    it: 'Italia'
  }
};

export const DEFAULT_GUEST_DATA = {
  firstName: '',
  firstLastName: '',
  secondLastName: '',
  email: '',
  phone: '',
  nationality: 'CR',
  documentType: 'id_card' as const,
  documentNumber: '',
  dateOfBirth: '',
  gender: undefined as string | undefined,
  notes: '',
  isActive: true
} as const;