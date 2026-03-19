import { Cliente } from './cliente.entity';
import { ClienteRepository } from './cliente.repository';
import { NotFoundError } from '../errors';

/**
 * Core business logic for "clientes" use-cases. This class lives in the domain
 * layer and has no dependencies on NestJS or TypeORM. It works against the
 * abstract `ClienteRepository` port.
 */
export class ClientesDomainService {
  constructor(private readonly repository: ClienteRepository) {}

  async create(data: Partial<Cliente>): Promise<Cliente> {
    // domain validations could go here
    return this.repository.create(data);
  }

  async findAll(): Promise<Cliente[]> {
    return this.repository.findAll();
  }

  async findOne(id: number): Promise<Cliente> {
    const cliente = await this.repository.findById(id);
    if (!cliente) {
      throw new NotFoundError('Cliente', id);
    }
    return cliente;
  }

  async update(id: number, data: Partial<Cliente>): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError('Cliente', id);
    }
    await this.repository.update(id, data);
  }

  async remove(id: number): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError('Cliente', id);
    }
    await this.repository.delete(id);
  }
}
