// CheckIn.tsx — Rediseño estilo "Hotel Check-in Form"
import { useState } from 'react';
import { useCheckIn } from '../hooks/useCheckIn';
import type { CheckInData } from '../types/checkin';

type LocalState = CheckInData & {
  firstName: string;
  lastName: string;
  phone: string;
  countryCode: string;
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
  const { checkIns, isLoadingCheckIns, isSubmitting, error, validateAndSubmit } = useCheckIn();

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
    email: '',
    countryCode: '+1',
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

  const onChange =
    (name: keyof LocalState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = e.target.value;
      setFormData((prev) => ({
        ...prev,
        [name]: name === 'numberOfGuests' ? Math.max(1, parseInt(value || '1', 10)) : value,
      }));
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
            <div>
              <Label htmlFor="reservationId">Reservation Number</Label>
              <Input
                id="reservationId"
                name="reservationId"
                placeholder="Enter your reservation number"
                value={formData.reservationId}
                onChange={onChange('reservationId')}
                required
              />
            </div>
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
                <div className="flex gap-2">
                  <Select
                    id="countryCode"
                    value={formData.countryCode}
                    onChange={onChange('countryCode')}
                    className="w-24"
                  >
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+34">🇪🇸 +34</option>
                  </Select>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={onChange('phone')}
                    className="flex-1"
                    required
                  />
                </div>
              </div>
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
      <div className="max-w-5xl mx-auto">
        <div className="bg-[var(--color-darkGreen2)]/90 backdrop-blur-lg rounded-xl shadow-2xl border border-[var(--color-sand)]/10 overflow-hidden">
          <div className="bg-gradient-to-r from-[var(--color-darkGreen1)] to-[var(--color-darkGreen2)] px-8 py-6 border-b border-[var(--color-sand)]/10">
            <h1 className="text-center text-2xl font-bold text-[var(--color-sand)]">Guest Check-in</h1>
            <p className="text-center text-[var(--color-sand)]/70 text-sm mt-1">Complete the form below to process the check-in</p>
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
                  disabled={isSubmitting}
                  className="ml-auto rounded-lg bg-[var(--color-sand)] px-6 py-2 font-semibold text-[var(--color-darkGreen1)] shadow-sm transition hover:bg-[var(--color-cream)] disabled:opacity-50"
                >
                  {formData.step === 'confirmation' 
                    ? (isSubmitting ? 'Processing…' : 'Complete Check-In')
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
