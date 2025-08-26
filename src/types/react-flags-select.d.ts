declare module 'react-flags-select' {
  export interface FlagsSelectProps {
    selected?: string;
    onSelect?: (countryCode: string) => void;
    placeholder?: string;
    searchable?: boolean;
    disabled?: boolean;
    className?: string;
  }

  const ReactFlagsSelect: React.ComponentType<FlagsSelectProps>;
  export default ReactFlagsSelect;
}
