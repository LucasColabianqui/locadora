import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from '../domain/clientes/cliente.entity';
import { ClienteRepository } from '../domain/clientes/cliente.repository';

@Injectable()
export class TypeOrmClienteRepository implements ClienteRepository {
  constructor(
    @InjectRepository(Cliente)
    private readonly repo: Repository<Cliente>,
  ) {}

  create(data: Partial<Cliente>): Promise<Cliente> {
    const cliente = this.repo.create(data);
    return this.repo.save(cliente);
  }

  findAll(): Promise<Cliente[]> {
    return this.repo.find();
  }

  findById(id: number): Promise<Cliente | null> {
    return this.repo.findOne({ where: { id } });
  }

  async update(id: number, data: Partial<Cliente>): Promise<void> {
    await this.repo.update(id, data);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
