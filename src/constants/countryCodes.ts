import countryTelephoneData from 'country-telephone-data';

/**
 * Country telephonic codes for phone number formatting
 * Format: { label: string; code: string }
 */

export interface CountryPhoneCode {
  label: string;
  code: string;
  iso2?: string;
}

const sanitizeDialCode = (dialCode: string): string => {
  const digitsOnly = dialCode.replace(/[^0-9]/g, '');
  return digitsOnly ? `+${digitsOnly}` : '';
};

const buildCountryPhoneCodes = (): CountryPhoneCode[] => {
  const entries: CountryPhoneCode[] = [];
  const seen = new Set<string>();

  countryTelephoneData.allCountries.forEach((country) => {
    if (!country?.dialCode) return;
    const normalizedCode = sanitizeDialCode(country.dialCode);
    if (!normalizedCode) return;

    const key = `${country.name}|${normalizedCode}`;
    if (seen.has(key)) return;

    entries.push({
      label: `${country.name} (${normalizedCode})`,
      code: normalizedCode,
      iso2: country.iso2,
    });
    seen.add(key);
  });

  return entries.sort((a, b) => a.label.localeCompare(b.label));
};

export const COUNTRY_PHONE_CODES: CountryPhoneCode[] = buildCountryPhoneCodes();
