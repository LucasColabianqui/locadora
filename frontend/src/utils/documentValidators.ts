import { normalizeDigits } from './documentMasks';

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export function isValidCpf(cpf: string): boolean {
  const digits = normalizeDigits(cpf);

  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) {
    return false;
  }

  const base = digits.slice(0, 9);
  const firstCheckDigit = calculateCpfCheckDigit(base, 10);
  const secondCheckDigit = calculateCpfCheckDigit(`${base}${firstCheckDigit}`, 11);

  return digits === `${base}${firstCheckDigit}${secondCheckDigit}`;
}

function calculateCpfCheckDigit(base: string, weightStart: number): string {
  const sum = base
    .split('')
    .reduce((acc, current, index) => acc + Number(current) * (weightStart - index), 0);

  const remainder = (sum * 10) % 11;
  return remainder === 10 ? '0' : String(remainder);
}

export function isValidCnh(cnh: string): boolean {
  const digits = normalizeDigits(cnh);

  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) {
    return false;
  }

  const baseDigits = digits.slice(0, 9).split('').map(Number);
  const checkDigit1 = Number(digits[9]);
  const checkDigit2 = Number(digits[10]);

  const sum1 = baseDigits.reduce((acc, current, index) => acc + current * (9 - index), 0);
  let calculatedDigit1 = sum1 % 11;
  if (calculatedDigit1 >= 10) {
    calculatedDigit1 = 0;
  }

  const sum2 = baseDigits.reduce((acc, current, index) => acc + current * (index + 1), 0);
  let calculatedDigit2 = sum2 % 11;
  if (calculatedDigit2 >= 10) {
    calculatedDigit2 = 0;
  }

  return checkDigit1 === calculatedDigit1 && checkDigit2 === calculatedDigit2;
}
