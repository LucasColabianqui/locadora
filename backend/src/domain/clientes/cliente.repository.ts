import { Cliente } from './cliente.entity';

export interface ClienteRepository {
  create(data: Partial<Cliente>): Promise<Cliente>;
  findAll(): Promise<Cliente[]>;
  findById(id: number): Promise<Cliente | null>;
  update(id: number, data: Partial<Cliente>): Promise<void>;
  delete(id: number): Promise<void>;
}
