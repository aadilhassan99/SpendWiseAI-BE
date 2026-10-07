const DECIMAL_AMOUNT_PATTERN = /^(?:\d+\.\d{1,6}|\d+)$/;

export function isPositiveDecimalString(value: string): boolean {
  if (!DECIMAL_AMOUNT_PATTERN.test(value)) {
    return false;
  }

  const [wholePart, fractionalPart = ''] = value.split('.');
  const normalizedWhole = wholePart.replace(/^0+/, '') || '0';
  if (normalizedWhole !== '0') {
    return true;
  }

  return fractionalPart.split('').some((digit) => digit !== '0');
}

export function normalizePositiveDecimalString(value: string): string {
  if (!isPositiveDecimalString(value)) {
    throw new Error(
      'Amount must be a positive decimal with up to 6 fractional digits',
    );
  }

  const [wholePart, fractionalPart] = value.split('.');
  const normalizedWhole = wholePart.replace(/^0+/, '') || '0';

  if (!fractionalPart) {
    return normalizedWhole;
  }

  const trimmedFraction = fractionalPart.replace(/0+$/, '');
  if (!trimmedFraction) {
    return normalizedWhole;
  }

  return `${normalizedWhole}.${trimmedFraction}`;
}
