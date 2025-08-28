declare module 'react-flags-select' {
  export interface FlagsSelectProps {
    selected?: string;
    onSelect?: (countryCode: string) => void;
    placeholder?: string;
    searchable?: boolean;
    searchPlaceholder?: string;
    disabled?: boolean;
    className?: string;
    selectButtonClassName?: string;
    customLabels?: Record<string, string>;
    countries?: string[];
    blacklistCountries?: boolean;
    showSelectedLabel?: boolean;
    showOptionLabel?: boolean;
    selectedSize?: number;
    optionsSize?: number;
    alignOptionsToRight?: boolean;
    fullWidth?: boolean;
  }

  const ReactFlagsSelect: React.ComponentType<FlagsSelectProps>;
  export default ReactFlagsSelect;
}
