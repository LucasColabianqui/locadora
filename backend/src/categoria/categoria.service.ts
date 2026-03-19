import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Categoria } from './categoria.entity';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectRepository(Categoria) private readonly repo: Repository<Categoria>,
    private readonly dataSource: DataSource,
  ) {}

  create(data: Partial<Categoria>): Promise<Categoria> {
    return this.repo.save(this.repo.create(data));
  }

  findAll(): Promise<Categoria[]> {
    return this.repo.find();
  }

  findById(id: number): Promise<Categoria | null> {
    return this.repo.findOneBy({ id });
  }

  async update(id: number, data: Partial<Categoria>): Promise<void> {
    await this.repo.update(id, data);
  }

  async delete(id: number): Promise<void> {
    try {
      // Verificar se há veículos usando esta categoria via raw query
      const result = await this.dataSource.query(
        'SELECT COUNT(*) as count FROM veiculo WHERE "categoriaId" = $1',
        [id]
      );

      const veiculosCount = parseInt(result[0]?.count || '0', 10);
      
      if (veiculosCount > 0) {
        throw new BadRequestException(
          `Não é possível deletar esta categoria. Existem ${veiculosCount} veículo(s) usando-a.`
        );
      }

      await this.repo.delete(id);
    } catch (err) {
      if (err instanceof BadRequestException) {
        throw err;
      }
      throw new BadRequestException('Erro ao deletar categoria. Pode haver veículos associados.');
    }
  }
}
