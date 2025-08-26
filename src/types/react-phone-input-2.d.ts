declare module 'react-phone-input-2' {
  export interface PhoneInputProps {
    country?: string;
    value?: string;
    onChange?: (phone: string) => void;
    inputClass?: string;
    containerClass?: string;
    placeholder?: string;
    disabled?: boolean;
  }

  const PhoneInput: React.ComponentType<PhoneInputProps>;
  export default PhoneInput;
}
