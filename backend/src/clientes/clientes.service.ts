import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { ClientesDomainService } from '../domain/clientes/clientes.service';
import { Cliente } from '../domain/clientes/cliente.entity';
import { NotFoundError } from '../domain/errors';

@Injectable()
export class ClientesService {
  private readonly logger = new Logger(ClientesService.name);

  constructor(private readonly domain: ClientesDomainService) {}

  async create(data: Partial<Cliente>) {
    try {
      this.logger.debug(`Criando cliente com dados: ${JSON.stringify(data)}`);
      return await this.domain.create(data);
    } catch (error) {
      this.logger.error(`Erro ao criar cliente: ${error.message}`, error.stack);
      throw this.handleError(error);
    }
  }

  async findAll() {
    try {
      this.logger.debug('Buscando todos os clientes');
      return await this.domain.findAll();
    } catch (error) {
      this.logger.error(`Erro ao buscar clientes: ${error.message}`, error.stack);
      throw this.handleError(error);
    }
  }

  async findOne(id: number) {
    try {
      this.logger.debug(`Buscando cliente com ID: ${id}`);
      return await this.domain.findOne(id);
    } catch (e) {
      if (e instanceof NotFoundError) {
        this.logger.warn(`Cliente não encontrado: ${id}`);
        throw new NotFoundException(e.message);
      }
      throw this.handleError(e);
    }
  }

  async update(id: number, data: Partial<Cliente>) {
    try {
      this.logger.debug(`Atualizando cliente ${id} com dados: ${JSON.stringify(data)}`);
      return await this.domain.update(id, data);
    } catch (e) {
      if (e instanceof NotFoundError) {
        this.logger.warn(`Cliente não encontrado para atualização: ${id}`);
        throw new NotFoundException(e.message);
      }
      this.logger.error(`Erro ao atualizar cliente ${id}: ${e.message}`, e.stack);
      throw this.handleError(e);
    }
  }

  async remove(id: number) {
    try {
      this.logger.debug(`Removendo cliente com ID: ${id}`);
      return await this.domain.remove(id);
    } catch (e) {
      if (e instanceof NotFoundError) {
        this.logger.warn(`Cliente não encontrado para remoção: ${id}`);
        throw new NotFoundException(e.message);
      }
      this.logger.error(`Erro ao remover cliente ${id}: ${e.message}`, e.stack);
      throw this.handleError(e);
    }
  }

  private handleError(error: any) {
    if (error instanceof NotFoundError) {
      return new NotFoundException(error.message);
    }
    if (error.code === '23505') {
      // Unique constraint violation
      return new BadRequestException('Este cliente já existe');
    }
    if (error.code === '23503') {
      // Foreign key violation
      return new BadRequestException('Referência inválida');
    }
    return error;
  }
}
