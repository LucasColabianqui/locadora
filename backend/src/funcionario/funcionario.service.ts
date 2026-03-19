import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Funcionario } from './funcionario.entity';

@Injectable()
export class FuncionariosService {
  private readonly logger = new Logger(FuncionariosService.name);

  constructor(
    @InjectRepository(Funcionario)
    private readonly repo: Repository<Funcionario>,
  ) {}

  async create(data: Partial<Funcionario>): Promise<Funcionario> {
    try {
      this.logger.debug(`Criando funcionário com dados: ${JSON.stringify(data)}`);
      return await this.repo.save(this.repo.create(data));
    } catch (error) {
      this.logger.error(`Erro ao criar funcionário: ${error.message}`, error.stack);
      throw this.handleDatabaseError(error);
    }
  }

  async findAll(): Promise<Funcionario[]> {
    try {
      this.logger.debug('Buscando todos os funcionários');
      return await this.repo.find();
    } catch (error) {
      this.logger.error(`Erro ao buscar funcionários: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findById(id: number): Promise<Funcionario | null> {
    try {
      this.logger.debug(`Buscando funcionário com ID: ${id}`);
      const funcionario = await this.repo.findOneBy({ id });
      if (!funcionario) {
        this.logger.warn(`Funcionário não encontrado: ${id}`);
        throw new NotFoundException(`Funcionário com ID ${id} não encontrado`);
      }
      return funcionario;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Erro ao buscar funcionário ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(id: number, data: Partial<Funcionario>): Promise<void> {
    try {
      this.logger.debug(`Atualizando funcionário ${id} com dados: ${JSON.stringify(data)}`);
      const funcionario = await this.findById(id);
      if (!funcionario) {
        throw new NotFoundException(`Funcionário com ID ${id} não encontrado`);
      }
      await this.repo.update(id, data);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Erro ao atualizar funcionário ${id}: ${error.message}`, error.stack);
      this.handleDatabaseError(error);
    }
  }

  async delete(id: number): Promise<void> {
    try {
      this.logger.debug(`Removendo funcionário com ID: ${id}`);
      const funcionario = await this.findById(id);
      if (!funcionario) {
        throw new NotFoundException(`Funcionário com ID ${id} não encontrado`);
      }
      await this.repo.delete(id);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Erro ao remover funcionário ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  private handleDatabaseError(error: any) {
    if (error.code === '23505') {
      this.logger.warn(`Violação de constraint único: ${error.detail}`);
      throw new BadRequestException('Este funcionário já existe');
    }
    throw error;
  }
}
