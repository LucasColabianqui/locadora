import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { IsCnh } from '../../common/validators/is-cnh.decorator';
import { IsCpf } from '../../common/validators/is-cpf.decorator';
import { normalizeDigits } from '../../common/validators/document-validation.utils';

export class CreateClienteDto {
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @Length(3, 100)
  nome: string;

  @Transform(({ value }) => normalizeDigits(value))
  @IsString()
  @Matches(/^\d{11}$/, { message: 'CPF deve conter 11 dígitos numéricos' })
  @IsCpf({ message: 'CPF inválido' })
  cpf: string;

  @Transform(({ value }) => normalizeDigits(value))
  @IsString()
  @Matches(/^\d{11}$/, { message: 'CNH deve conter 11 dígitos numéricos' })
  @IsCnh({ message: 'CNH inválida' })
  cnh: string;

  @IsString()
  telefone: string;

  @IsEmail({}, { message: 'Email inválido. Use o formato nome@dominio.com' })
  email: string;
}
