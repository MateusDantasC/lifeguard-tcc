export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;

export const passwordRequirements = [
  { key: 'length', label: `De ${PASSWORD_MIN_LENGTH} a ${PASSWORD_MAX_LENGTH} caracteres`, test: (value: string) => value.length >= PASSWORD_MIN_LENGTH && value.length <= PASSWORD_MAX_LENGTH },
  { key: 'lowercase', label: 'Uma letra minúscula', test: (value: string) => /[a-zà-öø-ÿ]/.test(value) },
  { key: 'uppercase', label: 'Uma letra maiúscula', test: (value: string) => /[A-ZÀ-ÖØ-Þ]/.test(value) },
  { key: 'number', label: 'Um número', test: (value: string) => /\d/.test(value) },
  { key: 'special', label: 'Um caractere especial, como !, @ ou #', test: (value: string) => /[^\p{L}\p{N}\s]/u.test(value) },
] as const;

export function isStrongPassword(value: string) {
  return passwordRequirements.every((requirement) => requirement.test(value));
}

export function passwordValidationMessage(value: string) {
  const missing = passwordRequirements.find((requirement) => !requirement.test(value));
  return missing ? `A senha precisa ter ${missing.label.toLowerCase()}.` : null;
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
