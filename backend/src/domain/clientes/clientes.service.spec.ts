import { ClientesDomainService } from './clientes.service';
import { NotFoundError } from '../errors';

describe('ClientesDomainService', () => {
  let service: ClientesDomainService;
  let repo: jest.Mocked<import('./cliente.repository').ClienteRepository>;

  beforeEach(() => {
    repo = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    service = new ClientesDomainService(repo);
  });

  it('throws NotFoundError when findOne misses', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(service.findOne(123)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('throws NotFoundError when updating non-existent cliente', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(service.update(1, { nome: 'x' })).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('throws NotFoundError when removing non-existent cliente', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(service.remove(1)).rejects.toBeInstanceOf(NotFoundError);
  });
});
