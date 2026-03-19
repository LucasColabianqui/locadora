import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { isValidCpf } from './document-validation.utils';

export function IsCpf(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isCpf',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return isValidCpf(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} deve ser um CPF valido`;
        },
      },
    });
  };
}
