import { AsYouType, parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js';

export function formatNationalPhone(value: string, country: CountryCode) {
  return new AsYouType(country).input(value.replace(/\D/g, ''));
}

export function normalizePhone(value: string, country: CountryCode) {
  const parsed = parsePhoneNumberFromString(value.replace(/\D/g, ''), country);
  return parsed?.isPossible() ? parsed.number : null;
}

export function parseStoredPhone(value?: string | null) {
  if (!value) return null;
  return parsePhoneNumberFromString(value.startsWith('+') ? value : value.replace(/\D/g, ''), value.startsWith('+') ? undefined : 'BR');
}

export function formatPhone(value?: string | null) {
  return parseStoredPhone(value)?.formatInternational() ?? value ?? '';
}

export function phoneUri(value?: string | null, scheme: 'tel' | 'sms' = 'tel') {
  const parsed = parseStoredPhone(value);
  return parsed ? `${scheme}:${parsed.number}` : null;
}

export function flagForCountry(country: CountryCode) {
  return country.split('').map((character) => String.fromCodePoint(127397 + character.charCodeAt(0))).join('');
}
