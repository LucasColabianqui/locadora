import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { FuncionariosService } from './funcionario.service';
import { Funcionario } from './funcionario.entity';

@Controller('funcionarios')
export class FuncionariosController {
  constructor(private readonly service: FuncionariosService) {}

  @Get()
  findAll(): Promise<Funcionario[]> {
    return this.service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Funcionario> {
    const funcionario = await this.service.findById(Number(id));
    if (!funcionario) throw new NotFoundException('Funcionário não encontrado');
    return funcionario;
  }

  @Post()
  create(@Body() body: Partial<Funcionario>): Promise<Funcionario> {
    return this.service.create(body);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: Partial<Funcionario>,
  ): Promise<void> {
    await this.service.update(Number(id), body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    await this.service.delete(Number(id));
  }
}
