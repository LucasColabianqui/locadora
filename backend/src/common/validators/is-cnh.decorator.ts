import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { isValidCnh } from './document-validation.utils';

export function IsCnh(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isCnh',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return isValidCnh(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} deve ser uma CNH valida`;
        },
      },
    });
  };
}
