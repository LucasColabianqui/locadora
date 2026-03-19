import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import { VeiculosService } from './veiculos.service';
import { Veiculo, StatusVeiculo } from './veiculo.entity';
import { AvailabilityQueryDto } from './dto/availability-query.dto';

@Controller('veiculos')
export class VeiculosController {
  constructor(private readonly service: VeiculosService) {}

  @Get()
  findAll(): Promise<Veiculo[]> {
    return this.service.findAll();
  }

  @Get('disponivel')
  async findAvailable(
    @Query(new ValidationPipe({ transform: true })) query: AvailabilityQueryDto,
  ): Promise<Veiculo[]> {
    return this.service.findAvailableByDateRange(query.dataRetirada, query.dataDevolucao);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Veiculo> {
    const veiculo = await this.service.findById(Number(id));
    if (!veiculo) throw new NotFoundException('Veículo não encontrado');
    return veiculo;
  }

  @Post()
  create(@Body() body: Partial<Veiculo>): Promise<Veiculo> {
    return this.service.create({
      ...body,
      status: body.status ? body.status : StatusVeiculo.DISPONIVEL,
    });
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: Partial<Veiculo>,
  ): Promise<void> {
    await this.service.update(Number(id), body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    await this.service.delete(Number(id));
  }
}
