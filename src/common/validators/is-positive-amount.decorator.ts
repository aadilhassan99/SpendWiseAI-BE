import { registerDecorator, ValidationOptions } from 'class-validator';
import { isPositiveDecimalString } from '../money/decimal-string';

export function IsPositiveAmount(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isPositiveAmount',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          return typeof value === 'string' && isPositiveDecimalString(value);
        },
        defaultMessage(): string {
          return 'amount must be a positive decimal with up to 6 fractional digits';
        },
      },
    });
  };
}
