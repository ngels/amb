declare module 'country-telephone-data' {
  interface CountryEntry {
    name: string;
    iso2: string;
    dialCode: string;
    priority?: number;
    format?: string;
    hasAreaCodes?: boolean;
  }

  interface CountryTelephoneData {
    allCountries: CountryEntry[];
    iso2Lookup: Record<string, number>;
    allCountryCodes: Record<string, string[]>;
  }

  const data: CountryTelephoneData;
  export default data;
}
