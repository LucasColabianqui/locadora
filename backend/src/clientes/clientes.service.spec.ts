import { Test, TestingModule } from '@nestjs/testing';
import { ClientesService } from './clientes.service';
import { ClientesDomainService } from '../domain/clientes/clientes.service';
import { NotFoundError } from '../domain/errors';
import { NotFoundException } from '@nestjs/common';

describe('ClientesService', () => {
  let service: ClientesService;
  let moduleRef: TestingModule;

  beforeEach(async () => {
    const mockDomain = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    moduleRef = await Test.createTestingModule({
      providers: [
        ClientesService,
        { provide: ClientesDomainService, useValue: mockDomain },
      ],
    }).compile();

    service = moduleRef.get<ClientesService>(ClientesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('translates NotFoundError into NotFoundException on findOne', async () => {
    const domain = moduleRef.get<ClientesDomainService>(ClientesDomainService);
    jest
      .spyOn(domain, 'findOne')
      .mockRejectedValue(new NotFoundError('Cliente', 5));
    await expect(service.findOne(5)).rejects.toBeInstanceOf(NotFoundException);
  });
});
