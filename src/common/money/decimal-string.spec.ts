import {
  isPositiveDecimalString,
  normalizePositiveDecimalString,
} from './decimal-string';

describe('decimal-string', () => {
  describe('isPositiveDecimalString', () => {
    it('accepts positive whole amounts', () => {
      expect(isPositiveDecimalString('1')).toBe(true);
      expect(isPositiveDecimalString('100')).toBe(true);
    });

    it('accepts positive fractional amounts', () => {
      expect(isPositiveDecimalString('0.01')).toBe(true);
      expect(isPositiveDecimalString('125.500000')).toBe(true);
    });

    it('rejects zero and invalid values', () => {
      expect(isPositiveDecimalString('0')).toBe(false);
      expect(isPositiveDecimalString('0.00')).toBe(false);
      expect(isPositiveDecimalString('-1')).toBe(false);
      expect(isPositiveDecimalString('1.2345678')).toBe(false);
      expect(isPositiveDecimalString('abc')).toBe(false);
    });
  });

  describe('normalizePositiveDecimalString', () => {
    it('normalizes without floating-point math', () => {
      expect(normalizePositiveDecimalString('0125.500000')).toBe('125.5');
      expect(normalizePositiveDecimalString('10.00')).toBe('10');
    });
  });
});
