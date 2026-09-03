import { AsYouType, parsePhoneNumberFromString, validatePhoneNumberLength, type CountryCode } from 'libphonenumber-js';

export function limitNationalPhone(value: string, country: CountryCode) {
  let digits = value.replace(/\D/g, '');
  while (digits && validatePhoneNumberLength(digits, country) === 'TOO_LONG') {
    digits = digits.slice(0, -1);
  }
  return digits;
}

export function formatNationalPhone(value: string, country: CountryCode) {
  return new AsYouType(country).input(limitNationalPhone(value, country));
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

export function phoneCountry(value?: string | null, fallback: CountryCode = 'BR') {
  return parseStoredPhone(value)?.country ?? fallback;
}

export function phoneNationalValue(value?: string | null) {
  return parseStoredPhone(value)?.formatNational() ?? value ?? '';
}

export function phoneUri(value?: string | null, scheme: 'tel' | 'sms' = 'tel') {
  const parsed = parseStoredPhone(value);
  return parsed ? `${scheme}:${parsed.number}` : null;
}

export function whatsappUri(value?: string | null, message?: string) {
  const parsed = parseStoredPhone(value);
  if (!parsed) return null;
  const number = parsed.number.replace(/\D/g, '');
  return `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
}

export function flagForCountry(country: CountryCode) {
  return country.split('').map((character) => String.fromCodePoint(127397 + character.charCodeAt(0))).join('');
}
