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
import { CategoriasService } from './categoria.service';
import { Categoria } from './categoria.entity';

@Controller('categorias')
export class CategoriasController {
  constructor(private readonly service: CategoriasService) {}

  @Get()
  findAll(): Promise<Categoria[]> {
    return this.service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Categoria> {
    const categoria = await this.service.findById(Number(id));
    if (!categoria) throw new NotFoundException('Categoria não encontrada');
    return categoria;
  }

  @Post()
  create(@Body() body: Partial<Categoria>): Promise<Categoria> {
    return this.service.create(body);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: Partial<Categoria>,
  ): Promise<void> {
    await this.service.update(Number(id), body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    await this.service.delete(Number(id));
  }
}
