// CheckIn.tsx — Rediseño estilo "Hotel Check-in Form"
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import ReactFlagsSelect from 'react-flags-select';
import { useCheckIn } from '../hooks/useCheckIn';
import { useReservationSearch, useReservationSearchByGuest } from '../hooks/useReservationSearch';
import type { CheckInData } from '../types/checkin';
import type { Reservation } from '../../../types/core';

type LocalState = {
  reservationId: string;
  firstName: string;
  lastName: string;
  roomNumber: string;
  checkInDate: string;
  numberOfGuests: number;
  identificationNumber: string;
  paymentStatus: 'pending' | 'completed';
  phone: string;
  phoneCountryCode: string;
  nationality: string;
  email: string;
  checkInTime: string;
  checkOutTime: string;
  roomPreferences: string;
  paymentMethod: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  acceptedTerms: boolean;
  parkingRequired: boolean;
  breakfastIncluded: boolean;
  specialRequests: string;
  step: 'search' | 'guest-info' | 'room-assignment' | 'payment' | 'confirmation';
};

const Label = ({ children, htmlFor, required = false }: { children: React.ReactNode; htmlFor: string; required?: boolean }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-[var(--color-sand)]">
    {children} {required && <span className="text-red-400">*</span>}
  </label>
);


const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={[
      "mt-2 w-full rounded-lg border border-[var(--color-sand)]/20 bg-[var(--color-darkGreen1)]/50 px-4 py-3 text-white shadow-sm",
      "placeholder:text-[var(--color-sand)]/30 focus:border-[var(--color-sand)] focus:ring-2 focus:ring-[var(--color-sand)]/50",
      "hover:border-[var(--color-sand)]/30 transition-colors",
      "disabled:opacity-60",
      props.className || ""
    ].join(" ")}
  />
);

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...props}
    className={[
      "mt-2 w-full rounded-lg border border-[var(--color-sand)]/20 bg-[var(--color-darkGreen1)]/50 px-4 py-3 text-white shadow-sm",
      "focus:border-[var(--color-sand)] focus:ring-2 focus:ring-[var(--color-sand)]/50",
      "hover:border-[var(--color-sand)]/30 transition-colors",
      "disabled:opacity-60",
      props.className || ""
    ].join(" ")}
  />
);

export const CheckIn = () => {
  const navigate = useNavigate();
  const { checkIns, isLoadingCheckIns, isSubmitting, error, validateAndSubmit } = useCheckIn();
  
  // Search state
  const [searchMode, setSearchMode] = useState<'confirmation' | 'guest'>('confirmation');
  const [foundReservation, setFoundReservation] = useState<Reservation | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const [formData, setFormData] = useState<LocalState>({
    reservationId: '',
    firstName: '',
    lastName: '',
    roomNumber: '',
    checkInDate: new Date().toISOString().split('T')[0],
    checkInTime: '15:00',
    checkOutTime: '12:00',
    numberOfGuests: 1,
    identificationNumber: '',
    paymentStatus: 'pending',
    phone: '',
    phoneCountryCode: 'us',
    nationality: 'US',
    email: '',
    roomPreferences: '',
    paymentMethod: 'credit_card',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    acceptedTerms: false,
    parkingRequired: false,
    breakfastIncluded: false,
    specialRequests: '',
    step: 'search'
  });

  // Search hooks
  const { 
    data: reservationByConfirmation, 
    isLoading: searchingByConfirmation, 
    error: errorByConfirmation,
    isError: hasErrorByConfirmation
  } = useReservationSearch(
    formData.reservationId, 
    isSearching && searchMode === 'confirmation'
  );
  
  const { 
    data: reservationByGuest, 
    isLoading: searchingByGuest, 
    error: errorByGuest,
    isError: hasErrorByGuest
  } = useReservationSearchByGuest(
    formData.lastName,
    formData.identificationNumber,
    isSearching && searchMode === 'guest'
  );

  // Handle search results
  useEffect(() => {
    const reservation = searchMode === 'confirmation' ? reservationByConfirmation : reservationByGuest;
    const hasError = searchMode === 'confirmation' ? hasErrorByConfirmation : hasErrorByGuest;
    const isLoading = searchMode === 'confirmation' ? searchingByConfirmation : searchingByGuest;
    
    if (reservation && isSearching && !isLoading) {
      setFoundReservation(reservation);
      // Auto-populate form with reservation data
      setFormData(prev => ({
        ...prev,
        firstName: reservation.guest?.firstName || '',
        lastName: reservation.guest?.lastName || '',
        email: reservation.guest?.email || '',
        phone: reservation.guest?.phone || '',
        phoneCountryCode: 'us', // Default, could be extracted from phone if needed
        nationality: 'US', // Default, could be extracted from guest data if available
        identificationNumber: reservation.guest?.documentNumber || '',
        numberOfGuests: reservation.numberOfGuests,
        checkInDate: reservation.checkInDate.split('T')[0],
        checkOutTime: reservation.checkOutDate.split('T')[1]?.substring(0, 5) || '12:00',
        specialRequests: reservation.specialRequests || '',
        roomNumber: reservation.roomId || '',
      }));
      setIsSearching(false);
    } else if (isSearching && !isLoading && !hasError && !reservation) {
      // Search completed but no results found
      setFoundReservation(null);
      setIsSearching(false);
    } else if (isSearching && hasError) {
      // Search failed due to API error
      setFoundReservation(null);
      setIsSearching(false);
    }
  }, [reservationByConfirmation, reservationByGuest, isSearching, searchMode, searchingByConfirmation, searchingByGuest, hasErrorByConfirmation, hasErrorByGuest]);

  const onChange =
    (name: keyof LocalState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = e.target.value;
      setFormData((prev) => ({
        ...prev,
        [name]: name === 'numberOfGuests' ? Math.max(1, parseInt(value || '1', 10)) : value,
      }));
    };

  const handleSearch = () => {
    if (searchMode === 'confirmation' && formData.reservationId.trim()) {
      setIsSearching(true);
    } else if (searchMode === 'guest' && formData.lastName.trim() && formData.identificationNumber.trim()) {
      setIsSearching(true);
    }
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CheckInData = {
      reservationId: formData.reservationId.trim(),
      roomNumber: formData.roomNumber.trim(),
      checkInDate: `${formData.checkInDate}T${formData.checkInTime}:00`,
      numberOfGuests: formData.numberOfGuests,
      identificationNumber: formData.identificationNumber.trim(),
      paymentStatus: formData.paymentStatus,
    };
    await validateAndSubmit(payload);
  };

  if (isLoadingCheckIns) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-darkGreen1)]">
        <p className="text-[var(--color-sand)]">Loading…</p>
      </div>
    );
  }

  const renderStep = () => {
    switch (formData.step) {
      case 'search':
        return (
          <section className="space-y-6">
            <h2 className="text-lg font-semibold text-[var(--color-sand)]">Search Reservation</h2>
            
            {/* Search Mode Toggle */}
            <div className="flex gap-4 mb-6">
              <button
                type="button"
                onClick={() => setSearchMode('confirmation')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  searchMode === 'confirmation'
                    ? 'bg-[var(--color-sand)] text-[var(--color-darkGreen1)]'
                    : 'bg-[var(--color-darkGreen1)]/50 text-[var(--color-sand)] hover:bg-[var(--color-sand)]/10'
                }`}
              >
                By Confirmation Number
              </button>
              <button
                type="button"
                onClick={() => setSearchMode('guest')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  searchMode === 'guest'
                    ? 'bg-[var(--color-sand)] text-[var(--color-darkGreen1)]'
                    : 'bg-[var(--color-darkGreen1)]/50 text-[var(--color-sand)] hover:bg-[var(--color-sand)]/10'
                }`}
              >
                By Guest Information
              </button>
            </div>

            {searchMode === 'confirmation' ? (
            <div>
                <Label htmlFor="reservationId">Confirmation Number</Label>
              <Input
                id="reservationId"
                name="reservationId"
                  placeholder="Enter your confirmation number (e.g., CONF-ABC123)"
                value={formData.reservationId}
                onChange={onChange('reservationId')}
                required
              />
            </div>
            ) : (
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Enter the last name on the reservation"
                  value={formData.lastName}
                  onChange={onChange('lastName')}
                  required
                />
              </div>
              <div>
                <Label htmlFor="identificationNumber">ID/Passport</Label>
                <Input
                  id="identificationNumber"
                  name="identificationNumber"
                  placeholder="Enter your ID number"
                  value={formData.identificationNumber}
                  onChange={onChange('identificationNumber')}
                  required
                />
              </div>
            </div>
            )}

            {/* Search Button */}
            <button
              type="button"
              onClick={handleSearch}
              disabled={isSearching || searchingByConfirmation || searchingByGuest}
              className="w-full rounded-lg bg-[var(--color-sand)] px-6 py-3 font-semibold text-[var(--color-darkGreen1)] shadow-sm transition hover:bg-[var(--color-cream)] disabled:opacity-50"
            >
              {isSearching || searchingByConfirmation || searchingByGuest ? 'Searching...' : 'Search Reservation'}
            </button>

            {/* Search Results */}
            {foundReservation && (
              <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4">
                <h3 className="text-green-400 font-semibold mb-2">✓ Reservation Found!</h3>
                <div className="text-sm text-white space-y-1">
                  <p><span className="font-semibold text-[var(--color-sand)]">Guest:</span> {foundReservation.guest?.firstName} {foundReservation.guest?.lastName}</p>
                  <p><span className="font-semibold text-[var(--color-sand)]">Confirmation:</span> {foundReservation.confirmationNumber}</p>
                  <p><span className="font-semibold text-[var(--color-sand)]">Check-in:</span> {foundReservation.checkInDate}</p>
                  <p><span className="font-semibold text-[var(--color-sand)]">Room Type:</span> {foundReservation.roomType}</p>
                  <p><span className="font-semibold text-[var(--color-sand)]">Status:</span> {foundReservation.status}</p>
                </div>
              </div>
            )}

            {/* No results found */}
            {isSearching && !searchingByConfirmation && !searchingByGuest && !foundReservation && !hasErrorByConfirmation && !hasErrorByGuest && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
                <h3 className="text-red-400 font-semibold mb-2">✗ No Reservation Found</h3>
                <p className="text-sm text-white">Please check your information and try again.</p>
              </div>
            )}

            {/* API Error */}
            {(hasErrorByConfirmation || hasErrorByGuest) && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
                <h3 className="text-red-400 font-semibold mb-2">⚠️ Search Error</h3>
                <p className="text-sm text-white mb-2">
                  Unable to search reservations at this time. This could be due to:
                </p>
                <ul className="text-sm text-white/80 list-disc list-inside space-y-1">
                  <li>Network connection issues</li>
                  <li>Server temporarily unavailable</li>
                  <li>Invalid search parameters</li>
                </ul>
                {(errorByConfirmation || errorByGuest) && (
                  <details className="mt-2">
                    <summary className="text-xs text-red-300 cursor-pointer">Technical Details</summary>
                    <p className="text-xs text-red-200 mt-1 font-mono">
                      {errorByConfirmation?.message || errorByGuest?.message}
                    </p>
                  </details>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsSearching(false);
                    setFoundReservation(null);
                  }}
                  className="mt-3 text-sm text-[var(--color-sand)] hover:text-[var(--color-sand)]/80 underline"
                >
                  Try again
                </button>
              </div>
            )}
          </section>
        );
      
      case 'guest-info':
        return (
          <section className="space-y-6">
            <h2 className="text-lg font-semibold text-[var(--color-sand)]">Guest Information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={onChange('firstName')}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={onChange('lastName')}
                  required
                />
              </div>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={onChange('email')}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                                <PhoneInput
                  country={formData.phoneCountryCode}
                    value={formData.phone}
                  onChange={((value: string, country: any) => {
                    setFormData(prev => ({
                      ...prev,
                      phone: value,
                      phoneCountryCode: country.countryCode.toLowerCase()
                    }));
                  }) as any}
                  inputStyle={{
                    width: '100%',
                    height: '48px',
                    backgroundColor: 'rgba(var(--color-darkGreen1), 0.5)',
                    border: '1px solid rgba(var(--color-sand), 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '16px'
                  }}
                  buttonStyle={{
                    backgroundColor: 'rgba(var(--color-darkGreen1), 0.5)',
                    border: '1px solid rgba(var(--color-sand), 0.2)',
                    borderRadius: '8px 0 0 8px'
                  }}
                  dropdownStyle={{
                    backgroundColor: 'var(--color-darkGreen2)',
                    border: '1px solid rgba(var(--color-sand), 0.2)',
                    borderRadius: '8px'
                  }}
                  searchStyle={{
                    backgroundColor: 'var(--color-darkGreen1)',
                    color: 'white',
                    border: '1px solid rgba(var(--color-sand), 0.2)'
                  }}
                  />
                </div>
              </div>

            <div>
              <Label htmlFor="nationality">Nationality</Label>
              <ReactFlagsSelect
                selected={formData.nationality}
                onSelect={(countryCode) => {
                  setFormData(prev => ({
                    ...prev,
                    nationality: countryCode
                  }));
                }}
                placeholder="Select your nationality"
                searchable
                className="flag-select"
                selectButtonClassName="flag-select-button"
                optionsSize={14}
                customLabels={{
                  US: "United States",
                  CR: "Costa Rica",
                  MX: "Mexico",
                  CA: "Canada",
                  GB: "United Kingdom",
                  ES: "Spain",
                  FR: "France",
                  DE: "Germany",
                  IT: "Italy",
                  BR: "Brazil",
                  AR: "Argentina",
                  CL: "Chile",
                  CO: "Colombia",
                  PE: "Peru",
                  VE: "Venezuela"
                }}
              />
            </div>
          </section>
        );

      case 'room-assignment':
        return (
          <section className="space-y-6">
            <h2 className="text-lg font-semibold text-[var(--color-sand)]">Room Assignment</h2>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="checkInDate">Check-in Date</Label>
                <Input
                  id="checkInDate"
                  type="date"
                  name="checkInDate"
                  value={formData.checkInDate}
                  onChange={onChange('checkInDate')}
                  required
                />
              </div>
              <div>
                <Label htmlFor="checkOutTime">Check-out Time</Label>
                <Input
                  id="checkOutTime"
                  type="time"
                  name="checkOutTime"
                  value={formData.checkOutTime}
                  onChange={onChange('checkOutTime')}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="roomPreferences">Room Preferences</Label>
              <Select
                id="roomPreferences"
                value={formData.roomPreferences}
                onChange={onChange('roomPreferences')}
              >
                <option value="">No specific preference</option>
                <option value="high-floor">High Floor</option>
                <option value="low-floor">Low Floor</option>
                <option value="quiet">Quiet Room</option>
                <option value="accessible">Accessible Room</option>
              </Select>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-[var(--color-sand)]">Additional Services</h3>
              <div className="flex items-center gap-8">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.parkingRequired}
                    onChange={(e) => onChange('parkingRequired')(e as any)}
                    className="rounded border-[var(--color-sand)]/20"
                  />
                  <span>Parking</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.breakfastIncluded}
                    onChange={(e) => onChange('breakfastIncluded')(e as any)}
                    className="rounded border-[var(--color-sand)]/20"
                  />
                  <span>Breakfast</span>
                </label>
              </div>
            </div>
          </section>
        );

      case 'payment':
        return (
          <section className="space-y-6">
            <h2 className="text-lg font-semibold text-[var(--color-sand)]">Payment Information</h2>
            
            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select
                id="paymentMethod"
                value={formData.paymentMethod}
                onChange={onChange('paymentMethod')}
                required
              >
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="cash">Cash</option>
              </Select>
            </div>

            {formData.paymentMethod.includes('card') && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    name="cardNumber"
                    placeholder="0000 0000 0000 0000"
                    value={formData.cardNumber}
                    onChange={onChange('cardNumber')}
                    required
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="cardExpiry">Expiry Date</Label>
                    <Input
                      id="cardExpiry"
                      name="cardExpiry"
                      placeholder="MM/YY"
                      value={formData.cardExpiry}
                      onChange={onChange('cardExpiry')}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="cardCvv">CVV</Label>
                    <Input
                      id="cardCvv"
                      name="cardCvv"
                      type="password"
                      maxLength={4}
                      value={formData.cardCvv}
                      onChange={onChange('cardCvv')}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4">
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={formData.acceptedTerms}
                  onChange={(e) => onChange('acceptedTerms')(e as any)}
                  className="mt-1 rounded border-[var(--color-sand)]/20"
                  required
                />
                <span className="text-sm text-[var(--color-sand)]/70">
                  I accept the hotel's terms and conditions, including check-out time, 
                  smoking policy, and damage responsibility.
                </span>
              </label>
            </div>
          </section>
        );

      case 'confirmation':
        return (
          <section className="space-y-6">
            <div className="rounded-lg bg-[var(--color-sand)]/10 p-6">
              <h2 className="text-lg font-semibold text-[var(--color-sand)]">Reservation Summary</h2>
              <dl className="mt-4 space-y-3">
                <div className="flex justify-between">
                  <dt className="text-[var(--color-sand)]/70">Guest Name</dt>
                  <dd className="font-medium">{`${formData.firstName} ${formData.lastName}`}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--color-sand)]/70">Room</dt>
                  <dd className="font-medium">{formData.roomNumber}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--color-sand)]/70">Check-in</dt>
                  <dd className="font-medium">{`${formData.checkInDate} ${formData.checkInTime}`}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--color-sand)]/70">Check-out</dt>
                  <dd className="font-medium">{formData.checkOutTime}</dd>
                </div>
                {formData.specialRequests && (
                  <div className="pt-3 border-t border-[var(--color-sand)]/10">
                    <dt className="text-[var(--color-sand)]/70">Special Requests</dt>
                    <dd className="mt-1">{formData.specialRequests}</dd>
                  </div>
                )}
              </dl>
            </div>
          </section>
        );
    }
  };

  const handleNext = () => {
    const steps: LocalState['step'][] = ['search', 'guest-info', 'room-assignment', 'payment', 'confirmation'];
    const currentIndex = steps.indexOf(formData.step);
    
    // Only allow proceeding from search step if a reservation is found
    if (formData.step === 'search' && !foundReservation) {
      return;
    }
    
    if (currentIndex < steps.length - 1) {
      setFormData(prev => ({ ...prev, step: steps[currentIndex + 1] }));
    }
  };

  const handleBack = () => {
    const steps: LocalState['step'][] = ['search', 'guest-info', 'room-assignment', 'payment', 'confirmation'];
    const currentIndex = steps.indexOf(formData.step);
    if (currentIndex > 0) {
      setFormData(prev => ({ ...prev, step: steps[currentIndex - 1] }));
    }
  };

  if (isLoadingCheckIns) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-darkGreen1)]">
        <p className="text-[var(--color-sand)]">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-darkGreen1)] text-white py-8 px-4">
      <style>{`
        .flag-select-button {
          background-color: rgba(var(--color-darkGreen1), 0.5) !important;
          border: 1px solid rgba(var(--color-sand), 0.2) !important;
          border-radius: 8px !important;
          color: white !important;
          height: 48px !important;
        }
        .flag-select-button:hover {
          border-color: rgba(var(--color-sand), 0.3) !important;
        }
        .flag-select-button:focus {
          border-color: var(--color-sand) !important;
          box-shadow: 0 0 0 2px rgba(var(--color-sand), 0.5) !important;
        }
        .flag-select .flag-select__options {
          background-color: var(--color-darkGreen2) !important;
          border: 1px solid rgba(var(--color-sand), 0.2) !important;
          border-radius: 8px !important;
          max-height: 200px !important;
        }
        .flag-select .flag-select__option {
          color: white !important;
        }
        .flag-select .flag-select__option:hover {
          background-color: rgba(var(--color-sand), 0.1) !important;
        }
        .flag-select .flag-select__option--selected {
          background-color: rgba(var(--color-sand), 0.2) !important;
        }
        .flag-select .flag-select__search {
          background-color: var(--color-darkGreen1) !important;
          color: white !important;
          border: 1px solid rgba(var(--color-sand), 0.2) !important;
          border-radius: 4px !important;
        }
        .flag-select .flag-select__search::placeholder {
          color: rgba(var(--color-sand), 0.5) !important;
        }
      `}</style>
      <div className="max-w-5xl mx-auto">
        <div className="bg-[var(--color-darkGreen2)]/90 backdrop-blur-lg rounded-xl shadow-2xl border border-[var(--color-sand)]/10 overflow-hidden">
          <div className="bg-gradient-to-r from-[var(--color-darkGreen1)] to-[var(--color-darkGreen2)] px-8 py-6 border-b border-[var(--color-sand)]/10">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate('/frontdesk')}
                className="flex items-center gap-2 px-4 py-2 text-[var(--color-sand)] hover:text-[var(--color-sand)]/80 hover:bg-[var(--color-sand)]/10 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Regresar
              </button>
              <div className="flex-1 text-center">
                <h1 className="text-2xl font-bold text-[var(--color-sand)]">Guest Check-in</h1>
                <p className="text-[var(--color-sand)]/70 text-sm mt-1">Complete the form below to process the check-in</p>
              </div>
              <div className="w-24"></div> {/* Spacer for centering */}
            </div>
          </div>

          <div className="p-8">
            {/* Indicador de progreso */}
            <div className="mb-8">
              <div className="flex justify-between text-sm mb-2">
                <span className={formData.step === 'search' ? 'text-[var(--color-sand)]' : 'text-[var(--color-sand)]/50'}>Search</span>
                <span className={formData.step === 'guest-info' ? 'text-[var(--color-sand)]' : 'text-[var(--color-sand)]/50'}>Guest Info</span>
                <span className={formData.step === 'room-assignment' ? 'text-[var(--color-sand)]' : 'text-[var(--color-sand)]/50'}>Room</span>
                <span className={formData.step === 'payment' ? 'text-[var(--color-sand)]' : 'text-[var(--color-sand)]/50'}>Payment</span>
                <span className={formData.step === 'confirmation' ? 'text-[var(--color-sand)]' : 'text-[var(--color-sand)]/50'}>Confirm</span>
              </div>
              <div className="w-full bg-[var(--color-darkGreen1)]/50 rounded-full h-2">
                <div 
                  className="bg-[var(--color-sand)] h-2 rounded-full transition-all duration-300" 
                  style={{ 
                    width: `${
                      formData.step === 'search' ? '20%' :
                      formData.step === 'guest-info' ? '40%' :
                      formData.step === 'room-assignment' ? '60%' :
                      formData.step === 'payment' ? '80%' :
                      '100%'
                    }`
                  }}
                ></div>
              </div>
            </div>

            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {renderStep()}

              <div className="flex justify-between pt-6 border-t border-[var(--color-sand)]/10">
                {formData.step !== 'search' && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-6 py-2 text-[var(--color-sand)] hover:text-[var(--color-sand)]/80 transition"
                  >
                    ← Back
                  </button>
                )}
                
                <button
                  type={formData.step === 'confirmation' ? 'submit' : 'button'}
                  onClick={formData.step === 'confirmation' ? undefined : handleNext}
                  disabled={isSubmitting || (formData.step === 'search' && !foundReservation)}
                  className="ml-auto rounded-lg bg-[var(--color-sand)] px-6 py-2 font-semibold text-[var(--color-darkGreen1)] shadow-sm transition hover:bg-[var(--color-cream)] disabled:opacity-50"
                >
                  {formData.step === 'confirmation' 
                    ? (isSubmitting ? 'Processing…' : 'Complete Check-In')
                    : formData.step === 'search' && !foundReservation
                    ? 'Search Reservation First'
                    : 'Continue →'}
                </button>
              </div>
            </form>

        {/* Check-ins recientes en tarjetas limpias */}
        {checkIns?.length ? (
          <section className="mt-12">
            <h3 className="mb-4 text-xl font-bold text-[var(--color-sand)]">Recent Check-Ins</h3>
            <ul className="grid gap-4 sm:grid-cols-2">
              {checkIns.map((c) => (
                <li key={c.reservationId} className="rounded-lg border border-[var(--color-sand)]/20 bg-[var(--color-darkGreen2)]/50 p-4 shadow-sm">
                  <p className="text-sm text-white"><span className="font-semibold text-[var(--color-sand)]">Reservation:</span> {c.reservationId}</p>
                  <p className="text-sm text-white"><span className="font-semibold text-[var(--color-sand)]">Guest:</span> {c.guestName}</p>
                  <p className="text-sm text-white"><span className="font-semibold text-[var(--color-sand)]">Room:</span> {c.roomNumber}</p>
                  <p className="text-sm text-white"><span className="font-semibold text-[var(--color-sand)]">Status:</span> {c.paymentStatus}</p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
