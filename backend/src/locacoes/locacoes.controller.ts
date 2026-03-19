import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  NotFoundException,
} from '@nestjs/common';
import { LocacoesService } from './locacoes.service';
import { Locacao } from './locacao.entity';

@Controller('locacoes')
export class LocacoesController {
  constructor(private readonly service: LocacoesService) {}

  @Get()
  findAll(): Promise<Locacao[]> {
    return this.service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Locacao> {
    const locacao = await this.service.findById(Number(id));
    if (!locacao) throw new NotFoundException('Locação não encontrada');
    return locacao;
  }

  @Post()
  create(
    @Body()
    body: {
      clienteId: number;
      veiculoId: number;
      funcionarioId: number;
      dataRetirada: string;
      dataDevolucaoPrevista: string;
      valorPrevisto: number | string;
    },
  ): Promise<Locacao> {
    return this.service.create({
      clienteId: body.clienteId,
      veiculoId: body.veiculoId,
      funcionarioId: body.funcionarioId,
      dataRetirada: new Date(body.dataRetirada),
      dataDevolucaoPrevista: new Date(body.dataDevolucaoPrevista),
      valorPrevisto: typeof body.valorPrevisto === 'string' 
        ? parseFloat(body.valorPrevisto) 
        : body.valorPrevisto,
    });
  }

  @Post(':id/finalizar')
  async finalizar(
    @Param('id') id: string,
    @Body() body: { valorFinal: number },
  ): Promise<{ message: string }> {
    await this.service.finalizar(Number(id), body.valorFinal);
    return { message: 'Locação finalizada com sucesso' };
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    await this.service.delete(Number(id));
  }
}
