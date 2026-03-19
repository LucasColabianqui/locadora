import { IsDateString, IsNotEmpty } from 'class-validator';

export class AvailabilityQueryDto {
  @IsNotEmpty({ message: 'Data de retirada é obrigatória' })
  @IsDateString({}, { message: 'Data de retirada deve estar em formato ISO (YYYY-MM-DD)' })
  dataRetirada: string;

  @IsNotEmpty({ message: 'Data de devolução é obrigatória' })
  @IsDateString({}, { message: 'Data de devolução deve estar em formato ISO (YYYY-MM-DD)' })
  dataDevolucao: string;
}
